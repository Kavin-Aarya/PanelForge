import { useState, useEffect, useRef, useCallback } from "react";
import type { CSSProperties } from "react";
import {
  motion, useScroll, useTransform, useInView,
  useMotionValue, useSpring, animate, AnimatePresence
} from "framer-motion";
import { Routes, Route, useNavigate } from "react-router-dom";
import AuthPage from "./authpage";
import Dashboard from "./dashboard";

/* ═══════════════════════════════════════════════════════════
   COLOUR TOKENS — muted editorial palette
   Primary:  #b8a99a  (warm greige / dusty rose)
   Accent:   #8fa89e  (muted sage)
   Warm:     #c4956a  (terracotta tan)
   Bg:       #0d0c0b  (warm near-black)
   Surface:  #151412  (dark warm surface)
═══════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════
   CURSOR
═══════════════════════════════════════════════════════════ */


function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -200, y: -200 });
  const rpos = useRef({ x: -200, y: -200 });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      // Smooth tracking for the outer ring
      rpos.current.x = lerp(rpos.current.x, pos.current.x, 0.1);
      rpos.current.y = lerp(rpos.current.y, pos.current.y, 0.1);
      
      // Fixes the off-center bug using transforms like authpage
      if (ring.current) {
        ring.current.style.transform = `translate3d(${rpos.current.x}px, ${rpos.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (dot.current) {
        dot.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    const mv = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", mv, { passive: true });

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      window.removeEventListener("mousemove", mv);
    };
  }, []);

  return (
    <>
      {/* Width & height updated to 5px to match authpage exactly */}
      <div 
        ref={dot} 
        className="c-dot" 
        style={{ 
          position: "fixed", 
          top: 0,
          left: 0,
          pointerEvents: "none", 
          zIndex: 9999, 
          width: 5, 
          height: 5, 
          background: "#b8a99a", 
          borderRadius: "50%",
          mixBlendMode: "difference"
        }} 
      />
      <div 
        ref={ring} 
        className="c-ring" 
        style={{ 
          position: "fixed", 
          top: 0,
          left: 0,
          pointerEvents: "none", 
          zIndex: 9998, 
          width: 40, 
          height: 40, 
          border: "1px solid rgba(184,169,154,0.4)", 
          borderRadius: "50%" 
        }} 
      />
    </>
  );
}
/* ═══════════════════════════════════════════════════════════
   SCROLL PROGRESS — muted sage accent
═══════════════════════════════════════════════════════════ */
function ScrollBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div style={{
      position: "fixed", top: 0, left: 0, right: 0, height: "2px", zIndex: 200,
      background: "linear-gradient(90deg, #8fa89e, #c4956a, #b8a99a)",
      scaleX, transformOrigin: "left",
      boxShadow: "0 0 12px rgba(143,168,158,0.5)",
    }} />
  );
}

/* ═══════════════════════════════════════════════════════════
   SPLIT TEXT
═══════════════════════════════════════════════════════════ */
function Split({ text, delay = 0, stagger = 0.025, style = {}, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const words = text.split(" ");
  return (
    <span ref={ref} className={className} style={{ display: "inline", ...style }}>
      {words.map((word, wi) => (
        <span key={wi} style={{ display: "inline-block", overflow: "hidden", marginRight: "0.26em" }}>
          {word.split("").map((ch, ci) => {
            const idx = words.slice(0, wi).reduce((a, w) => a + w.length, 0) + ci;
            return (
              <motion.span key={ci} style={{ display: "inline-block" }}
                initial={{ y: "110%", rotateX: "35deg", opacity: 0 }}
                animate={inView ? { y: "0%", rotateX: "0deg", opacity: 1 } : {}}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: delay + idx * stagger }}>
                {ch}
              </motion.span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   FADE REVEAL
═══════════════════════════════════════════════════════════ */
function Fade({ children, delay = 0, y = 32, style = {}, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} className={className} style={style}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay }}>
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAGNETIC BUTTON — muted palette
═══════════════════════════════════════════════════════════ */
function Mag({ children, style = {} as CSSProperties, href = "#", invert = false, onClick }: any) {
  const el = useRef(null);
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 240, damping: 24 });
  const sy = useSpring(y, { stiffness: 240, damping: 24 });
  const [hov, setHov] = useState(false);
  const mv = useCallback((e) => {
    const r = el.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.35);
    y.set((e.clientY - r.top - r.height / 2) * 0.35);
  }, [x, y]);
  const ml = useCallback(() => { x.set(0); y.set(0); setHov(false); }, [x, y]);
  const handleClick = onClick ? (e) => { e.preventDefault(); onClick(); } : undefined;
  return (
    <motion.a ref={el} href={href} onClick={handleClick}
      style={{ ...style, x: sx, y: sy, display: "inline-block", textDecoration: "none", position: "relative", overflow: "hidden" }}
      onMouseMove={mv} onMouseLeave={ml} onMouseEnter={() => setHov(true)}>
      <motion.span style={{
        position: "absolute", inset: 0,
        background: invert ? "#b8a99a" : "rgba(255,255,255,0.07)",
        transformOrigin: "bottom",
      }}
        initial={{ scaleY: 0 }} animate={{ scaleY: hov ? 1 : 0 }}
        transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1] }} />
      <span style={{
        position: "relative", zIndex: 1, display: "block",
        transition: "color 0.28s",
        color: hov ? (invert ? "#0d0c0b" : "#ede8e1") : (style.color || "#ede8e1")
      }}>
        {children}
      </span>
    </motion.a>
  );
}

/* ═══════════════════════════════════════════════════════════
   ANIMATED COUNTER
═══════════════════════════════════════════════════════════ */
function Count({ to, suffix = "", dec = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, {
      duration: 2.8, ease: [0.22, 1, 0.36, 1],
      onUpdate: (n) => setV(dec ? +n.toFixed(dec) : Math.round(n))
    });
    return () => c.stop();
  }, [inView, to, dec]);
  return <span ref={ref}>{dec ? v.toFixed(dec) : v.toLocaleString()}{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════════
   NAV — liquid glass on scroll
═══════════════════════════════════════════════════════════ */
function Nav() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <motion.nav
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 clamp(1.5rem,4.5vw,5rem)", height: 78,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(13,12,11,0.72)" : "transparent",
        backdropFilter: scrolled ? "blur(32px) saturate(1.6) brightness(1.04)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(32px) saturate(1.6) brightness(1.04)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "none",
        boxShadow: scrolled ? "0 1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)" : "none",
        transition: "background .7s, border-color .7s, box-shadow .7s",
      }}>
      {/* Logo */}
      <a href="#" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: "2px" }}>
        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: "#b8a99a", letterSpacing: "0.12em" }}>PANEL</span>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: "rgba(237,232,225,0.35)", fontStyle: "italic", fontWeight: 300, letterSpacing: "-0.01em" }}>Forge</span>
      </a>

      {/* Links */}
      <div className="nav-links" style={{ display: "flex", gap: "3.2rem" }}>
        {["Craft","Gallery","Features","Pricing"].map(l => (
          <a key={l} href={`#${l.toLowerCase()}`}
            style={{ color: "rgba(237,232,225,0.32)", textDecoration: "none", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, transition: "color .3s, letter-spacing .3s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#ede8e1"; e.currentTarget.style.letterSpacing = "0.28em"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(237,232,225,0.32)"; e.currentTarget.style.letterSpacing = "0.2em"; }}>
            {l}
          </a>
        ))}
      </div>

      {/* CTA — liquid glass button */}
      <Mag href="#" onClick={() => navigate("/auth")} invert style={{
        fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
        fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
        border: "1px solid rgba(184,169,154,0.35)", padding: "12px 28px",
        color: "#b8a99a", background: "rgba(184,169,154,0.07)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
      }}>
        Begin Free
      </Mag>
    </motion.nav>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERO — comic-creation video background
