import React from "react";
import { C, SANS, DISPLAY, SERIF, glass, glassGold } from "./tokens";

/* ── SVG Icon Helper ── */
export function Icon({ d, size = 16, color = "currentColor", style = {} as React.CSSProperties }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {d.split(" M").map((seg: string, i: number) => (
        <path key={i} d={i === 0 ? seg : "M" + seg} />
      ))}
    </svg>
  );
}

/* ── GoldLine divider ── */
export function GoldLine() {
  return <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${C.goldBorder}, transparent)` }} />;
}

/* ── GoldPill label ── */
export function GoldPill({ children }: any) {
  return (
    <span style={{
      fontFamily: SANS, fontSize: 9, letterSpacing: "0.32em", textTransform: "uppercase",
      color: C.gold, padding: "3px 12px", borderRadius: 100, fontWeight: 700,
      ...glassGold(),
    }}>{children}</span>
  );
}

/* ── Section heading ── */
export function SectionHead({ label, sub }: { label: string; sub?: string }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <GoldPill>{label}</GoldPill>
      {sub && <p style={{ fontFamily: SANS, fontSize: 12, color: C.muted, marginTop: "0.5rem", fontWeight: 300 }}>{sub}</p>}
    </div>
  );
}

/* ── Stats card ── */
export function StatCard({ label, value, sub, accent }: any) {
  return (
    <div style={{ borderRadius: 10, padding: "1.4rem 1.6rem", position: "relative", overflow: "hidden", ...glass(0.035, 16) }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${accent}bb, transparent)` }} />
      <div style={{ position: "absolute", bottom: -20, right: -10, width: 70, height: 70, borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`, pointerEvents: "none" }} />
      <p style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.26em", textTransform: "uppercase",
        color: C.muted, fontWeight: 700, marginBottom: "0.9rem" }}>{label}</p>
      <p style={{ fontFamily: DISPLAY, fontSize: 40, letterSpacing: "0.04em", color: C.main, lineHeight: 1 }}>{value}</p>
      <p style={{ fontFamily: SANS, fontSize: 10, color: "rgba(237,232,225,0.25)", marginTop: "0.5rem", fontWeight: 300 }}>{sub}</p>
    </div>
  );
}

/* ── Content tab button ── */
export function ContentTab({ label, active, onClick }: any) {
  return (
    <button onClick={onClick} style={{
      fontFamily: SANS, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700,
      padding: "10px 20px", background: "none", border: "none", cursor: "pointer",
      color: active ? C.gold : "rgba(237,232,225,0.3)",
      borderBottom: active ? `1.5px solid ${C.gold}` : "1.5px solid transparent",
      transition: "all .22s ease", flexShrink: 0,
    }}>{label}</button>
  );
}

/* ── Slider control ── */
export function Slider({ label, hint, min, max, value, onChange, step = 1 }: any) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: C.goldText, fontWeight: 700 }}>{label}</span>
        <span style={{ fontFamily: DISPLAY, fontSize: 16, letterSpacing: "0.08em", color: C.main }}>{value}</span>
      </div>
      {hint && <p style={{ fontFamily: SANS, fontSize: 11, color: "rgba(237,232,225,0.28)", marginBottom: 10, lineHeight: 1.6 }}>{hint}</p>}
      <div style={{ position: "relative", height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`,
          background: `linear-gradient(90deg, ${C.accent}aa, ${C.gold})`, borderRadius: 2,
          boxShadow: `0 0 6px ${C.gold}44` }} />
        <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
          style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", width: "100%", height: 20, opacity: 0, cursor: "pointer", margin: 0 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
        <span style={{ fontFamily: SANS, fontSize: 10, color: "rgba(237,232,225,0.15)" }}>{min}</span>
        <span style={{ fontFamily: SANS, fontSize: 10, color: "rgba(237,232,225,0.15)" }}>{max}</span>
      </div>
    </div>
  );
}

/* ── Toggle switch ── */
export function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return (
    <button onClick={() => set(!on)} style={{
      width: 38, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
      background: on ? C.gold : "rgba(255,255,255,0.08)",
      boxShadow: on ? `0 0 10px ${C.gold}44` : "none",
      position: "relative", flexShrink: 0, transition: "all .25s",
    }}>
      <div style={{
        position: "absolute", top: 3, left: on ? 19 : 3, width: 16, height: 16,
        borderRadius: "50%", background: on ? C.bg : "rgba(255,255,255,0.35)",
        transition: "left .25s", boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
      }} />
    </button>
  );
}

/* ── Settings row ── */
export function SettingsRow({ label, desc, children }: any) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "1rem 0", borderBottom: `1px solid ${C.border}` }}>
      <div>
        <p style={{ fontFamily: SANS, fontSize: 13, color: C.main, fontWeight: 500 }}>{label}</p>
        <p style={{ fontFamily: SANS, fontSize: 11, color: "rgba(237,232,225,0.3)", marginTop: 2, fontWeight: 300 }}>{desc}</p>
      </div>
      <div style={{ flexShrink: 0, marginLeft: "1.5rem" }}>{children}</div>
    </div>
  );
}
