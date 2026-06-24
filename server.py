"""
Comic Crafter AI — FastAPI Backend  v3.0  (Apple Silicon optimised)
====================================================================
Image model: stabilityai/sd-turbo   (~2 GB, 1-4 steps, MPS-safe)
  vs SDXL:   stabilityai/sdxl-base  (~13 GB float32 on MPS → swap/heat)

Why sd-turbo?
  • Only ~2 GB weights — loads entirely in unified memory, zero swap
  • 1–4 inference steps → each panel in ~5-10 s on M3 Max
  • Native float16 on MPS (no NaN/abort issues SDXL had)
  • Output: 512×512 (SDXL was 768×512 minimum — 3× fewer pixels)
  • Quality is more than sufficient for comic panels

Pipeline: strict two-phase, no model overlap
  Phase 1 — Ollama (Mistral q4_0, ~4 GB): story + prompts + dialogue
  Phase 2 — sd-turbo (~2 GB): images
  Both phases end with an explicit memory eviction before next phase starts.

Start:
    ollama pull mistral:7b-instruct-q4_0
    uvicorn server:app --host 0.0.0.0 --port 8000
"""

from __future__ import annotations

import base64
import gc
import io
import json
import math
import re
import textwrap
import traceback
from pathlib import Path
from typing import Any, Dict, List, Optional

import requests
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image, ImageDraw, ImageFont
from pydantic import BaseModel

# ─────────────────────────────────────────────────────────────────────────────
# Device  (CUDA → MPS → CPU)
# ─────────────────────────────────────────────────────────────────────────────
def _detect_device() -> str:
    if torch.cuda.is_available():
        return "cuda"
    if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        return "mps"
    return "cpu"

DEVICE = _detect_device()
# CUDA → float16 | MPS/CPU → float32 (float16 on MPS produces NaN → black images)
DTYPE = torch.float16 if DEVICE == "cuda" else torch.float32
print(f"[device] {DEVICE}  dtype={DTYPE}")

# ─────────────────────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────────────────────
CONFIG_PATH = Path(__file__).parent / "config.json"

DEFAULT_CONFIG: Dict[str, Any] = {
    # sd-turbo: ~2 GB, 1-4 steps, 512×512 native — perfect for Apple Silicon
    "image_model_path": "stabilityai/sd-turbo",
    "ollama_model":     "mistral:7b-instruct-q4_0",
    "ollama_base_url":  "http://localhost:11434",
    "default_settings": {
        "temperature":        0.7,
        # sd-turbo is a distilled turbo model — 4 steps is already high quality
        "num_inference_steps": 4,
        "guidance_scale":      0.0,   # sd-turbo works best with guidance=0
        # 512×512 is sd-turbo's native resolution — do NOT go higher
        "image_width":  512,
        "image_height": 512,
        "negative_prompt": (
            "blurry, deformed, bad anatomy, ugly, poorly drawn, low quality, "
            "watermark, text, signature, duplicate, multiple panels, border"
        ),
    },
    "prompt_template": {
        "narrative_prompt_template": (
            'Write a short comic book story narrative (200-400 words) based on: "{user_prompt}". '
            "Feature the character(s): {character_str}. Avoid stereotypes. "
            "Output ONLY the narrative — beginning, middle, end. No title or moral."
        ),
        "title_prompt_template": (
            "Generate ONLY a concise title (5 words max) for this story:\n\n"
            "---\n{story_narrative}\n---\n\nTitle:"
        ),
        "moral_prompt_template": (
            "Generate ONLY a brief moral or theme (1-2 sentences) for this story:\n\n"
            "---\n{story_narrative}\n---\n\nMoral:"
        ),
        "panel_prompt_template": (
            "Write a SHORT visual description (MAX 40 words) for a comic panel image generator.\n"
            "Panel {panel_num} of {num_panels} — focus on the {stage} stage.\n\n"
            'Story: "{story_context}"\n'
            "Characters: {character_str}\n\n"
            "Rules: visual only, no text/dialogue, no panel numbers, no markdown.\n\n"
            "Description:"
        ),
        "dialogue_prompt_template": (
            "Write ONE short line of dialogue (max 15 words) for this comic panel. "
            "Output ONLY the dialogue. If none fits, output NONE.\n\n"
            "Characters: {character_str}\n"
            'Panel: "{panel_description}"\n\n'
            "Dialogue:"
        ),
    },
}

