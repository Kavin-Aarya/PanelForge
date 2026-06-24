import { C, SANS, SERIF, DISPLAY, TEMPLATES, glass, glassGold } from "./tokens";
import { SectionHead } from "./components";

/* ═══════════════════════════════════════════════════════════════════
   PAGE: TEMPLATES
   Curated comic structure templates to jumpstart creation
═══════════════════════════════════════════════════════════════════ */

interface PageTemplatesProps {
  setPage: (s: string) => void;
}

export default function PageTemplates({ setPage }: PageTemplatesProps) {
  return (
    <div style={{ padding: "2.5rem" }}>
      <SectionHead label="Templates" sub="Start from a curated comic structure — then make it your own" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
        {TEMPLATES.map((t, i) => (
          <div
            key={i}
            style={{ borderRadius: 10, padding: "1.5rem", position: "relative", overflow: "hidden", cursor: "pointer", transition: "all .22s", ...glass(0.04, 16) }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 8px 32px rgba(201,168,76,0.1), inset 0 1px 0 rgba(255,255,255,0.08)`)}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)")}
          >
            {/* Top accent line */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${C.gold}88, transparent)` }} />

            {/* Header row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.9rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", ...glassGold() }}>
                <span style={{ fontFamily: DISPLAY, fontSize: 16, color: C.gold }}>#{i + 1}</span>
              </div>
              <div style={{ display: "flex", gap: "0.35rem" }}>
                <span style={{
                  fontFamily: SANS, fontSize: 9, padding: "2px 8px", borderRadius: 100, color: C.muted,
                  background: "rgba(255,255,255,0.04)", border: `1px solid ${C.glassBorder}`,
                }}>{t.panels} panels</span>
              </div>
            </div>

            <p style={{ fontFamily: SERIF, fontSize: 18, color: C.main, fontWeight: 700, marginBottom: "0.4rem" }}>{t.label}</p>
            <p style={{ fontFamily: SANS, fontSize: 10, color: C.goldText, letterSpacing: "0.08em", marginBottom: "0.7rem" }}>{t.style}</p>
            <p style={{ fontFamily: SANS, fontSize: 12, color: "rgba(237,232,225,0.4)", lineHeight: 1.7, marginBottom: "1.2rem", fontWeight: 300 }}>{t.desc}</p>

            <button
              onClick={() => setPage("crafter")}
              style={{
                width: "100%", padding: "0.65rem", border: `1px solid ${C.goldBorder}`, borderRadius: 6,
                fontFamily: SANS, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700,
                color: C.gold, background: C.goldDim, cursor: "pointer", transition: "all .2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,168,76,0.18)"; e.currentTarget.style.boxShadow = `0 0 16px ${C.gold}33`; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.goldDim; e.currentTarget.style.boxShadow = "none"; }}
            >Use Template →</button>
          </div>
        ))}
      </div>
    </div>
  );
}
