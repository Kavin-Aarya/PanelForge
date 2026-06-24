import { motion } from "framer-motion";
import { C, SANS, SERIF, DISPLAY, STATS, HISTORY_DATA, glass, glassGold } from "./tokens";
import { SectionHead, StatCard } from "./components";

/* ═══════════════════════════════════════════════════════════════════
   PAGE: DASHBOARD OVERVIEW
   Sections: stats grid, recent comics, quick-start, credits, activity chart
═══════════════════════════════════════════════════════════════════ */

interface PageDashboardProps {
  setPage: (s: string) => void;
}

export default function PageDashboard({ setPage }: PageDashboardProps) {
  const bars = [3, 7, 2, 9, 5, 6, 12, 4, 8, 11, 6, 9, 14, 7];

  return (
    <div style={{ padding: "2.5rem" }}>
      <SectionHead label="Overview" sub="Your creative studio at a glance — today, Jun 1 2026" />

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {STATS.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Middle row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>

        {/* Recent comics */}
        <div style={{ borderRadius: 10, overflow: "hidden", ...glass(0.035, 16) }}>
          <div style={{
            padding: "1.1rem 1.5rem", borderBottom: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, boxShadow: `0 0 6px ${C.gold}` }} />
              <span style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.26em", textTransform: "uppercase", color: C.gold, fontWeight: 700 }}>Recent Comics</span>
            </div>
            <button
              onClick={() => setPage("history")}
              style={{ fontFamily: SANS, fontSize: 10, color: C.muted, background: "none", border: "none", cursor: "pointer", letterSpacing: "0.08em", transition: "color .2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = C.gold)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
            >View all →</button>
          </div>
          {HISTORY_DATA.slice(0, 4).map((item, i) => (
            <div
              key={item.id}
              style={{
                display: "flex", alignItems: "center", gap: "1rem", padding: "0.85rem 1.5rem",
                borderBottom: i < 3 ? `1px solid ${C.border}` : "none",
                cursor: "pointer", transition: "background .18s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(201,168,76,0.04)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ width: 50, height: 38, borderRadius: 4, overflow: "hidden", flexShrink: 0, border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
                <img src={item.thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: SANS, fontSize: 13, color: C.main, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</p>
                <p style={{ fontFamily: SANS, fontSize: 10, color: C.muted, marginTop: 2 }}>{item.style} · {item.panels} panels</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <span style={{
                  fontFamily: SANS, fontSize: 9, padding: "2px 9px", borderRadius: 100,
                  color: item.status === "done" ? C.success : C.warm,
                  background: item.status === "done" ? C.successDim : "rgba(196,149,106,0.1)",
                  border: item.status === "done" ? "1px solid rgba(110,168,122,0.2)" : "1px solid rgba(196,149,106,0.2)",
                }}>{item.status === "done" ? "✓ Done" : "⟳ Processing"}</span>
                <span style={{ fontFamily: SANS, fontSize: 9, color: "rgba(237,232,225,0.2)" }}>{item.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Quick Start */}
          <div style={{ borderRadius: 10, padding: "1.4rem", position: "relative", overflow: "hidden", ...glassGold() }}>
            <div style={{
              position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%",
              background: `radial-gradient(circle, ${C.gold}18 0%, transparent 70%)`, pointerEvents: "none",
            }} />
            <p style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: C.gold, fontWeight: 700, marginBottom: "0.6rem" }}>Quick Start</p>
            <p style={{ fontFamily: SERIF, fontSize: 22, color: C.main, fontWeight: 700, lineHeight: 1.1, marginBottom: "1rem" }}>
              Begin a <span style={{ fontStyle: "italic", color: C.primary }}>new story</span>
            </p>
            <motion.button
              onClick={() => setPage("crafter")}
              whileTap={{ scale: 0.97 }}
              style={{
                width: "100%", padding: "0.8rem",
                background: `linear-gradient(135deg,${C.gold},#e8c05a)`,
                border: "none", borderRadius: 7, fontFamily: SANS, fontSize: 10,
                letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700,
                color: C.bg, cursor: "pointer", transition: "box-shadow .2s",
                boxShadow: `0 3px 16px rgba(201,168,76,0.35)`,
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 5px 24px rgba(201,168,76,0.55)`)}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = `0 3px 16px rgba(201,168,76,0.35)`)}
            >Open Crafter →</motion.button>
          </div>

          {/* Credits */}
          <div style={{ borderRadius: 10, padding: "1.4rem", ...glass(0.035, 16) }}>
            <p style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.26em", textTransform: "uppercase", color: C.muted, fontWeight: 700, marginBottom: "0.8rem" }}>Credits Remaining</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem", marginBottom: "0.8rem" }}>
              <span style={{ fontFamily: DISPLAY, fontSize: 42, color: C.gold, letterSpacing: "0.04em", textShadow: `0 0 20px ${C.gold}44` }}>184</span>
              <span style={{ fontFamily: SANS, fontSize: 11, color: C.muted }}>/250</span>
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, marginBottom: "0.5rem", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: "73.6%", borderRadius: 2,
                background: `linear-gradient(90deg, ${C.accent}aa, ${C.gold})`,
                boxShadow: `0 0 6px ${C.gold}44`,
              }} />
            </div>
            <p style={{ fontFamily: SANS, fontSize: 10, color: "rgba(237,232,225,0.2)", fontWeight: 300 }}>66 used · resets Jun 15</p>
          </div>
        </div>
      </div>

      {/* Activity bar chart */}
      <div style={{ borderRadius: 10, padding: "1.5rem", ...glass(0.03, 16) }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, boxShadow: `0 0 6px ${C.gold}` }} />
            <span style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.26em", textTransform: "uppercase", color: C.gold, fontWeight: 700 }}>Generation Activity</span>
          </div>
          <span style={{ fontFamily: SANS, fontSize: 10, color: "rgba(237,232,225,0.25)" }}>Last 14 days</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 80 }}>
          {bars.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: "100%", borderRadius: "2px 2px 0 0", height: `${(v / 14) * 72}px`,
                background: i === 13 ? C.gold : `rgba(201,168,76,${0.12 + v / 28})`,
                boxShadow: i === 13 ? `0 0 12px ${C.gold}66` : undefined,
                transition: "height .5s ease", cursor: "pointer",
              }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontFamily: SANS, fontSize: 9, color: "rgba(237,232,225,0.15)" }}>May 18</span>
          <span style={{ fontFamily: SANS, fontSize: 9, color: C.goldText }}>Today</span>
        </div>
      </div>
    </div>
  );
}