ART_STYLE_SUFFIXES: Dict[str, str] = {
    "comic":      ", comic book style, vibrant colors, detailed line art",
    "anime":      ", anime style, vibrant colors, manga illustration",
    "fantasy":    ", fantasy art, detailed digital painting",
    "scifi":      ", sci-fi concept art, futuristic",
    "pixel":      ", pixel art, 16-bit retro style",
    "lineart":    ", black and white line art, minimalist",
    "watercolor": ", watercolor painting, soft edges",
    "none":       "",
}


def _load_config() -> Dict[str, Any]:
    if CONFIG_PATH.is_file():
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                user_cfg = json.load(f)
            merged = {**DEFAULT_CONFIG, **user_cfg}
            merged["default_settings"] = {
                **DEFAULT_CONFIG["default_settings"],
                **user_cfg.get("default_settings", {}),
            }
            merged["prompt_template"] = {
                **DEFAULT_CONFIG["prompt_template"],
                **user_cfg.get("prompt_template", {}),
            }
            return merged
        except Exception as e:
            print(f"[config] Load error: {e}. Using defaults.")
    return DEFAULT_CONFIG


CONFIG       = _load_config()
DS           = CONFIG["default_settings"]
PT           = CONFIG["prompt_template"]
OLLAMA_BASE  = CONFIG.get("ollama_base_url", "http://localhost:11434")
OLLAMA_MODEL = CONFIG.get("ollama_model", "mistral:7b-instruct-q4_0")

# ─────────────────────────────────────────────────────────────────────────────
# Memory helpers
# ─────────────────────────────────────────────────────────────────────────────

def _free_ram() -> None:
    gc.collect()
    if DEVICE == "cuda":
        torch.cuda.empty_cache()
        torch.cuda.synchronize()
    elif DEVICE == "mps":
        torch.mps.empty_cache()
    print("[mem] RAM cache cleared.")


def _unload_ollama() -> None:
    """Evict Mistral from Ollama's RAM via keep_alive=0 before loading image model."""
    try:
        requests.post(
            f"{OLLAMA_BASE}/api/generate",
            json={"model": OLLAMA_MODEL, "keep_alive": 0, "prompt": ""},
            timeout=10,
        )
        print("[mem] Ollama model evicted from RAM.")
    except Exception as e:
        print(f"[mem] Ollama evict warning: {e}")
    _free_ram()


# ─────────────────────────────────────────────────────────────────────────────
# sd-turbo pipeline  (lazy load, explicit unload)
# ─────────────────────────────────────────────────────────────────────────────
_pipe = None


def _get_pipe():
    global _pipe
    if _pipe is not None:
        return _pipe

    model_id = CONFIG.get("image_model_path", "stabilityai/sd-turbo")
    print(f"[img] Loading {model_id} on {DEVICE} with dtype={DTYPE} …")

    # Use StableDiffusionPipeline directly — sd-turbo is an SD 1.x/2.x model.
    # AutoPipelineForText2Image sometimes downloads wrong variants or extra files.
    from diffusers import StableDiffusionPipeline

    _pipe = StableDiffusionPipeline.from_pretrained(
        model_id,
        torch_dtype=DTYPE,          # float32 on MPS — prevents NaN/black images
        use_safetensors=True,
        safety_checker=None,
        requires_safety_checker=False,
    )
    _pipe = _pipe.to(DEVICE)

    # Memory optimisations
    _pipe.enable_attention_slicing(1)
    if hasattr(_pipe, "vae"):
        if hasattr(_pipe.vae, "enable_slicing"):
            _pipe.vae.enable_slicing()
        if hasattr(_pipe.vae, "enable_tiling"):
            _pipe.vae.enable_tiling()

    print(f"[img] {model_id} ready on {DEVICE}  dtype={DTYPE}.")
    return _pipe


def _unload_pipe() -> None:
    global _pipe
    if _pipe is not None:
        del _pipe
        _pipe = None
        print("[mem] Image pipeline unloaded.")
    _free_ram()


