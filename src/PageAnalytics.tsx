import { C, SANS, DISPLAY, glass, glassGold } from "./tokens";
import { SectionHead } from "./components";

/* ═══════════════════════════════════════════════════════════════════
   PAGE: ANALYTICS
   Creative output stats: monthly bar chart, style breakdown, avg panels
═══════════════════════════════════════════════════════════════════ */

export default function PageAnalytics() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const vals   = [4, 9, 6, 14, 11, 7];

  return (
    <div style={{ padding: "2.5rem" }}>
      <SectionHead label="Analytics" sub="Your creative output at a glance — last 6 months" />

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { l: "Total Comics",  v: "47",  d: "+14%" },
          { l: "Panels Made",   v: "312", d: "+22%" },
          { l: "Avg. Steps",    v: "30",  d: "stable" },
        ].map(s => (
          <div key={s.l} style={{ borderRadius: 10, padding: "1.4rem", position: "relative", overflow: "hidden", ...glass(0.04, 16) }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${C.gold}99, transparent)` }} />
            <p style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.26em", textTransform: "uppercase", color: C.muted, fontWeight: 700, marginBottom: "0.7rem" }}>{s.l}</p>
            <p style={{ fontFamily: DISPLAY, fontSize: 42, color: C.main, letterSpacing: "0.04em", lineHeight: 1 }}>{s.v}</p>
            <p style={{ fontFamily: SANS, fontSize: 10, color: C.goldText, marginTop: "0.4rem" }}>{s.d}</p>
          </div>
        ))}
      </div>

      {/* Monthly bar chart */}
      <div style={{ borderRadius: 10, padding: "1.5rem 1.5rem 1.2rem", ...glass(0.035, 16) }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, boxShadow: `0 0 6px ${C.gold}` }} />
            <span style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.26em", textTransform: "uppercase", color: C.gold, fontWeight: 700 }}>Comics per Month</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 120, marginBottom: 8 }}>
          {months.map((m, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: SANS, fontSize: 10, color: C.goldText, fontWeight: 500 }}>{vals[i]}</span>
              <div style={{
                width: "100%", borderRadius: "3px 3px 0 0",
                height: `${(vals[i] / 14) * 96}px`,
                background: i === 5 ? `linear-gradient(180deg,${C.gold},${C.warm})` : `rgba(201,168,76,${0.12 + vals[i] / 40})`,
                boxShadow: i === 5 ? `0 0 14px ${C.gold}55` : undefined,
                transition: "height .5s ease",
              }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {months.map((m, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <span style={{ fontFamily: SANS, fontSize: 9, color: "rgba(237,232,225,0.2)" }}>{m}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom row: style breakdown + avg panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1.5rem" }}>
        {/* Style breakdown */}
        <div style={{ borderRadius: 10, padding: "1.4rem", ...glass(0.04, 16) }}>
          <p style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.26em", textTransform: "uppercase", color: C.muted, fontWeight: 700, marginBottom: "1rem" }}>Style Breakdown</p>
          {[["Comic Book", 42], ["Fantasy Art", 28], ["Anime/Manga", 18], ["Sci-Fi", 12]].map(([style, pct]) => (
            <div key={style as string} style={{ marginBottom: "0.8rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontFamily: SANS, fontSize: 11, color: C.muted }}>{style}</span>
                <span style={{ fontFamily: SANS, fontSize: 11, color: C.goldText }}>{pct}%</span>
              </div>
              <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
                <div style={{
                  height: "100%", width: `${pct}%`, borderRadius: 2,
                  background: `linear-gradient(90deg,${C.accent}aa,${C.gold})`,
                  boxShadow: `0 0 4px ${C.gold}44`,
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Avg panels */}
        <div style={{ borderRadius: 10, padding: "1.4rem", ...glass(0.04, 16) }}>
          <p style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.26em", textTransform: "uppercase", color: C.muted, fontWeight: 700, marginBottom: "1rem" }}>Avg. Panels / Comic</p>
          <p style={{ fontFamily: DISPLAY, fontSize: 64, color: C.gold, letterSpacing: "0.04em", lineHeight: 1, textShadow: `0 0 24px ${C.gold}44` }}>6.6</p>
          <p style={{ fontFamily: SANS, fontSize: 11, color: C.muted, marginTop: "0.5rem", fontWeight: 300 }}>ranging from 3 to 9</p>
          <div style={{ marginTop: "1rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {["3", "4", "5", "6", "7", "8", "9"].map((n, i) => (
              <div key={n} style={{
                borderRadius: 4, padding: "3px 8px", fontSize: 10, fontFamily: SANS,
                color: C.goldText,
                background: `rgba(201,168,76,${0.06 + i * 0.02})`,
                border: `1px solid ${C.goldBorder}`,
              }}>{n}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
