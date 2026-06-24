import { useState } from "react";
import { C, SANS, HISTORY_DATA, glass } from "./tokens";
import { SectionHead } from "./components";

/* ═══════════════════════════════════════════════════════════════════
   PAGE: HISTORY
   Filterable card grid of all previously generated comics
═══════════════════════════════════════════════════════════════════ */

export default function PageHistory() {
  const [filter, setFilter] = useState("all");
  const filters = ["all", "done", "processing"];
  const shown = filter === "all" ? HISTORY_DATA : HISTORY_DATA.filter(h => h.status === filter);

  return (
    <div style={{ padding: "2.5rem" }}>
      <SectionHead label="History" sub="All previously generated comics — sorted by most recent" />

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            fontFamily: SANS, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600,
            padding: "6px 16px", borderRadius: 5, border: "none", cursor: "pointer", transition: "all .18s",
            color: filter === f ? C.bg : C.muted,
            background: filter === f ? C.gold : "rgba(255,255,255,0.04)",
            boxShadow: filter === f ? `0 2px 12px ${C.gold}44` : "none",
          }}>
            {f === "all" ? "All" : f === "done" ? "Completed" : "Processing"}
          </button>
        ))}
      </div>

      {/* Card grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
        {shown.map(item => (
          <div
            key={item.id}
            style={{ borderRadius: 10, overflow: "hidden", cursor: "pointer", transition: "all .2s", ...glass(0.035, 16) }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 8px 30px rgba(201,168,76,0.1), inset 0 1px 0 rgba(255,255,255,0.06)`)}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)")}
          >
            {/* Thumbnail */}
            <div style={{ height: 140, overflow: "hidden", position: "relative" }}>
              <img src={item.thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.8)" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(10,9,8,0.8) 100%)" }} />
              <span style={{
                position: "absolute", top: 10, right: 10,
                fontFamily: SANS, fontSize: 9, padding: "2px 9px", borderRadius: 100,
                color: item.status === "done" ? C.success : C.warm,
                background: item.status === "done" ? "rgba(110,168,122,0.18)" : "rgba(196,149,106,0.18)",
                border: item.status === "done" ? "1px solid rgba(110,168,122,0.3)" : "1px solid rgba(196,149,106,0.3)",
                backdropFilter: "blur(8px)",
              }}>{item.status === "done" ? "✓ Done" : "⟳ Processing"}</span>
            </div>

            {/* Info */}
            <div style={{ padding: "1rem 1.2rem" }}>
              <p style={{ fontFamily: SANS, fontSize: 13, color: C.main, fontWeight: 600, marginBottom: 4 }}>{item.title}</p>
              <p style={{ fontFamily: SANS, fontSize: 11, color: C.muted }}>{item.style} · {item.panels} panels</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.9rem", paddingTop: "0.7rem", borderTop: `1px solid ${C.border}` }}>
                <span style={{ fontFamily: SANS, fontSize: 10, color: "rgba(237,232,225,0.2)" }}>{item.date}</span>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  {["↓", "→"].map((ic, i) => (
                    <button
                      key={i}
                      style={{ width: 26, height: 26, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.muted, fontSize: 11, transition: "all .15s", ...glass(0.05, 10) }}
                      onMouseEnter={e => (e.currentTarget.style.color = C.gold)}
                      onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
                    >{ic}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