# ─────────────────────────────────────────────────────────────────────────────
# Ollama LLM helper
# ─────────────────────────────────────────────────────────────────────────────

def _llm(prompt: str, max_tokens: int = 600, temperature: float = 0.7) -> Optional[str]:
    try:
        resp = requests.post(
            f"{OLLAMA_BASE}/api/generate",
            json={
                "model":  OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens,
                    "top_p": 0.9,
                },
            },
            timeout=300,
        )
        resp.raise_for_status()
        return resp.json().get("response", "").strip() or None
    except Exception as e:
        print(f"[llm] Error: {e}")
        return None


def _check_ollama() -> bool:
    try:
        return requests.get(f"{OLLAMA_BASE}/api/tags", timeout=5).status_code == 200
    except Exception:
        return False


# ─────────────────────────────────────────────────────────────────────────────
# Prompt helpers
# ─────────────────────────────────────────────────────────────────────────────
_COMMON = {
    "City","Metropolis","Street","Building","Sky","World","Danger","Storm",
    "Field","Farm","Castle","Forest","Mountain","River","Ocean","Book","Portal",
    "Based","Prompt","Write","Short","Story","Comic","Must","Neutral","Panel",
    "Image","Title","Generate","Narrative","Beginning","Middle","End","Only","Output",
}
_IGNORE = {
    "prompt","character","output","list","name","nan","none","here","are","the",
    "based","on","story","moral","title","narrative","no","specific","not",
    "specified","unnamed","n/a","answer","step","only","names","types","max",
}


def _extract_characters(prompt: str) -> List[str]:
    found = re.findall(r"\b(?:[A-Z][a-z]+|[A-Z]{2,})\b", prompt)
    found += re.findall(r"\b(?:a|an|the)\s+([A-Z][a-z]+)\b", prompt, re.I)
    cleaned = [
        p.title() for p in found
        if p not in _COMMON and len(p) > 1 and p.lower() not in _IGNORE
    ]
    result = sorted(set(cleaned), key=len, reverse=True)[:3]
    return result or ["Character"]


def _clean(text: str, prefixes: List[str]) -> str:
    for pat in prefixes:
        text = re.sub(pat, "", text, flags=re.I | re.S).strip()
    return text.strip('"`[](){}*').strip()


def _trim_clip(text: str, max_words: int = 60) -> str:
    """sd-turbo uses CLIP (77 token limit). Keep well under it."""
    words = text.split()
    if len(words) <= max_words:
        return text
    trimmed = " ".join(words[:max_words])
    print(f"[clip] Trimmed {len(words)} → {max_words} words.")
    return trimmed


# ─────────────────────────────────────────────────────────────────────────────
# Phase 1 — story generation  (Ollama only, no image model loaded)
# ─────────────────────────────────────────────────────────────────────────────

def _generate_story(user_prompt: str) -> Dict[str, Any]:
    chars    = _extract_characters(user_prompt)
    char_str = ", ".join(chars)

    narrative = _llm(
        PT["narrative_prompt_template"].format(
            user_prompt=user_prompt, character_str=char_str),
        max_tokens=600,
    ) or "[Story generation failed]"
    narrative = _clean(narrative, [r"^\s*(Narrative:|Story:)\s*"])

    title = _llm(
        PT["title_prompt_template"].format(story_narrative=narrative[:800]),
        max_tokens=15, temperature=0.5,
    ) or "Generated Comic"
    title = _clean(title, [r"^\s*Title:\s*"]) or "Generated Comic"

    moral = _llm(
        PT["moral_prompt_template"].format(story_narrative=narrative[:800]),
        max_tokens=50, temperature=0.5,
    ) or ""
    moral = _clean(moral, [r"^\s*Moral:\s*"])

    return {"title": title, "storyline": narrative, "moral": moral, "characters": chars}