═══════════════════════════════════════════════════════════ */
function Hero() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const fade = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const ty = useTransform(scrollYProgress, [0, 0.4], [0, -110]);
  const bgScale = useTransform(scrollYProgress, [0, 0.6], [1.12, 1.25]); // starts scaled UP, not at 1
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);       // no negative start

  return (
    <section style={{ position: "relative", height: "100vh", minHeight: 700, overflow: "hidden", background: "#0d0c0b" }}>
      {/* Comic-creation themed video background */}
      <motion.div style={{ position: "absolute", inset: "-15%", scale: bgScale, y: bgY }}>
        {/* Primary: drawing/sketching hands — comic creation feel */}
        <video
          autoPlay muted loop playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.16) saturate(0.28) contrast(1.2) sepia(0.15)" }}>
          <source src="https://assets.mixkit.co/videos/preview/mixkit-artist-drawing-with-pencil-close-up-22974-large.mp4" type="video/mp4" />
          <source src="https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-writing-on-a-notebook-23180-large.mp4" type="video/mp4" />
        </video>
        {/* Fallback: comic/graphic art illustration */}
        <div style={{
          position: "absolute", inset: 0, zIndex: -1,
          backgroundImage: "url('https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=1800&q=80')",
          backgroundSize: "cover", backgroundPosition: "center",
          filter: "brightness(0.16) saturate(0.28) contrast(1.2)"
        }} />
      </motion.div>

      {/* Ambient colour tint overlay — terracotta warmth */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 60% at 50% 40%, rgba(196,149,106,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Main gradient overlays */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(13,12,11,0.25) 0%,rgba(13,12,11,0) 30%,rgba(13,12,11,0) 55%,rgba(13,12,11,1) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 70% at 50% 30%,transparent 0%,rgba(13,12,11,0.65) 100%)" }} />

      {/* Scanline */}
      <div style={{ position: "absolute", left: 0, right: 0, height: "1px", background: "linear-gradient(90deg,transparent,rgba(184,169,154,0.07),transparent)", animation: "scan 11s linear infinite", pointerEvents: "none", zIndex: 3 }} />

      {/* Liquid glass corner markers */}
      {[{ top: 28, left: 28 },{ top: 28, right: 28 },{ bottom: 28, left: 28 },{ bottom: 28, right: 28 }].map((pos, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.8 + i * 0.1, duration: 0.6, ease: [0.22,1,0.36,1] }}
          style={{ position: "absolute", width: 16, height: 16, ...pos, zIndex: 5 }}>
          <svg viewBox="0 0 16 16" fill="none" style={{ width: "100%", height: "100%" }}>
            <path d={i < 2 ? "M0 8V0H8" : "M0 8V16H8"} stroke="rgba(184,169,154,0.4)" strokeWidth="1" />
            <path d={i % 2 === 0 ? "M0 8V0H8" : (i === 1 ? "M16 8V0H8" : "M16 8V16H8")} stroke="rgba(184,169,154,0.4)" strokeWidth="1" />
          </svg>
        </motion.div>
      ))}

      {/* Floating liquid glass orb — ambient decoration */}
      

      {/* Side label */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 1 }}
        style={{ position: "absolute", left: "clamp(1.5rem,3vw,3rem)", top: "50%", transform: "translateY(-50%) rotate(-90deg)", transformOrigin: "center", zIndex: 5, display: "flex", alignItems: "center", gap: "1.2rem" }}>
        <div style={{ width: 1, height: 48, background: "rgba(184,169,154,0.22)" }} />
        <span style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(237,232,225,0.22)", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, whiteSpace: "nowrap" }}>AI Comic Authoring Platform</span>
      </motion.div>

      {/* Year label right */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4, duration: 1 }}
        style={{ position: "absolute", right: "clamp(1.5rem,3vw,3rem)", bottom: "12rem", zIndex: 5 }}>
        <span style={{ fontSize: 9, letterSpacing: "0.22em", color: "rgba(237,232,225,0.18)", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, writingMode: "vertical-rl" }}>EST. 2026</span>
      </motion.div>

      {/* Content */}
      <motion.div style={{ opacity: fade, y: ty, position: "absolute", inset: 0, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 clamp(1.5rem,7vw,8rem)" }}>
        {/* Liquid glass pill tag */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }}
          style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "3.5rem" }}>
          <div style={{ width: 40, height: "1px", background: "rgba(184,169,154,0.35)" }} />
          <span className="lg-pill" style={{ fontSize: 9, letterSpacing: "0.38em", textTransform: "uppercase", color: "rgba(184,169,154,0.75)", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, padding: "7px 16px" }}>Where stories forge worlds</span>
          <div style={{ width: 40, height: "1px", background: "rgba(184,169,154,0.35)" }} />
        </motion.div>

        {/* Headline */}
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(62px,11.5vw,158px)", fontWeight: 700, lineHeight: 0.9, letterSpacing: "-0.03em", color: "#ede8e1", marginBottom: "2.4rem", maxWidth: "14ch" }}>
          <Split text="Where" delay={0.55} stagger={0.04} />{" "}
          <span style={{ fontStyle: "italic", fontWeight: 300, color: "#b8a99a" }}>
            <Split text="Stories" delay={0.72} stagger={0.03} />
          </span>
          <br />
          <Split text="Forge Worlds" delay={0.92} stagger={0.03} />
        </h1>

        {/* Subtext */}
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.3, delay: 1.6 }}
          style={{ color: "rgba(237,232,225,0.38)", fontSize: "clamp(14px,1.5vw,18px)", lineHeight: 1.9, maxWidth: "44ch", marginBottom: "4rem", fontFamily: "'DM Sans',sans-serif", fontWeight: 300 }}>
          Describe any scene. PanelForge renders it — panel by panel — into comics that feel hand-crafted, not generated.
        </motion.p>

        {/* CTAs — liquid glass secondary button */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.95 }}
          style={{ display: "flex", gap: "1.4rem", flexWrap: "wrap", justifyContent: "center" }}>
          <Mag invert href="#" onClick={() => navigate("/auth")} style={{ background: "#b8a99a", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, padding: "18px 56px", color: "#0d0c0b" }}>
            Start Creating
          </Mag>
          <Mag href="#features" style={{
            fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
            fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
            border: "1px solid rgba(237,232,225,0.15)", padding: "18px 48px",
            color: "rgba(237,232,225,0.45)",
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
          }}>
            See the Craft
          </Mag>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.8, duration: 1.5 }}
        style={{ position: "absolute", bottom: 42, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, zIndex: 10 }}>
        <span style={{ fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(237,232,225,0.18)", fontFamily: "'DM Sans',sans-serif" }}>Scroll</span>
        <div style={{ width: 1, height: 58, background: "linear-gradient(to bottom, rgba(184,169,154,0.45), transparent)", overflow: "hidden", position: "relative" }}>
          <motion.div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100%", background: "linear-gradient(to bottom, transparent, rgba(184,169,154,0.7), transparent)" }}
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
        </div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   MARQUEE — dual rows, opposite directions
═══════════════════════════════════════════════════════════ */
function Marquee() {
  const r1 = ["Hugging Face","Stable Diffusion","OpenAI","DALL·E 3","Midjourney","Replicate","ComfyUI","ControlNet","SDXL","Flux.1","Runway ML","Luma AI","Kling AI","Pika Labs"];
  const r2 = ["Story Logic","Panel Layout AI","Character Lock","Style Engine","Dialogue AI","Export Suite","Cloud Render","Collaboration","API Access","Version Control","LoRA Training","Batch Gen","Style Transfer","Live Preview"];
  const doubled1 = [...r1, ...r1];
  const doubled2 = [...r2, ...r2];
  return (
    <div style={{ background: "#0d0c0b", paddingTop: 60, paddingBottom: 60, borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)", overflow: "hidden" }}>
      <Fade y={8} delay={0.1}>
        <p style={{ textAlign: "center", color: "rgba(237,232,225,0.13)", fontSize: 9, letterSpacing: "0.36em", textTransform: "uppercase", marginBottom: "2.4rem", fontFamily: "'DM Sans',sans-serif" }}>Powered by world-class AI infrastructure</p>
      </Fade>
      <div style={{ overflow: "hidden", maskImage: "linear-gradient(90deg,transparent,black 10%,black 90%,transparent)", marginBottom: "0.8rem" }}>
        <div className="mq">
          {doubled1.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "4rem", flexShrink: 0 }}>
              <span data-h style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(237,232,225,0.1)", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, transition: "color .4s", cursor: "default" }}
                onMouseEnter={e => e.currentTarget.style.color = "rgba(196,149,106,0.55)"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(237,232,225,0.1)"}>
                {item}
              </span>
              <div style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(184,169,154,0.18)", flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ overflow: "hidden", maskImage: "linear-gradient(90deg,transparent,black 10%,black 90%,transparent)" }}>
        <div className="mq mq-rev">
          {doubled2.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "4rem", flexShrink: 0 }}>
              <span data-h style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(237,232,225,0.07)", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, transition: "color .4s", cursor: "default" }}
                onMouseEnter={e => e.currentTarget.style.color = "rgba(143,168,158,0.4)"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(237,232,225,0.07)"}>
                {item}
              </span>
              <div style={{ width: 2, height: 2, borderRadius: "50%", background: "rgba(237,232,225,0.05)", flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STORY BLOCK — with real images + liquid glass panels
═══════════════════════════════════════════════════════════ */
function StoryBlock({ img, label, titleLine1, titleLine2Italic, desc, cta, flip = false, idx = 0 }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-18%", "18%"]);
  const lineW = useTransform(scrollYProgress, [0.1, 0.55], ["0%", "100%"]);
  const imgReveal = useTransform(scrollYProgress, [0.05, 0.4], ["100%", "0%"]);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} style={{ position: "relative", minHeight: "90vh", display: "flex", alignItems: "center", overflow: "hidden", background: "#0d0c0b" }}>
      {/* Full-bleed parallax image */}
      <motion.div style={{
        y: bgY, position: "absolute", inset: "-24%",
        backgroundImage: `url(${img})`, backgroundSize: "cover", backgroundPosition: "center",
        filter: "brightness(0.12) saturate(0.25) contrast(1.15) sepia(0.1)",
      }} />

      {/* Ambient colour wash */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 60% at 30% 50%, rgba(196,149,106,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Directional gradient overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: flip
          ? "linear-gradient(to left, rgba(13,12,11,0.97) 38%, rgba(13,12,11,0.4) 100%)"
          : "linear-gradient(to right, rgba(13,12,11,0.97) 38%, rgba(13,12,11,0.4) 100%)"
      }} />

      {/* Image reveal panel with liquid glass frame */}
      <div style={{
        position: "absolute", top: "8%", bottom: "8%",
        [flip ? "left" : "right"]: "clamp(1.5rem, 4vw, 5rem)",
        width: "clamp(220px, 28vw, 440px)",
        overflow: "hidden",
        zIndex: 2,
      }}>
        <motion.div style={{ clipPath: `inset(0 ${imgReveal} 0 0)` }}>
          <motion.div style={{ y: bgY }}>
            <img src={img} alt={label}
              style={{ width: "100%", height: "clamp(350px,55vh,680px)", objectFit: "cover", filter: "brightness(0.7) saturate(0.45) contrast(1.1)", display: "block" }} />
          </motion.div>
        </motion.div>
        {/* Liquid glass caption overlay */}
        <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.8, duration: 1 }}
          style={{ position: "absolute", bottom: "1.2rem", left: "1.2rem", right: "1.2rem" }}>
          <div className="lg" style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", padding: "6px 14px", borderRadius: 2 }}>
            <div style={{ width: 16, height: "1px", background: "rgba(184,169,154,0.5)" }} />
            <span style={{ fontSize: 9, letterSpacing: "0.22em", color: "rgba(184,169,154,0.7)", fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase" }}>{label}</span>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 3, width: "100%", maxWidth: 1440, margin: "0 auto", padding: "8rem clamp(1.5rem,5.5vw,6rem)" }}>
        <div style={{ display: "flex", justifyContent: flip ? "flex-end" : "flex-start" }}>
          <div className="story-inner" style={{ maxWidth: 540 }}>
            {/* Liquid glass index badge */}
            <motion.div initial={{ opacity: 0, x: flip ? 20 : -20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.9, delay: 0.1 }}
              style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.2rem" }}>
              <span className="lg" style={{
                fontFamily: "'Bebas Neue',sans-serif", fontSize: 11, color: "#b8a99a", letterSpacing: "0.3em",
                padding: "4px 10px", borderRadius: 2
              }}>0{idx + 1}</span>
              <div style={{ width: 1, height: 18, background: "rgba(184,169,154,0.2)" }} />
              <span style={{ fontSize: 9, letterSpacing: "0.22em", color: "rgba(237,232,225,0.28)", fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase" }}>{label}</span>
            </motion.div>

            {/* Animated line */}
            <div style={{ height: 1, background: "rgba(237,232,225,0.05)", marginBottom: "3rem", position: "relative", overflow: "hidden" }}>
              <motion.div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, #b8a99a, rgba(184,169,154,0.2))", width: lineW }} />
            </div>

            {/* Title */}
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(40px,5.2vw,76px)", fontWeight: 700, lineHeight: 1.0, letterSpacing: "-0.025em", color: "#ede8e1", marginBottom: "2.2rem" }}>
              <Split text={titleLine1} delay={0.2} stagger={0.02} />
              {titleLine2Italic && (
                <><br /><span style={{ fontStyle: "italic", fontWeight: 300, color: "#b8a99a" }}>
                  <Split text={titleLine2Italic} delay={0.45} stagger={0.02} />
                </span></>
              )}
            </h2>

            <Fade delay={0.6} y={16}>
              <p style={{ color: "rgba(237,232,225,0.38)", fontSize: "clamp(14px,1.35vw,17px)", lineHeight: 1.95, fontFamily: "'DM Sans',sans-serif", fontWeight: 300, marginBottom: "3rem" }}>{desc}</p>
            </Fade>

            {cta && (
              <Fade delay={0.78} y={12}>
                <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "0.8rem", color: "#b8a99a", textDecoration: "none", fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, transition: "gap .35s, opacity .3s" }}
                  onMouseEnter={e => { e.currentTarget.style.gap = "1.4rem"; e.currentTarget.style.opacity = "0.7"; }}
                  onMouseLeave={e => { e.currentTarget.style.gap = "0.8rem"; e.currentTarget.style.opacity = "1"; }}>
                  {cta}
                  <svg width="20" height="8" viewBox="0 0 20 8" fill="none"><path d="M0 4H18M14 1l4 3-4 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
              </Fade>
            )}
          </div>
        </div>
      </div>

      {/* Ghost number */}
      <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.8, duration: 2 }}
        style={{ position: "absolute", bottom: "2rem", [flip ? "left" : "right"]: "2.5rem", fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(100px,15vw,200px)", color: "rgba(184,169,154,0.02)", lineHeight: 1, userSelect: "none", letterSpacing: "0.04em", zIndex: 1 }}>
        0{idx + 1}
      </motion.div>
    </section>
  );
}

function Stories() {
  const data = [
    {
      img: "https://images.unsplash.com/photo-1632516643720-e7f5d7d6ecc9?w=1400&q=80",
      label: "The Creative Process",
      titleLine1: "Describe any story.",
      titleLine2Italic: "Watch it become a comic.",
      desc: "ComicCrafter AI turns your prompts into visually consistent comic panels with AI-generated artwork, character continuity, dialogue placement, cinematic layouts, and customizable art styles — creating comics that feel illustrated, not randomly generated.",
      cta: "Explore the Engine"
    },
    {
      img: "https://images.unsplash.com/photo-1619983081593-e2ba5b543168?w=1400&q=80",
      label: "Style Intelligence",
      titleLine1: "Your story.",
      titleLine2Italic: "Infinite aesthetics.",
      desc: "From noir shadows to manga linework, watercolour washes to cyberpunk neon — PanelForge re-renders your entire narrative in a coherent visual language.",
      cta: "Browse Style Library",
      flip: true
    },
    {
      img: "https://images.unsplash.com/photo-1602576666092-bf6447a729fc?w=1400&q=80",
      label: "Character System",
      titleLine1: "Characters that",
      titleLine2Italic: "remember themselves.",
      desc: "Define once. Your protagonist's face, posture, and wardrobe remain perfectly consistent across every panel, every chapter, every arc — automatically.",
      cta: "Learn About Character Lock"
    },
  ];
  return <section id="craft">{data.map((s, i) => <StoryBlock key={i} {...s} flip={s.flip || false} idx={i} />)}</section>;
}

/* ═══════════════════════════════════════════════════════════
   FEATURES BENTO — liquid glass cards
═══════════════════════════════════════════════════════════ */
const FT = [
  { n: "01", title: "Story-to-Panel Logic", desc: "Semantic parsing understands scene composition, foreground/background, emotional tone, and action beats before a single pixel renders.", wide: true },
  { n: "02", title: "Instant Exports", desc: "Web JPEGs, print TIFFs, or CBZ archives. Panels or full chapters in one click." },
  { n: "03", title: "Style Locking", desc: "Lock colours, line weight, and mood across an entire project for authorial coherence." },
  { n: "04", title: "Panel Layout AI", desc: "Dynamic grid suggestions: wide shots, close-up emotion, split-panel action sequences.", wide: true },
  { n: "05", title: "Dialogue Engine", desc: "Bubble placement, sizing, and tailing adapts to panel composition and emotional register." },
  { n: "06", title: "Collaboration Studio", desc: "Live canvas, role-based permissions, version history. Built for creative teams." },
];

function Features() {
  const setMouse = useCallback((el) => {
    if (!el) return;
    const fn = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
      el.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
    };
    el.addEventListener("mousemove", fn);
  }, []);

  return (
    <section id="features" style={{ background: "#0d0c0b", padding: "10rem clamp(1.5rem,5vw,5rem)", position: "relative", overflow: "hidden" }}>
      {/* Background liquid blobs */}
      

      <div style={{ maxWidth: 1440, margin: "0 auto", position: "relative", zIndex: 2 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "5.5rem", flexWrap: "wrap", gap: "2.5rem" }}>
          <div>
            <Fade y={14}>
              <p style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(196,149,106,0.55)", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, marginBottom: "1rem" }}>Capabilities</p>
            </Fade>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(42px,5.8vw,84px)", fontWeight: 700, color: "#ede8e1", lineHeight: 1.0, letterSpacing: "-0.025em" }}>
              <Split text="Everything a" delay={0.1} stagger={0.025} /><br />
              <span style={{ fontStyle: "italic", fontWeight: 300, color: "#b8a99a" }}>
                <Split text="storyteller needs." delay={0.32} stagger={0.022} />
              </span>
            </h2>
          </div>
          <Fade delay={0.3}>
            <p style={{ color: "rgba(237,232,225,0.28)", fontSize: "clamp(13px,1.25vw,15px)", lineHeight: 1.88, maxWidth: 290, fontFamily: "'DM Sans',sans-serif", fontWeight: 300 }}>
              Six professional-grade tools unified into a single seamless authoring experience.
            </p>
          </Fade>
        </div>

        {/* Feature image strip */}
        <Fade delay={0.1} style={{ marginBottom: "4rem" }}>
          <div style={{ display: "flex", gap: "2px", height: 200, overflow: "hidden" }}>
            {[
              "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
              "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&q=80",
              "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&q=80",
              "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
            ].map((src, i) => (
              <div key={i} style={{ flex: 1, overflow: "hidden", position: "relative" }}>
                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.5) saturate(0.3) contrast(1.1)", transition: "filter .7s" }}
                  onMouseEnter={e => e.currentTarget.style.filter = "brightness(0.7) saturate(0.5) contrast(1.1)"}
                  onMouseLeave={e => e.currentTarget.style.filter = "brightness(0.5) saturate(0.3) contrast(1.1)"} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,12,11,0.7) 0%, transparent 50%)" }} />
              </div>
            ))}
          </div>
        </Fade>

        {/* Grid — 3-col bento, wide cards span 2 */}
        <div className="ft-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0,1fr))",
          gridAutoRows: "auto",
          gap: "1px",
          background: "rgba(255,255,255,0.05)",
        }}>
          {FT.map((f, i) => (
            <Fade
              key={f.n}
              delay={i * 0.07}
              style={{
                gridColumn: f.wide ? "span 2 / span 2" : "span 1 / span 1",
                display: "flex",
              }}
            >
              <div ref={setMouse} className="fc" style={{
                flex: 1,
                padding: "clamp(2.2rem,3.5vw,3.5rem) clamp(2rem,3vw,3rem)",
                minHeight: 220,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2.5rem" }}>
                  <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 11, letterSpacing: "0.3em", color: "rgba(196,149,106,0.4)" }}>{f.n}</span>
                  <motion.div whileHover={{ rotate: 45 }} transition={{ duration: 0.35 }}
                    style={{ width: 26, height: 26, border: "1px solid rgba(184,169,154,0.18)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(8px)" }}>
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1 8L8 1M8 1H2M8 1V7" stroke="rgba(184,169,154,0.5)" strokeWidth="1.2" strokeLinecap="round" /></svg>
                  </motion.div>
                </div>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(22px,2.4vw,32px)", fontWeight: 700, color: "#ede8e1", marginBottom: "1rem", lineHeight: 1.15, letterSpacing: "-0.01em" }}>{f.title}</h3>
                <p style={{ color: "rgba(237,232,225,0.3)", fontSize: "clamp(13px,1.1vw,14px)", lineHeight: 1.92, fontFamily: "'DM Sans',sans-serif", fontWeight: 300 }}>{f.desc}</p>
              </div>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   STATS — subtle horizontal strip
═══════════════════════════════════════════════════════════ */
function Stats() {
  const data = [
    { val: 2400000, suf: "+", label: "Panels Generated", sub: "across all creators" },
    { val: 180000,  suf: "+", label: "Active Creators",  sub: "in 47 countries" },
    { val: 99.4,    suf: "%", label: "Uptime SLA",       sub: "enterprise-grade", dec: 1 },
    { val: 4.9,     suf: "/5",label: "Creator Rating",   sub: "from 12k reviews", dec: 1 },
  ];

  return (
    <section style={{
      background: "#0d0c0b",
      padding: "6rem clamp(1.5rem,5vw,5rem)",
      borderTop: "1px solid rgba(255,255,255,0.04)",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0,1fr))",
          /* vertical dividers between cells */
          gap: 0,
        }}>
          {data.map((s, i) => (
            <Fade key={s.label} delay={i * 0.09}>
              <div style={{
                padding: "2.8rem 2.5rem",
                textAlign: "center",
                /* right border acts as divider except last */
                borderRight: i < data.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                position: "relative",
              }}>
                {/* Faint top accent — barely visible */}
                <div style={{
                  position: "absolute", top: 0, left: "25%", right: "25%", height: "1px",
                  background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.18), transparent)",
                }} />

                {/* Number */}
                <div style={{
                  fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: "clamp(30px,3.2vw,44px)",
                  lineHeight: 1,
                  letterSpacing: "0.06em",
                  color: "rgba(201,168,76,0.72)",
                  marginBottom: "0.75rem",
                }}>
                  <Count to={s.val} suffix={s.suf} dec={s.dec || 0} />
                </div>

                {/* Label */}
                <p style={{
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(237,232,225,0.38)",
                  fontFamily: "'DM Sans',sans-serif",
                  fontWeight: 500,
                  marginBottom: "0.3rem",
                }}>
                  {s.label}
                </p>

                {/* Sub */}
                <p style={{
                  fontSize: 11,
                  color: "rgba(237,232,225,0.16)",
                  fontFamily: "'DM Sans',sans-serif",
                  fontWeight: 300,
                  letterSpacing: "0.04em",
                }}>
                  {s.sub}
                </p>
              </div>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   GALLERY — horizontal scroll with real comic-art images
═══════════════════════════════════════════════════════════ */
function Gallery() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["4%", "-18%"]);

  const imgs = [
    { src: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=900&q=80", h: "460px", label: "Dark Fantasy" },
    { src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=900&q=80", h: "340px", label: "Graphic Novel" },
    { src: "https://images.unsplash.com/photo-1614854262318-831574f15f1f?w=900&q=80", h: "420px", label: "Noir" },
    { src: "https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=900&q=80", h: "360px", label: "Illustrated" },
    { src: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=900&q=80", h: "440px", label: "Sci-Fi" },
    { src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&q=80", h: "380px", label: "Abstract" },
  ];

  return (
    <section ref={ref} id="gallery" style={{ background: "#0d0c0b", padding: "10rem 0", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "0 clamp(1.5rem,5vw,5rem)", maxWidth: 1440, margin: "0 auto 5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "2rem" }}>
          <div>
            <Fade y={12}><p style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(196,149,106,0.5)", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, marginBottom: "0.9rem" }}>The Work</p></Fade>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(40px,5.5vw,80px)", fontWeight: 700, color: "#ede8e1", lineHeight: 1.0, letterSpacing: "-0.025em" }}>
              <Split text="Made by the" delay={0.1} stagger={0.025} /><br />
              <span style={{ fontStyle: "italic", fontWeight: 300, color: "#b8a99a" }}>
                <Split text="community." delay={0.32} stagger={0.025} />
              </span>
            </h2>
          </div>
          <Fade delay={0.3}>
            <a href="#" style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(184,169,154,0.5)", textDecoration: "none", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, borderBottom: "1px solid rgba(184,169,154,0.18)", paddingBottom: 4, transition: "color .3s, border-color .3s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#b8a99a"; e.currentTarget.style.borderColor = "rgba(184,169,154,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(184,169,154,0.5)"; e.currentTarget.style.borderColor = "rgba(184,169,154,0.18)"; }}>
              Browse Gallery →
            </a>
          </Fade>
        </div>
      </div>

      {/* Horizontal parallax strip */}
      <motion.div style={{ x, display: "flex", gap: "2px", paddingLeft: "clamp(1.5rem,5vw,5rem)", willChange: "transform" }}>
        {imgs.map((img, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: i * 0.07, ease: [0.22,1,0.36,1] }}
            viewport={{ once: true }}
            style={{ flexShrink: 0, width: "clamp(220px,22vw,350px)", height: img.h, overflow: "hidden", position: "relative", background: "#111009" }}>
            <motion.img src={img.src} alt={img.label} loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.58) saturate(0.38) contrast(1.05)", transition: "filter .9s ease", display: "block" }}
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={e => e.currentTarget.style.filter = "brightness(0.8) saturate(0.55) contrast(1.05)"}
              onMouseLeave={e => e.currentTarget.style.filter = "brightness(0.58) saturate(0.38) contrast(1.05)"}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,12,11,0.75) 0%, transparent 40%)" }} />
            {/* Liquid glass label */}
            <div style={{ position: "absolute", bottom: "1.2rem", left: "1.2rem" }}>
              <div className="lg" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "5px 12px", borderRadius: 2 }}>
                <div style={{ width: 12, height: "1px", background: "rgba(184,169,154,0.5)" }} />
                <span style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(184,169,154,0.65)", fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase", fontWeight: 600 }}>{img.label}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   VIDEO REEL — with liquid glass overlays
═══════════════════════════════════════════════════════════ */
function VideoReel() {
  const clips = [
    { src: "https://assets.mixkit.co/videos/preview/mixkit-man-under-multicolored-lights-1237-large.mp4", label: "Character Generation", img: "https://images.unsplash.com/photo-1602576666092-bf6447a729fc?w=600&q=80" },
    { src: "https://assets.mixkit.co/videos/preview/mixkit-abstract-neon-designs-1490-large.mp4", label: "Style Engine", img: "https://images.unsplash.com/photo-1619983081593-e2ba5b543168?w=600&q=80" },
    { src: "https://assets.mixkit.co/videos/preview/mixkit-lights-in-the-rain-in-a-city-18464-large.mp4", label: "Panel Logic", img: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&q=80" },
  ];
  return (
    <section style={{ background: "#0b0a09", padding: "10rem clamp(1.5rem,5vw,5rem)", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ maxWidth: 1440, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "5rem" }}>
          <Fade y={12}><p style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(196,149,106,0.5)", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, marginBottom: "1rem" }}>In Motion</p></Fade>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(40px,5.5vw,78px)", fontWeight: 700, color: "#ede8e1", lineHeight: 1.0, letterSpacing: "-0.025em" }}>
            <Split text="See the craft" delay={0.1} stagger={0.025} /><br />
            <span style={{ fontStyle: "italic", fontWeight: 300, color: "#b8a99a" }}>
              <Split text="in action." delay={0.32} stagger={0.022} />
            </span>
          </h2>
        </div>
        <div className="h-reel" style={{ display: "flex", gap: "2px" }}>
          {clips.map((clip, i) => (
            <Fade key={i} delay={i * 0.1} style={{ flex: 1, minWidth: 0 }}>
              <div style={{ position: "relative", overflow: "hidden", aspectRatio: "16/10", background: "#111009" }}>
                <video autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.45) saturate(0.35) contrast(1.1) sepia(0.1)" }}>
                  <source src={clip.src} type="video/mp4" />
                </video>
                {/* Fallback image */}
                <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${clip.img})`, backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.45) saturate(0.35) contrast(1.1)", zIndex: -1 }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,12,11,0.85) 0%, transparent 50%)" }} />
                {/* Liquid glass label */}
                <div style={{ position: "absolute", bottom: "1.8rem", left: "1.8rem", right: "1.8rem" }}>
                  <div className="lg" style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", padding: "7px 14px", borderRadius: 2 }}>
                    <div style={{ width: 18, height: "1px", background: "rgba(184,169,154,0.5)" }} />
                    <span style={{ fontSize: 8, letterSpacing: "0.22em", color: "rgba(184,169,154,0.65)", fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase" }}>{clip.label}</span>
                  </div>
                </div>
                {/* Liquid glass play overlay */}
                <motion.div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0 }}
                  whileHover={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <div className="lg-strong" style={{ width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="16" viewBox="0 0 14 16" fill="none"><path d="M1 1l12 7L1 15V1z" fill="rgba(184,169,154,0.7)" /></svg>
                  </div>
                </motion.div>
              </div>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FAQ — liquid glass accordion
═══════════════════════════════════════════════════════════ */
const FAQS = [
  { q: "What makes PanelForge different from other AI image tools?", a: "PanelForge is built specifically for sequential storytelling. Its Panel Logic engine understands narrative continuity — characters stay consistent, pacing adapts to emotion, and visual language remains coherent across an entire chapter." },
  { q: "Do I retain rights to my comics?", a: "Yes, fully. All artwork generated on PanelForge belongs to you. Publish, sell, license, or distribute without restriction." },
  { q: "Can I train a custom style on my own artwork?", a: "Studio and Enterprise plans include private LoRA fine-tuning. Your custom model is isolated, encrypted, and only accessible to your workspace." },
  { q: "What export formats are supported?", a: "Individual panels: PNG (transparent), JPEG, TIFF up to 300dpi. Full comics: PDF, CBZ for e-readers, or a packaged web embed for digital publishing." },
  { q: "Is there a free tier?", a: "Yes. The free plan includes 50 panel generations per month, 12 style presets, and single-panel exports. No credit card required." },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section id="faq" style={{ background: "#0d0c0b", padding: "10rem clamp(1.5rem,5vw,5rem)", position: "relative", overflow: "hidden" }}>
      {/* Subtle background image */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1532012197267-da84d127e765?w=1800&q=80')", backgroundSize: "cover", backgroundPosition: "center 30%", filter: "brightness(0.05) saturate(0.2)", zIndex: 0 }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(13,12,11,0.92)", zIndex: 1 }} />
      

      <div style={{ maxWidth: 860, margin: "0 auto", position: "relative", zIndex: 2 }}>
        <Fade>
          <p style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(196,149,106,0.5)", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, marginBottom: "1rem" }}>Questions</p>
        </Fade>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(40px,5.5vw,78px)", fontWeight: 700, color: "#ede8e1", lineHeight: 1.0, letterSpacing: "-0.025em", marginBottom: "5.5rem" }}>
          <Split text="Frequently" delay={0.1} stagger={0.025} /><br />
          <span style={{ fontStyle: "italic", fontWeight: 300, color: "#b8a99a" }}>
            <Split text="asked." delay={0.3} stagger={0.035} />
          </span>
        </h2>
        {FAQS.map((f, i) => (
          <Fade key={i} delay={i * 0.05}>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.055)" }}>
              <button data-h onClick={() => setOpen(open === i ? null : i)}
                style={{ width: "100%", background: "none", border: "none", cursor: "none", padding: "2.4rem 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "2rem", textAlign: "left" }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(15px,1.65vw,19px)", color: open === i ? "#ede8e1" : "rgba(237,232,225,0.45)", fontWeight: open === i ? 500 : 300, transition: "color .4s", lineHeight: 1.45 }}>{f.q}</span>
                <motion.div animate={{ rotate: open === i ? 45 : 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className={open === i ? "lg" : ""}
                  style={{ flexShrink: 0, width: 28, height: 28, border: `1px solid ${open === i ? "rgba(184,169,154,0.3)" : "rgba(237,232,225,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.4s", background: open === i ? undefined : "transparent" }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 0V10M0 5H10" stroke={open === i ? "rgba(184,169,154,0.65)" : "rgba(237,232,225,0.28)"} strokeWidth="1.2" strokeLinecap="round" /></svg>
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div key="a" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} style={{ overflow: "hidden" }}>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(13px,1.3vw,15px)", color: "rgba(237,232,225,0.35)", lineHeight: 1.95, paddingBottom: "2.8rem", fontWeight: 300 }}>{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Fade>
        ))}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.055)" }} />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   BOTTOM CTA — with liquid glass card
