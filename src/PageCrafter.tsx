import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Design tokens (inline to keep the file self-contained) ──────────────── */
const C = {
  bg: "#0a0908",
  surface: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  glassBorder: "rgba(255,255,255,0.10)",
  goldBorder: "rgba(201,168,76,0.35)",
  gold: "#c9a84c",
  goldText: "rgba(201,168,76,0.85)",
  goldDim: "rgba(201,168,76,0.08)",
  main: "rgba(237,232,225,0.88)",
  muted: "rgba(237,232,225,0.45)",
  accent: "#5d9b8a",
  error: "#c05858",
};
const SANS = "'DM Sans', system-ui, sans-serif";
const SERIF = "'Playfair Display', Georgia, serif";
const DISPLAY = "'Bebas Neue', 'Impact', sans-serif";

const glass = (o = 0.04, r = 12) => ({
  background: `rgba(255,255,255,${o})`,
  border: `1px solid ${C.glassBorder}`,
  backdropFilter: `blur(${r}px)`,
  WebkitBackdropFilter: `blur(${r}px)`,
  borderRadius: r,
});

const ART_STYLES = [
  { id: "comic",     label: "Comic Book" },
  { id: "anime",     label: "Anime / Manga" },
  { id: "fantasy",   label: "Fantasy Art" },
  { id: "scifi",     label: "Sci-Fi Concept Art" },
  { id: "pixel",     label: "Pixel Art" },
  { id: "lineart",   label: "Minimalist Line Art" },
  { id: "watercolor",label: "Watercolor" },
  { id: "none",      label: "No Specific Style" },
];

const EXAMPLE_PROMPTS = [
  "A superhero squirrel saves the city park from a litterbug monster.",
  "A lonely astronaut finds a friendly alien on Mars.",
  "Medieval knights discover a time-traveling phone booth.",
  "A group of vegetables starts a rock band.",
];

/* ─── Backend URL ─────────────────────────────────────────────────────────── */
const API_BASE = "http://localhost:8000";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface StoryInfo {
  title: string;
  storyline: string;
  moral: string;
  characters: string[];
}

interface ComicResult {
  story: StoryInfo;
  panel_prompts: string[];
  dialogues: (string | null)[];
  panel_images: string[];     // base64 PNGs
  layout_image: string | null; // base64 PNG
}

type Tab = "layout" | "story" | "downloads";

/* ─── Tiny helpers ────────────────────────────────────────────────────────── */
const Divider = () => (
  <div style={{ height: 1, background: C.border, margin: "1.4rem 0" }} />
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    fontFamily: SANS, fontSize: 9, letterSpacing: "0.26em",
    textTransform: "uppercase", color: C.goldText, fontWeight: 700,
    marginBottom: "0.5rem",
  }}>
    {children}
  </p>
);