def _generate_panel_prompts(
    story: Dict[str, Any], user_prompt: str, num_panels: int
) -> List[str]:
    chars    = story.get("characters", ["Character"])
    char_str = ", ".join(chars)
    ctx      = f"{story.get('title','')}. {story.get('storyline','')}"[:800]
    out: List[str] = []

    for i in range(num_panels):
        pn    = i + 1
        ratio = pn / num_panels
        stage = "end" if ratio > 0.75 else ("middle" if ratio > 0.3 else "beginning")

        desc = _llm(
            PT["panel_prompt_template"].format(
                panel_num=pn, num_panels=num_panels,
                story_context=ctx, character_str=char_str, stage=stage,
            ),
            max_tokens=60, temperature=0.6,
        )
        if not desc or len(desc.split()) < 4:
            desc = f"{stage} scene featuring {char_str}"
        desc = _clean(desc, [
            r"^\s*Panel\s*\d+[:\-]\s*",
            r"^\s*Description:\s*",
            r"^\s*\[INST\].*?\[/INST\]\s*",
        ])
        out.append(desc)
    return out


def _generate_dialogues(
    panel_prompts: List[str], story: Dict[str, Any]
) -> List[Optional[str]]:
    chars    = story.get("characters", ["Character"])
    char_str = ", ".join(chars)
    context  = story.get("storyline", "")[:400]
    out: List[Optional[str]] = []

    for desc in panel_prompts:
        raw = _llm(
            PT["dialogue_prompt_template"].format(
                character_str=char_str,
                panel_description=desc,
                story_context=context,
            ),
            max_tokens=30, temperature=0.6,
        )
        if not raw or raw.strip().upper() == "NONE":
            out.append(None)
        else:
            raw = _clean(raw, [r"^\s*Dialogue:\s*"])
            out.append(raw if raw else None)
    return out


# ─────────────────────────────────────────────────────────────────────────────
# Phase 2 — image generation  (sd-turbo only, Ollama evicted first)
# ─────────────────────────────────────────────────────────────────────────────

def _generate_panel_image(
    desc: str,
    art_suffix: str,
    width: int,
    height: int,
    steps: int,
    guidance: float,
) -> Image.Image:
    try:
        pipe = _get_pipe()

        # sd-turbo native res is 512×512; clamp silently if caller goes higher
        w = min(width, 512)
        h = min(height, 512)

        full_prompt = _trim_clip(desc + art_suffix, max_words=60)

        result = pipe(
            prompt=full_prompt,
            num_inference_steps=steps,
            guidance_scale=guidance,
            width=w,
            height=h,
        )
        return result.images[0]

    except Exception as e:
        print(f"[img] Panel error: {e}\n{traceback.format_exc()}")
        return _placeholder_image(width, height, str(e)[:50])