═══════════════════════════════════════════════════════════ */
function BottomCTA() {
  const navigate = useNavigate();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-16%", "16%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <section ref={ref} style={{ position: "relative", minHeight: "76vh", overflow: "hidden", background: "#0d0c0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Parallax BG image — comic illustration */}
      <motion.div style={{ position: "absolute", inset: "-20%", y: bgY, scale: bgScale }}>
        <div style={{ width: "100%", height: "100%", backgroundImage: "url('https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=1800&q=80')", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.1) saturate(0.25) sepia(0.15)" }} />
      </motion.div>
      <div style={{ position: "absolute", inset: 0, background: "rgba(13,12,11,0.82)" }} />
      

      <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "8rem clamp(1.5rem,5vw,5rem)", width: "100%" }}>
        <Fade y={16} delay={0.1}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", justifyContent: "center", marginBottom: "2.5rem" }}>
            <div style={{ width: 48, height: "1px", background: "rgba(184,169,154,0.22)" }} />
            <span className="lg-pill" style={{ fontSize: 9, letterSpacing: "0.36em", textTransform: "uppercase", color: "rgba(184,169,154,0.5)", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, padding: "6px 14px" }}>Begin Your Story</span>
            <div style={{ width: 48, height: "1px", background: "rgba(184,169,154,0.22)" }} />
          </div>
        </Fade>

        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(52px,9.5vw,130px)", fontWeight: 700, lineHeight: 0.92, letterSpacing: "-0.03em", color: "#ede8e1", marginBottom: "2.5rem", maxWidth: "13ch", margin: "0 auto 2.5rem" }}>
          <Split text="Your first" delay={0.2} stagger={0.03} /><br />
          <span style={{ fontStyle: "italic", fontWeight: 300, color: "#b8a99a" }}>
            <Split text="panel awaits." delay={0.45} stagger={0.025} />
          </span>
        </h2>

        <Fade delay={0.7} y={12}>
          <p style={{ color: "rgba(237,232,225,0.35)", fontSize: "clamp(14px,1.45vw,17px)", lineHeight: 1.9, maxWidth: "42ch", margin: "0 auto 4.5rem", fontFamily: "'DM Sans',sans-serif", fontWeight: 300 }}>
            No credit card. No steep learning curve. Just your ideas and an engine built to realise them.
          </p>
        </Fade>

        <Fade delay={0.9} y={10}>
          <div style={{ display: "flex", gap: "1.4rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Mag invert href="#" onClick={() => navigate("/auth")} style={{ background: "#b8a99a", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, padding: "20px 64px", color: "#0d0c0b" }}>
              Create Free Account
            </Mag>
            <Mag href="#" style={{
              fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
              fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
              border: "1px solid rgba(237,232,225,0.14)", padding: "20px 52px",
              color: "rgba(237,232,225,0.4)",
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
            }}>
              See Pricing
            </Mag>
          </div>
        </Fade>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   TICKER — muted warm tone
═══════════════════════════════════════════════════════════ */
function Ticker() {
  const items = Array(8).fill("PANELFORGE · AI COMIC AUTHORING · FORGE YOUR WORLD · ");
  return (
    <div style={{ background: "#b8a99a", overflow: "hidden", padding: "14px 0" }}>
      <div className="ticker-inner">
        {items.map((t, i) => (
          <span key={i} style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, letterSpacing: "0.22em", color: "#0d0c0b", whiteSpace: "nowrap", paddingRight: "0" }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════ */
function Footer() {
  const cols = [
    { title: "Product", links: ["Features","Gallery","Pricing","Changelog","Roadmap"] },
    { title: "Resources", links: ["Documentation","Tutorials","API Reference","Status","Blog"] },
    { title: "Company", links: ["About","Careers","Press","Legal","Contact"] },
  ];
  return (
    <footer style={{ background: "#080706", borderTop: "1px solid rgba(255,255,255,0.04)", padding: "7rem clamp(1.5rem,5vw,5rem) 3rem" }}>
      <div style={{ maxWidth: 1440, margin: "0 auto" }}>
        <div className="footer-g" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "3rem 4rem", marginBottom: "5.5rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "2px", marginBottom: "1.4rem" }}>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: "#b8a99a", letterSpacing: "0.12em" }}>PANEL</span>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, color: "rgba(237,232,225,0.25)", fontStyle: "italic", fontWeight: 300 }}>Forge</span>
            </div>
            <p style={{ color: "rgba(237,232,225,0.2)", fontSize: 13, lineHeight: 1.9, maxWidth: 260, fontFamily: "'DM Sans',sans-serif", fontWeight: 300, marginBottom: "2.8rem" }}>The professional standard for AI-powered sequential art and comic creation.</p>
            <div style={{ display: "flex", gap: "0.65rem" }}>
              {["✕","in","◎","◈"].map((ic, i) => (
                <a key={i} href="#" className="lg" style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(237,232,225,0.2)", textDecoration: "none", fontSize: 10, fontFamily: "'DM Sans',sans-serif", transition: "color .3s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#b8a99a"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(237,232,225,0.2)"; }}>
                  {ic}
                </a>
              ))}
            </div>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <p style={{ fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(196,149,106,0.35)", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, marginBottom: "2rem" }}>{col.title}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                {col.links.map(l => (
                  <a key={l} href="#" style={{ color: "rgba(237,232,225,0.25)", textDecoration: "none", fontSize: 13, fontFamily: "'DM Sans',sans-serif", fontWeight: 300, transition: "color .3s" }}
                    onMouseEnter={e => e.currentTarget.style.color = "rgba(237,232,225,0.7)"}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(237,232,225,0.25)"}>{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <p style={{ color: "rgba(237,232,225,0.1)", fontSize: 11, fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.06em" }}>© 2026 PanelForge, Inc. All rights reserved.</p>
          <div style={{ display: "flex", gap: "2.5rem", flexWrap: "wrap" }}>
            {["Privacy Policy","Terms of Service","Cookie Preferences"].map(l => (
              <a key={l} href="#" style={{ color: "rgba(237,232,225,0.1)", textDecoration: "none", fontSize: 11, fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.04em", transition: "color .3s" }}
                onMouseEnter={e => e.currentTarget.style.color = "rgba(184,169,154,0.5)"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(237,232,225,0.1)"}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════ */
function LandingPage() {
  return (
    <div style={{ background: "#0d0c0b", color: "#ede8e1", minHeight: "100vh" }}>
      <ScrollBar />
      <Cursor />
      <Nav />
      <Hero />
      <Marquee />
      <Stories />
      <Features />
      <Stats />
      <Gallery />
      <VideoReel />
      <FAQ />
      <BottomCTA />
      <Ticker />
      <Footer />
    </div>
  );
}

export function PanelForge() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default function App() {
  return <PanelForge />;
}