function Slider({
  label, value, min, max, step, hint, onChange,
}: {
  label: string; value: number; min: number; max: number;
  step: number; hint?: string; onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ marginBottom: "1.4rem" }}>
      {/* Label row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: hint ? 4 : 8 }}>
        <Label>{label}</Label>
        <span style={{
          fontFamily: DISPLAY, fontSize: 14, color: C.gold,
          background: C.goldDim, border: `1px solid ${C.goldBorder}`,
          borderRadius: 4, padding: "1px 8px", minWidth: 36, textAlign: "center",
        }}>{value}</span>
      </div>

      {hint && (
        <p style={{ fontSize: 11, color: "rgba(237,232,225,0.28)", marginBottom: 8, lineHeight: 1.5 }}>
          {hint}
        </p>
      )}

      {/* Custom track + thumb
           The thumb is 18px wide. To prevent clipping at the edges we pad
           the track container by 9px (half the thumb) on each side and let
           the filled bar also respect that padding. The native <input> stays
           full-width (0 padding) so browser hit-testing remains accurate. */}
      <div style={{ position: "relative", height: 24, display: "flex", alignItems: "center" }}>

        {/* Track — inset 9px each side so thumb never overflows */}
        <div style={{
          position: "absolute", left: 9, right: 9, height: 5,
          borderRadius: 99, background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          {/* Filled portion grows inside the inset track */}
          <div style={{
            width: `${pct}%`, height: "100%",
            borderRadius: 99,
            background: "linear-gradient(90deg, rgba(201,168,76,0.55) 0%, #c9a84c 100%)",
            boxShadow: "0 0 6px rgba(201,168,76,0.35)",
          }} />
        </div>

        {/* Native input — full width, invisible, handles all interaction */}
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            position: "absolute", left: 0, right: 0, width: "100%",
            height: "100%", opacity: 0, cursor: "pointer", margin: 0, zIndex: 2,
          }}
        />

        {/* Thumb — calc(9px + (100% - 18px) * fraction) keeps it fully inside */}
        <div style={{
          position: "absolute",
          left: `calc(9px + (100% - 18px) * ${pct / 100})`,
          top: "50%",
          transform: "translateY(-50%)",
          width: 18, height: 18, borderRadius: "50%",
          background: "linear-gradient(135deg, #e8c55a 0%, #c9a84c 100%)",
          border: "2px solid rgba(255,255,255,0.3)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.6), 0 0 10px rgba(201,168,76,0.45)",
          pointerEvents: "none",
          zIndex: 1,
        }} />
      </div>
    </div>
  );
}