def _placeholder_image(w: int, h: int, msg: str = "Error") -> Image.Image:
    img  = Image.new("RGB", (w, h), (40, 40, 60))
    draw = ImageDraw.Draw(img)
    draw.text((10, h // 2 - 8), msg, fill=(200, 100, 100))
    return img


# ─────────────────────────────────────────────────────────────────────────────
# Comic layout  (pure Pillow)
# ─────────────────────────────────────────────────────────────────────────────

def _build_layout(
    panels: List[Image.Image],
    dialogues: List[Optional[str]],
    title: str,
    pw: int, ph: int,
) -> Image.Image:
    n       = len(panels)
    cols    = min(3, n)
    rows    = math.ceil(n / cols)
    pad     = 16
    th      = 60
    border  = 2

    canvas = Image.new(
        "RGB",
        (cols * (pw + pad) + pad, rows * (ph + pad) + pad + th),
        (10, 10, 15),
    )
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.load_default()

    draw.text((pad, (th - 14) // 2), title, fill=(220, 190, 100), font=font)

    for i, img in enumerate(panels):
        col = i % cols
        row = i // cols
        x   = col * (pw + pad) + pad
        y   = row * (ph + pad) + pad + th

        draw.rectangle(
            [(x - border, y - border), (x + pw + border, y + ph + border)],
            outline=(180, 160, 100), width=border,
        )
        canvas.paste(img.resize((pw, ph), Image.LANCZOS), (x, y))

        if i < len(dialogues) and dialogues[i]:
            _draw_bubble(draw, dialogues[i], x, y, pw, font)

        draw.text((x + 4, y + 2), str(i + 1), fill=(220, 190, 100), font=font)

    return canvas


def _draw_bubble(
    draw: ImageDraw.Draw, text: str,
    px: int, py: int, pw: int, font: Any,
) -> None:
    lines  = textwrap.wrap(text, width=36)
    if not lines:
        return
    lh, pad = 13, 5
    bw  = max(len(l) for l in lines) * 6 + pad * 2
    bh  = len(lines) * lh + pad * 2
    bx  = px + (pw - bw) // 2
    by  = py + 6
    draw.rectangle([(bx, by), (bx + bw, by + bh)],
                   fill=(245, 240, 225), outline=(30, 20, 10), width=1)
    for j, line in enumerate(lines):
        draw.text((bx + pad, by + pad + j * lh), line, fill=(10, 10, 10), font=font)


def _to_b64(img: Image.Image) -> str:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


# ─────────────────────────────────────────────────────────────────────────────
# FastAPI
# ─────────────────────────────────────────────────────────────────────────────
app = FastAPI(title="Comic Crafter AI", version="3.0-sd-turbo")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    prompt:         str
    art_style:      str   = "comic"
    num_panels:     int   = 4      # default 4 (was 6) — faster, less memory
    panel_width:    int   = 512    # sd-turbo native — do not raise above 512
    panel_height:   int   = 512
    num_steps:      int   = 4      # sd-turbo: 1-4 steps is all you need
    guidance_scale: float = 0.0    # sd-turbo works best at 0
    create_layout:  bool  = True
    generate_images:bool  = True


@app.get("/health")
def health():
    return {
        "status":       "ok",
        "ollama":       _check_ollama(),
        "ollama_model": OLLAMA_MODEL,
        "image_model":  CONFIG.get("image_model_path", "stabilityai/sd-turbo"),
        "device":       DEVICE,
        "dtype":        str(DTYPE),
    }


@app.get("/status")
def status():
    return health()


@app.post("/generate")
def generate(req: GenerateRequest):
    if not _check_ollama():
        raise HTTPException(
            status_code=503,
            detail=f"Ollama not running at {OLLAMA_BASE}. Run: ollama serve",
        )

    art_suffix = ART_STYLE_SUFFIXES.get(req.art_style, ART_STYLE_SUFFIXES["comic"])
    num_panels = max(1, min(9, req.num_panels))

    # ═══════════════════════════════════════════════════════════════════
    # PHASE 1 — LLM   (Ollama in RAM, image model NOT loaded)
    # ═══════════════════════════════════════════════════════════════════
    print(f"\n{'='*60}")
    print(f"[phase1] Story generation — {req.prompt[:70]}")
    story = _generate_story(req.prompt)

    print("[phase1] Panel prompts…")
    panel_prompts = _generate_panel_prompts(story, req.prompt, num_panels)

    print("[phase1] Dialogues…")
    dialogues = _generate_dialogues(panel_prompts, story)

    # ═══════════════════════════════════════════════════════════════════
    # PHASE 2 — Images  (Ollama evicted FIRST, then sd-turbo loads)
    # ═══════════════════════════════════════════════════════════════════
    panel_images_b64: List[str]  = []
    layout_b64: Optional[str]    = None

    if req.generate_images:
        print(f"\n[phase2] Evicting Ollama before loading image model…")
        _unload_ollama()          # ← Mistral gone from RAM here

        print(f"[phase2] Generating {num_panels} panels with sd-turbo…")
        pil_panels: List[Image.Image] = []

        for i, desc in enumerate(panel_prompts):
            print(f"  [{i+1}/{num_panels}] {desc[:70]}")
            img = _generate_panel_image(
                desc, art_suffix,
                req.panel_width, req.panel_height,
                req.num_steps, req.guidance_scale,
            )
            pil_panels.append(img)
            panel_images_b64.append(_to_b64(img))

        if req.create_layout and pil_panels:
            print("[phase2] Building layout…")
            layout     = _build_layout(
                pil_panels, dialogues,
                story.get("title", "Comic"),
                req.panel_width, req.panel_height,
            )
            layout_b64 = _to_b64(layout)

        print("[phase2] Unloading image model…")
        _unload_pipe()            # ← sd-turbo freed here

    else:
        print("[phase2] Image generation skipped.")

    print("[done] Request complete.\n")

    return JSONResponse(content={
        "story":         story,
        "panel_prompts": panel_prompts,
        "dialogues":     dialogues,
        "panel_images":  panel_images_b64,
        "layout_image":  layout_b64,
    })