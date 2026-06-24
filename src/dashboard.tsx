import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { C, SANS, PAGE_META, glass } from "./tokens";

import Cursor       from "./Cursor";
import Sidebar      from "./Sidebar";
import TopBar       from "./TopBar";
import PageDashboard from "./PageDashboard";
import PageCrafter   from "./PageCrafter";
import PageHistory   from "./PageHistory";
import PageGallery   from "./PageGallery";
import PageTemplates from "./PageTemplates";
import PageAnalytics from "./PageAnalytics";
import PageSettings  from "./PageSettings";

/* ═══════════════════════════════════════════════════════════════════
   ROOT — Dashboard shell: ambient glows, sidebar, topbar, router
═══════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [page, setPage] = useState("dashboard");
  const meta = PAGE_META[page] ?? { title: page, sub: "" };

  return (
    <div style={{
      background: C.bg, color: C.main, minHeight: "100vh",
      display: "flex", fontFamily: SANS, position: "relative", overflow: "hidden",
    }}>
      {/* Ambient background glow orbs */}
      <div style={{
        position: "fixed", top: -100, left: -100, width: 400, height: 400, borderRadius: "50%",
        background: `radial-gradient(circle, ${C.gold}06 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", bottom: -80, right: -80, width: 350, height: 350, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(143,168,158,0.05) 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0,
      }} />

      <Cursor />
      <Sidebar active={page} setActive={setPage} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", overflow: "hidden", position: "relative", zIndex: 1 }}>
        <TopBar title={meta.title} sub={meta.sub} setPage={setPage} />

        <main style={{ flex: 1, overflowY: "auto" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ minHeight: "100%" }}
            >
              {page === "dashboard"  && <PageDashboard setPage={setPage} />}
              {page === "crafter"    && <PageCrafter />}
              {page === "history"    && <PageHistory />}
              {page === "gallery"    && <PageGallery />}
              {page === "templates"  && <PageTemplates setPage={setPage} />}
              {page === "analytics"  && <PageAnalytics />}
              {page === "settings"   && <PageSettings />}
              {!Object.keys(PAGE_META).includes(page) && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, color: `${C.gold}18`, fontStyle: "italic", fontWeight: 300 }}>Coming soon</p>
                    <p style={{ fontSize: 12, color: "rgba(237,232,225,0.2)", marginTop: "0.8rem" }}>This section is under construction</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <div style={{
          borderTop: `1px solid ${C.border}`, padding: "0.7rem 2.5rem",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
          ...glass(0.025, 20),
        }}>
          <p style={{ fontSize: 10, color: "rgba(237,232,225,0.14)", fontStyle: "italic" }}>
            Powered by AI. Results vary. Generation may take several minutes.
          </p>
          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.success, boxShadow: `0 0 6px ${C.success}` }} />
            <span style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.18em", color: "rgba(110,168,122,0.55)" }}>All systems operational</span>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500;600;700&family=Bebas+Neue&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{cursor:none;}
        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(201,168,76,0.18);border-radius:2px;}
        input,select,textarea{font-family:'DM Sans',sans-serif;color:#ede8e1;background:transparent;}
        input:-webkit-autofill{-webkit-text-fill-color:#ede8e1 !important;transition:background-color 9999s;}
        select option{background:#1e1b13;color:#ede8e1;}
        select{appearance:none;-webkit-appearance:none;}
      `}</style>
    </div>
  );
}