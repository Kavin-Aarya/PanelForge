import { C, SANS, GALLERY_ITEMS, glass } from "./tokens";
import { SectionHead } from "./components";

/* ═══════════════════════════════════════════════════════════════════
   PAGE: GALLERY
   Community favourites and published comics
═══════════════════════════════════════════════════════════════════ */

export default function PageGallery() {
  return (
    <div style={{ padding: "2.5rem" }}>
      <SectionHead label="Gallery" sub="Published comics and community favourites" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
        {GALLERY_ITEMS.map((item, i) => (
          <div
            key={i}
            style={{ borderRadius: 10, overflow: "hidden", cursor: "pointer", transition: "all .22s", ...glass(0.035, 16) }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 10px 32px rgba(201,168,76,0.12), inset 0 1px 0 rgba(255,255,255,0.06)`)}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)")}
          >
            {/* Thumbnail */}
            <div style={{ height: 160, overflow: "hidden", position: "relative" }}>
              <img src={item.thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s", filter: "brightness(0.75)" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(10,9,8,0.75))" }} />
            </div>

            {/* Info */}
            <div style={{ padding: "1rem 1.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontFamily: SANS, fontSize: 13, color: C.main, fontWeight: 600 }}>{item.title}</p>
                  <p style={{ fontFamily: SANS, fontSize: 10, color: C.muted, marginTop: 3 }}>{item.style}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <span style={{ fontSize: 10, color: C.gold }}>♥</span>
                  <span style={{ fontFamily: SANS, fontSize: 11, color: C.goldText }}>{item.likes}</span>
                </div>
              </div>
              <div style={{ marginTop: "0.7rem", display: "flex", gap: "0.4rem" }}>
                <span style={{
                  fontFamily: SANS, fontSize: 9, padding: "2px 8px", borderRadius: 100, color: C.accent,
                  background: "rgba(143,168,158,0.1)", border: "1px solid rgba(143,168,158,0.2)",
                }}>{item.panels} panels</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