/* ─── Progress bar ────────────────────────────────────────────────────────── */
function ProgressBar({ pct, label }: { pct: number; label: string }) {
  return (
    <div style={{ marginBottom: "0.8rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontFamily: SANS, fontSize: 11, color: C.muted }}>{label}</span>
        <span style={{ fontFamily: DISPLAY, fontSize: 12, color: C.gold }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${C.gold}, ${C.accent})` }}
        />
      </div>
    </div>
  );
}

/* ─── Status badge ────────────────────────────────────────────────────────── */
function StatusBadge({ online }: { online: boolean | null }) {
  const color = online === null ? C.muted : online ? C.accent : C.error;
  const label = online === null ? "Checking…" : online ? "Backend Online" : "Backend Offline";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: "1.2rem" }}>
      <motion.div
        animate={{ opacity: online === null ? [1, 0.3, 1] : 1 }}
        transition={{ repeat: Infinity, duration: 1.4 }}
        style={{ width: 7, height: 7, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }}
      />
      <span style={{ fontFamily: SANS, fontSize: 10, color, letterSpacing: "0.15em", textTransform: "uppercase" }}>
        {label}
      </span>
    </div>
  );
}

/* ─── Panel image card ────────────────────────────────────────────────────── */
function PanelCard({ b64, dialogue, index }: { b64: string; dialogue: string | null; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06 }}
      style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", borderRadius: 4 }}
    >
      <img
        src={`data:image/png;base64,${b64}`}
        alt={`Panel ${index + 1}`}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "brightness(0.9) saturate(1.1)" }}
      />
      {dialogue && (
        <div style={{
          position: "absolute", top: 5, left: 5, right: 5,
          background: "rgba(237,232,225,0.93)", padding: "3px 8px", borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.12)",
        }}>
          <p style={{ fontFamily: SANS, fontSize: 8, color: "#0a0908", lineHeight: 1.4, margin: 0 }}>{dialogue}</p>
        </div>
      )}
      <span style={{
        position: "absolute", bottom: 4, right: 5,
        fontFamily: DISPLAY, fontSize: 11, color: "rgba(237,232,225,0.45)", letterSpacing: "0.1em",
      }}>
        {index + 1}
      </span>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════ */
export default function PageCrafter() {
  /* ── inputs ── */
  const [storyIdea, setStoryIdea]       = useState("Superman saves people in the city");
  const [artStyle, setArtStyle]         = useState("comic");
  const [styleOpen, setStyleOpen]       = useState(false);
  const [advOpen, setAdvOpen]           = useState(false);
  const [numPanels, setNumPanels]       = useState(4);
  const [panelW, setPanelW]             = useState(512);
  const [panelH, setPanelH]             = useState(512);
  const [quality, setQuality]           = useState(4);
  const [guidance, setGuidance]         = useState(0);
  const [genLayout, setGenLayout]       = useState(true);
  const [skipImages, setSkipImages]     = useState(false);

  /* ── state ── */
  const [activeTab, setActiveTab]       = useState<Tab>("layout");
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [generating, setGenerating]     = useState(false);
  const [progress, setProgress]         = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError]               = useState<string | null>(null);
  const [result, setResult]             = useState<ComicResult | null>(null);

  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── backend health check ── */
  useEffect(() => {
    const check = async () => {
      try {
        const r = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(4000) });
        setBackendOnline(r.ok);
      } catch {
        setBackendOnline(false);
      }
    };
    check();
    const id = setInterval(check, 15000);
    return () => clearInterval(id);
  }, []);

  const styleLabel = ART_STYLES.find(s => s.id === artStyle)?.label ?? "Comic Book";

  /* ── fake progress while waiting for backend ── */
  const startFakeProgress = (stages: { pct: number; label: string }[]) => {
    let idx = 0;
    const tick = () => {
      if (idx >= stages.length) return;
      const { pct, label } = stages[idx++];
      setProgress(pct);
      setProgressLabel(label);
    };
    tick();
    progressTimer.current = setInterval(() => {
      if (idx < stages.length) tick();
    }, 18000); // advance every 18 s (rough estimate per stage)
  };

  const stopFakeProgress = () => {
    if (progressTimer.current) clearInterval(progressTimer.current);
    progressTimer.current = null;
  };

  /* ── generate ── */
  const doGenerate = async () => {
    if (!backendOnline) {
      setError("Backend is offline. Start the server: uvicorn server:app --host 0.0.0.0 --port 8000");
      return;
    }
    if (!storyIdea.trim()) {
      setError("Please enter a story idea.");
      return;
    }
    setError(null);
    setResult(null);
    setGenerating(true);
    setProgress(0);
    setProgressLabel("Initialising…");
    setActiveTab("layout");

    const stages = [
      { pct: 5,  label: "Sending request to backend…" },
      { pct: 15, label: "Generating story with Mistral…" },
      { pct: 35, label: "Generating panel descriptions…" },
      { pct: 50, label: "Writing character dialogues…" },
      { pct: 65, label: "Generating panel images with SDXL…" },
      { pct: 88, label: "Building comic layout…" },
    ];
    startFakeProgress(stages);

    try {
      const payload = {
        prompt: storyIdea,
        art_style: artStyle,
        num_panels: numPanels,
        panel_width: panelW,
        panel_height: panelH,
        num_steps: quality,
        guidance_scale: guidance,
        create_layout: genLayout,
        generate_images: !skipImages,
      };

      const resp = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      stopFakeProgress();

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || `HTTP ${resp.status}`);
      }
      const data: ComicResult = await resp.json();
      setResult(data);
      setProgress(100);
      setProgressLabel("Done!");
      setActiveTab("layout");
    } catch (e: any) {
      stopFakeProgress();
      setError(String(e?.message ?? e));
      setProgress(0);
    } finally {
      setGenerating(false);
    }
  };

  /* ── download helper ── */
  const downloadB64 = (b64: string, filename: string) => {
    const a = document.createElement("a");
    a.href = `data:image/png;base64,${b64}`;
    a.download = filename;
    a.click();
  };

  const downloadStory = () => {
    if (!result) return;
    const s = result.story;
    const md = [
      `# ${s.title}`,
      "",
      "## Storyline",
      s.storyline,
      "",
      "## Moral",
      s.moral,
      "",
      "## Characters",
      s.characters.join(", "),
      "",
      "## Panel Descriptions",
      ...result.panel_prompts.map((p, i) => `${i + 1}. ${p}`),
    ].join("\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${s.title.replace(/\s+/g, "_")}_story.md`;
    a.click();
  };

  /* ── tab button ── */
  const TabBtn = ({ id, label }: { id: Tab; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        flex: 1, padding: "0.55rem 0", fontFamily: SANS, fontSize: 11,
        letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer",
        color: activeTab === id ? C.gold : C.muted,
        background: activeTab === id ? C.goldDim : "transparent",
        border: "none",
        borderBottom: activeTab === id ? `2px solid ${C.gold}` : "2px solid transparent",
        transition: "all .2s",
      }}
    >
      {label}
    </button>
  );

  /* ── render ── */
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", flex: 1, minHeight: 0 }}>

      {/* ══ LEFT: Inputs ══ */}
      <div style={{ borderRight: `1px solid ${C.border}`, padding: "2rem 2.5rem", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "1.6rem" }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: C.main, marginBottom: 4 }}>
            Generate
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 12, color: C.muted }}>
            Describe your story and configure the visual output
          </p>
        </div>

        <StatusBadge online={backendOnline} />

        {/* Backend setup note */}
        {backendOnline === false && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              borderRadius: 8, padding: "1rem 1.2rem", marginBottom: "1.4rem",
              background: "rgba(192,88,88,0.08)", border: `1px solid rgba(192,88,88,0.25)`,
            }}
          >
            <p style={{ fontFamily: SANS, fontSize: 11, color: "#e88", lineHeight: 1.7, marginBottom: 8 }}>
              <strong>Backend not detected.</strong> Start the local server:
            </p>
            {[
              "pip install fastapi uvicorn diffusers transformers accelerate torch pillow requests",
              "ollama pull mistral",
              "uvicorn server:app --host 0.0.0.0 --port 8000",
            ].map((cmd, i) => (
              <pre key={i} style={{
                fontFamily: "monospace", fontSize: 10, color: "#fca", background: "rgba(0,0,0,0.35)",
                padding: "4px 8px", borderRadius: 4, marginBottom: 4, overflowX: "auto",
              }}>{cmd}</pre>
            ))}
          </motion.div>
        )}

        {/* How to use */}
        <div style={{ borderRadius: 8, padding: "1rem 1.2rem", marginBottom: "1.4rem", ...glass(0.04, 10) }}>
          <Label>How to use</Label>
          {[
            ["Enter Story Idea", "Type a concept or theme for your comic"],
            ["Choose Art Style", "Pick a visual style for the panels"],
            ["Adjust Settings", "Optionally tune panels, quality, and guidance"],
            ["Generate", "Click Generate — images are created locally via SDXL"],
          ].map(([t, d], i) => (
            <div key={i} style={{ display: "flex", gap: "0.6rem", marginBottom: "0.5rem", alignItems: "flex-start" }}>
              <span style={{ fontFamily: DISPLAY, fontSize: 12, color: C.gold, minWidth: 16, marginTop: 1 }}>{i + 1}.</span>
              <p style={{ fontSize: 12, color: "rgba(237,232,225,0.38)", lineHeight: 1.7 }}>
                <span style={{ color: C.main, fontWeight: 500 }}>{t}: </span>{d}
              </p>
            </div>
          ))}
        </div>

        {/* Example prompts */}
        <div style={{ marginBottom: "1.4rem" }}>
          <Label>Example Prompts</Label>
          {EXAMPLE_PROMPTS.map((p, i) => (
            <button key={i} onClick={() => setStoryIdea(p)} style={{
              textAlign: "left", background: "none", border: "none", padding: "3px 0",
              cursor: "pointer", fontFamily: SANS, fontSize: 12, color: "rgba(237,232,225,0.3)",
              lineHeight: 1.7, display: "flex", gap: "0.5rem", width: "100%", transition: "color .2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = C.goldText)}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(237,232,225,0.3)")}
            >
              <span style={{ color: C.gold }}>◦</span>{p}
            </button>
          ))}
        </div>

        <Divider />

        {/* Story idea */}
        <div style={{ marginBottom: "1.4rem" }}>
          <Label>Your Story Idea</Label>
          <textarea
            value={storyIdea} onChange={e => setStoryIdea(e.target.value)} rows={3}
            placeholder="e.g., A brave knight befriends a dragon…"
            style={{
              width: "100%", borderRadius: 7, padding: "0.85rem 1rem",
              fontFamily: SANS, fontSize: 13, color: C.main, resize: "vertical",
              lineHeight: 1.7, outline: "none", transition: "all .2s",
              ...glass(0.04, 10),
            }}
            onFocus={e => { e.currentTarget.style.borderColor = C.goldBorder; }}
            onBlur={e => { e.currentTarget.style.borderColor = C.glassBorder; }}
          />
        </div>

        {/* Art style */}
        <div style={{ marginBottom: "1.4rem", position: "relative" }}>
          <Label>Art Style</Label>
          <button onClick={() => setStyleOpen(v => !v)} style={{
            width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
            borderRadius: 7, padding: "0.75rem 1rem", fontFamily: SANS, fontSize: 13,
            color: C.main, cursor: "pointer", transition: "all .2s", ...glass(0.04, 10),
          }}>
            <span>{styleLabel}</span>
            <span style={{ color: C.gold, fontSize: 10 }}>{styleOpen ? "▲" : "▼"}</span>
          </button>
          <AnimatePresence>
            {styleOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                style={{
                  position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                  zIndex: 50, borderRadius: 8, overflow: "hidden",
                  background: "#141210", border: `1px solid ${C.border}`,
                  boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                }}
              >
                {ART_STYLES.map(s => (
                  <button key={s.id} onClick={() => { setArtStyle(s.id); setStyleOpen(false); }} style={{
                    width: "100%", textAlign: "left", padding: "0.65rem 1rem",
                    fontFamily: SANS, fontSize: 12, color: artStyle === s.id ? C.gold : C.muted,
                    background: artStyle === s.id ? C.goldDim : "transparent",
                    border: "none", cursor: "pointer", transition: "all .15s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                    onMouseLeave={e => (e.currentTarget.style.background = artStyle === s.id ? C.goldDim : "transparent")}
                  >
                    {s.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Advanced settings */}
        <div style={{ marginBottom: "1.6rem" }}>
          <button onClick={() => setAdvOpen(v => !v)} style={{
            width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "none", border: "none", cursor: "pointer", marginBottom: advOpen ? "1rem" : 0,
          }}>
            <Label>Advanced Settings</Label>
            <span style={{ color: C.gold, fontSize: 10 }}>{advOpen ? "▲" : "▼"}</span>
          </button>
          <AnimatePresence>
            {advOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                <Slider label="Number of Panels" value={numPanels} min={1} max={6} step={1}
                  hint="How many distinct images to generate (4 recommended)"
                  onChange={setNumPanels} />
                <Slider label="Panel Width (px)" value={panelW} min={256} max={512} step={64}
                  hint="sd-turbo native: 512px — do not exceed 512"
                  onChange={setPanelW} />
                <Slider label="Panel Height (px)" value={panelH} min={256} max={512} step={64}
                  hint="sd-turbo native: 512px — do not exceed 512"
                  onChange={setPanelH} />
                <Slider label="Quality Steps" value={quality} min={1} max={4} step={1}
                  hint="sd-turbo: 1–4 steps. 4 = best quality (~5s/panel)"
                  onChange={setQuality} />
                <Slider label="Guidance Scale" value={guidance} min={0} max={2} step={0.5}
                  hint="sd-turbo works best at 0 — keep it low"
                  onChange={setGuidance} />

                {/* Toggles */}
                {[
                  { label: "Generate Comic Page Layout", val: genLayout, set: setGenLayout },
                  { label: "Skip Image Generation (story only)", val: skipImages, set: setSkipImages },
                ].map(({ label, val, set }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
                    <span style={{ fontFamily: SANS, fontSize: 12, color: C.muted }}>{label}</span>
                    <button onClick={() => set((v: boolean) => !v)} style={{
                      width: 40, height: 22, borderRadius: 99, cursor: "pointer",
                      background: val ? C.gold : "rgba(255,255,255,0.1)",
                      border: "none", position: "relative", transition: "background .2s",
                    }}>
                      <div style={{
                        position: "absolute", top: 3, left: val ? 20 : 3,
                        width: 16, height: 16, borderRadius: "50%",
                        background: val ? "#0a0908" : C.muted, transition: "left .2s",
                      }} />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              borderRadius: 8, padding: "0.9rem 1rem", marginBottom: "1.2rem",
              background: "rgba(192,88,88,0.08)", border: `1px solid rgba(192,88,88,0.25)`,
            }}
          >
            <p style={{ fontFamily: SANS, fontSize: 12, color: "#e88", lineHeight: 1.6 }}>{error}</p>
          </motion.div>
        )}

        {/* Generate button */}
        <motion.button
          onClick={doGenerate}
          disabled={generating}
          whileHover={!generating ? { scale: 1.015 } : {}}
          whileTap={!generating ? { scale: 0.98 } : {}}
          style={{
            width: "100%", padding: "1rem", borderRadius: 10, cursor: generating ? "not-allowed" : "pointer",
            fontFamily: DISPLAY, fontSize: 16, letterSpacing: "0.18em", textTransform: "uppercase",
            color: generating ? C.muted : "#0a0908",
            background: generating
              ? "rgba(255,255,255,0.06)"
              : `linear-gradient(135deg, ${C.gold} 0%, #e8c55a 50%, ${C.gold} 100%)`,
            border: generating ? `1px solid ${C.border}` : "none",
            boxShadow: generating ? "none" : `0 4px 24px rgba(201,168,76,0.35)`,
            transition: "all .3s",
          }}
        >
          {generating ? "Generating…" : "✦ Generate Comic"}
        </motion.button>

        {/* Progress */}
        {generating && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: "1.2rem" }}
          >
            <ProgressBar pct={progress} label={progressLabel} />
            <p style={{ fontFamily: SANS, fontSize: 11, color: "rgba(237,232,225,0.25)", marginTop: 6 }}>
              Image generation can take 5–30 min depending on your GPU.
            </p>
          </motion.div>
        )}

        <p style={{ fontFamily: SANS, fontSize: 10, color: "rgba(237,232,225,0.2)", marginTop: "1.6rem", lineHeight: 1.7 }}>
          Story generated by <strong style={{ color: C.goldText }}>Mistral 7B via Ollama</strong> ·
          Images by <strong style={{ color: C.goldText }}>sd-turbo (512px, 4 steps)</strong>
        </p>
      </div>

      {/* ══ RIGHT: Output ══ */}
      <div style={{ padding: "2rem 2.5rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: 0 }}>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, marginBottom: "1.6rem" }}>
          <TabBtn id="layout" label="Comic Layout" />
          <TabBtn id="story" label="Story" />
          <TabBtn id="downloads" label="Downloads" />
        </div>

        <AnimatePresence mode="wait">

          {/* ── Layout tab ── */}
          {activeTab === "layout" && (
            <motion.div key="layout" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {/* Header bar */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: result ? C.accent : C.border, boxShadow: result ? `0 0 6px ${C.accent}` : "none" }} />
                  <span style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.26em", textTransform: "uppercase", color: result ? C.accent : C.muted, fontWeight: 700 }}>
                    {result ? "Generated Comic Page" : "Awaiting Generation"}
                  </span>
                </div>
                {result?.layout_image && (
                  <button
                    onClick={() => downloadB64(result.layout_image!, "comic_layout.png")}
                    style={{
                      fontFamily: SANS, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
                      color: C.gold, background: C.goldDim, border: `1px solid ${C.goldBorder}`,
                      borderRadius: 5, padding: "5px 12px", cursor: "pointer",
                    }}
                  >
                    ⤓ Download Layout
                  </button>
                )}
              </div>

              {result ? (
                <>
                  {/* Title */}
                  <div style={{ textAlign: "center", marginBottom: "0.8rem" }}>
                    <span style={{ fontFamily: SERIF, fontSize: 13, color: "rgba(237,232,225,0.35)", fontStyle: "italic" }}>
                      — {result.story.title} —
                    </span>
                  </div>

                  {/* Layout image or panel grid */}
                  {result.layout_image ? (
                    <img
                      src={`data:image/png;base64,${result.layout_image}`}
                      alt="Comic layout"
                      style={{ width: "100%", borderRadius: 6, border: `1px solid ${C.border}`, display: "block" }}
                    />
                  ) : result.panel_images.length > 0 ? (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${Math.min(3, result.panel_images.length)}, 1fr)`,
                      gap: 3, background: "#000", borderRadius: 6, overflow: "hidden",
                      border: `1px solid ${C.border}`,
                    }}>
                      {result.panel_images.map((b64, i) => (
                        <PanelCard key={i} b64={b64} dialogue={result.dialogues[i] ?? null} index={i} />
                      ))}
                    </div>
                  ) : (
                    /* Story-only mode (images skipped) */
                    <div style={{
                      borderRadius: 8, padding: "2rem", textAlign: "center",
                      border: `1px dashed ${C.border}`, background: "rgba(255,255,255,0.02)",
                    }}>
                      <p style={{ fontFamily: SERIF, fontSize: 18, color: "rgba(201,168,76,0.3)", fontStyle: "italic" }}>
                        Story generated
                      </p>
                      <p style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>
                        Image generation was skipped. Switch to Story tab to read the narrative.
                      </p>
                    </div>
                  )}

                  {/* Meta pills */}
                  <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {[
                      { l: "Style", v: styleLabel },
                      { l: "Panels", v: result.panel_images.length || numPanels },
                      { l: "Steps", v: quality },
                      { l: "Chars", v: result.story.characters.join(", ") },
                    ].map(({ l, v }) => (
                      <div key={l} style={{ borderRadius: 5, padding: "0.35rem 0.8rem", display: "flex", gap: "0.4rem", alignItems: "center", ...glass(0.04, 10) }}>
                        <span style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(201,168,76,0.45)", fontWeight: 700 }}>{l}</span>
                        <span style={{ fontSize: 11, color: C.main }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", minHeight: 340, borderRadius: 8,
                  border: `1px dashed ${C.border}`,
                }}>
                  {generating ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      style={{ width: 32, height: 32, border: `2px solid ${C.border}`, borderTopColor: C.gold, borderRadius: "50%" }}
                    />
                  ) : (
                    <>
                      <span style={{ fontFamily: SERIF, fontSize: 34, color: "rgba(201,168,76,0.08)", fontWeight: 300, fontStyle: "italic" }}>Your panels</span>
                      <p style={{ fontSize: 12, color: "rgba(237,232,225,0.2)", marginTop: "0.7rem" }}>will appear here after generation</p>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Story tab ── */}
          {activeTab === "story" && (
            <motion.div key="story" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {result ? (
                <>
                  <h2 style={{ fontFamily: SERIF, fontSize: "clamp(18px,2.5vw,28px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: "1.6rem", color: C.main }}>
                    {result.story.title}
                  </h2>

                  <Label>Characters</Label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1.4rem" }}>
                    {result.story.characters.map(c => (
                      <span key={c} style={{ fontFamily: SANS, fontSize: 11, color: C.gold, background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: 4, padding: "3px 10px" }}>
                        {c}
                      </span>
                    ))}
                  </div>

                  <Label>Storyline</Label>
                  {result.story.storyline.split("\n").filter(Boolean).map((para, i) => (
                    <p key={i} style={{ fontSize: 13, color: "rgba(237,232,225,0.55)", lineHeight: 1.95, marginBottom: "1rem", fontWeight: 300 }}>
                      {para}
                    </p>
                  ))}

                  <Divider />
                  <Label>Moral</Label>
                  <p style={{ fontSize: 13, color: "rgba(237,232,225,0.45)", lineHeight: 1.9, fontWeight: 300, fontStyle: "italic" }}>
                    {result.story.moral}
                  </p>

                  <Divider />
                  <Label>Panel Descriptions</Label>
                  {result.panel_prompts.map((p, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: "0.7rem", alignItems: "flex-start" }}>
                      <span style={{ fontFamily: DISPLAY, fontSize: 13, color: C.gold, minWidth: 20 }}>{i + 1}</span>
                      <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.7 }}>{p}</p>
                    </div>
                  ))}
                </>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
                  <p style={{ fontSize: 13, color: "rgba(237,232,225,0.2)" }}>Generate a comic to see story details</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Downloads tab ── */}
          {activeTab === "downloads" && (
            <motion.div key="downloads" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {result ? (
                <>
                  <p style={{ fontSize: 12, color: C.muted, marginBottom: "1.4rem" }}>
                    Download your generated files below.
                  </p>

                  {/* Story markdown */}
                  <Label>Story Details (.md)</Label>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 7, padding: "0.75rem 1rem", marginBottom: "1.4rem", ...glass(0.04, 10) }}>
                    <span style={{ fontFamily: SANS, fontSize: 12, color: C.muted }}>
                      {result.story.title.replace(/\s+/g, "_")}_story.md
                    </span>
                    <button onClick={downloadStory} style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: C.gold, background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: 4, padding: "4px 12px", cursor: "pointer" }}>
                      ↓ Download
                    </button>
                  </div>

                  {/* Layout image */}
                  {result.layout_image && (
                    <>
                      <Label>Comic Layout (.png)</Label>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 7, padding: "0.75rem 1rem", marginBottom: "1.4rem", ...glass(0.04, 10) }}>
                        <span style={{ fontFamily: SANS, fontSize: 12, color: C.muted }}>comic_layout.png</span>
                        <button onClick={() => downloadB64(result.layout_image!, "comic_layout.png")} style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: C.gold, background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: 4, padding: "4px 12px", cursor: "pointer" }}>
                          ↓ Download
                        </button>
                      </div>
                    </>
                  )}

                  {/* Individual panels */}
                  {result.panel_images.length > 0 && (
                    <>
                      <Label>Individual Panels (.png)</Label>
                      {result.panel_images.map((b64, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 7, padding: "0.6rem 1rem", marginBottom: 4, ...glass(0.03, 10) }}>
                          <span style={{ fontFamily: SANS, fontSize: 12, color: C.muted }}>
                            panel_{String(i + 1).padStart(2, "0")}.png
                            {result.dialogues[i] && (
                              <span style={{ fontSize: 10, color: "rgba(237,232,225,0.25)", marginLeft: 8 }}>
                                "{result.dialogues[i]!.slice(0, 30)}…"
                              </span>
                            )}
                          </span>
                          <button onClick={() => downloadB64(b64, `panel_${String(i + 1).padStart(2, "0")}.png`)} style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: 4, padding: "4px 10px", cursor: "pointer" }}>
                            ↓
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
                  <p style={{ fontSize: 13, color: "rgba(237,232,225,0.2)" }}>No files available — generate a comic first</p>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}