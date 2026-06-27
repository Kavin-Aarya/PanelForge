import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { C, SANS, SERIF, DISPLAY, NAV_ITEMS, BOTTOM_NAV, glass, glassGold } from "./tokens";
import { Icon, GoldLine } from "./components";
import { authedFetch } from "./api";

/* ═══════════════════════════════════════════════════════════════════
   SIDEBAR — Collapsible navigation panel with gold accents
   Features: animated collapse, active indicator, user badge, version strip
═══════════════════════════════════════════════════════════════════ */

interface SidebarProps {
  active: string;
  setActive: (s: string) => void;
}

interface UserData {
  id: number;
  email: string;
  username: string;
  createdAt: string;
  name: string;
}

export default function Sidebar({ active, setActive }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await authedFetch("/api/settings/user");

        if (!response.ok) {
          throw new Error(`Server returned status: ${response.status}`);
        }

        const responseText = await response.text();
        // Check if the backend sent us a completely empty response
        if (!responseText || responseText.trim() === "") {
          throw new Error("Backend connected, but returned no user data.");
        }

        // It is now safe to parse the JSON
        const data: UserData = JSON.parse(responseText);
        setUserDetails(data);
      } catch (err: any) {
        setError(err.message || 'Failed to pull database data.');
      }
    };
    fetchUserDetails();
  },[])
  const W = collapsed ? 66 : 228;

  return (
    <motion.aside
      animate={{ width: W }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      style={{
        width: W, minHeight: "100vh", flexShrink: 0, position: "relative", zIndex: 10,
        overflow: "hidden", display: "flex", flexDirection: "column",
        background: "rgba(10,9,8,0.85)",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
        borderRight: `1px solid ${C.glassBorder}`,
        boxShadow: "inset -1px 0 0 rgba(255,255,255,0.04), 4px 0 30px rgba(0,0,0,0.5)",
      }}
    >
      {/* Vertical gold accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0, width: 1.5,
        background: `linear-gradient(180deg, transparent 0%, ${C.gold}60 25%, ${C.gold}aa 55%, ${C.gold}60 80%, transparent 100%)`,
        pointerEvents: "none",
      }} />

      {/* Ambient gold glow */}
      <div style={{
        position: "absolute", top: -40, left: -20, width: 160, height: 160, borderRadius: "50%",
        background: `radial-gradient(circle, ${C.gold}0c 0%, transparent 70%)`, pointerEvents: "none",
      }} />

      {/* ── Logo ── */}
      <div style={{
        padding: collapsed ? "1.4rem 0" : "1.4rem 1.4rem",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        minHeight: 65, position: "relative",
      }}>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{ display: "flex", alignItems: "baseline", gap: 2 }}
            >
              <span style={{ fontFamily: DISPLAY, fontSize: 23, color: C.gold, letterSpacing: "0.12em", textShadow: `0 0 20px ${C.gold}66` }}>PANEL</span>
              <span style={{ fontFamily: SERIF, fontSize: 21, color: "rgba(237,232,225,0.22)", fontStyle: "italic", fontWeight: 300 }}>Forge</span>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <span style={{ fontFamily: DISPLAY, fontSize: 17, color: C.gold, letterSpacing: "0.1em", textShadow: `0 0 14px ${C.gold}66` }}>PF</span>
        )}
        <button
          onClick={() => setCollapsed(v => !v)}
          style={{
            background: "rgba(255,255,255,0.04)", border: `1px solid ${C.glassBorder}`,
            borderRadius: 5, cursor: "pointer", color: "rgba(237,232,225,0.25)",
            width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, flexShrink: 0, transition: "all .2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.goldBorder; e.currentTarget.style.color = C.gold; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.glassBorder; e.currentTarget.style.color = "rgba(237,232,225,0.25)"; }}
        >{collapsed ? "→" : "←"}</button>
      </div>

      {/* ── User badge ── */}
      <div style={{
        padding: collapsed ? "1rem 0" : "1rem 1.3rem",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", gap: "0.75rem",
        justifyContent: collapsed ? "center" : "flex-start",
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
          background: `radial-gradient(circle at 35% 35%, ${C.gold}44, ${C.surface4})`,
          border: `1.5px solid ${C.goldBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 12px ${C.gold}22`,
        }}>
          <span style={{ fontFamily: SANS, fontSize: 11, color: C.gold, fontWeight: 700 }}>JD</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <p style={{ fontFamily: SANS, fontSize: 12, color: C.main, fontWeight: 600, lineHeight: 1 }}>{userDetails?.username || "Loading Name..."}</p>
              <p style={{ fontFamily: SANS, fontSize: 9, color: C.goldText, marginTop: 3, fontWeight: 400, letterSpacing: "0.08em" }}>Pro Creator</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Main nav ── */}
      <nav style={{ flex: 1, padding: "0.75rem 0", display: "flex", flexDirection: "column", gap: 1 }}>
        <AnimatePresence>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              style={{
                fontFamily: SANS, fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase",
                color: "rgba(201,168,76,0.3)", fontWeight: 700,
                padding: "0.6rem 1.4rem 0.3rem", userSelect: "none",
              }}
            >Main</motion.p>
          )}
        </AnimatePresence>

        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: "0.8rem",
                padding: collapsed ? "0.7rem 0" : "0.7rem 1.3rem",
                justifyContent: collapsed ? "center" : "flex-start",
                background: isActive ? "rgba(201,168,76,0.1)" : "none",
                border: "none",
                borderLeft: isActive ? `2px solid ${C.gold}` : "2px solid transparent",
                cursor: "pointer", transition: "all .18s ease",
                position: "relative", width: "100%",
                backdropFilter: isActive ? "blur(10px)" : "none",
                boxShadow: isActive ? `inset 0 0 20px rgba(201,168,76,0.04)` : "none",
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "none"; }}
            >
              <span style={{
                color: isActive ? C.gold : "rgba(237,232,225,0.35)", flexShrink: 0,
                filter: isActive ? `drop-shadow(0 0 4px ${C.gold}88)` : "none", transition: "all .18s",
              }}>
                <Icon d={item.icon} size={16} color={isActive ? C.gold : "rgba(237,232,225,0.35)"} />
              </span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.16 }}
                    style={{
                      fontFamily: SANS, fontSize: 12, fontWeight: isActive ? 600 : 400,
                      color: isActive ? C.gold : "rgba(237,232,225,0.45)",
                      letterSpacing: isActive ? "0.04em" : "0", whiteSpace: "nowrap",
                    }}
                  >{item.label}</motion.span>
                )}
              </AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  style={{
                    position: "absolute", right: 0, width: 3, height: "55%",
                    background: C.gold, borderRadius: "2px 0 0 2px",
                    boxShadow: `0 0 10px ${C.gold}99`,
                  }}
                />
              )}
            </button>
          );
        })}

        <div style={{ margin: "0.5rem 0" }}><GoldLine /></div>

        <AnimatePresence>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              style={{
                fontFamily: SANS, fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase",
                color: "rgba(201,168,76,0.3)", fontWeight: 700,
                padding: "0.3rem 1.4rem", userSelect: "none",
              }}
            >Support</motion.p>
          )}
        </AnimatePresence>

        {BOTTOM_NAV.map(item => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            style={{
              display: "flex", alignItems: "center", gap: "0.8rem",
              padding: collapsed ? "0.6rem 0" : "0.6rem 1.3rem",
              justifyContent: collapsed ? "center" : "flex-start",
              background: "none", border: "none", cursor: "pointer", width: "100%", transition: "background .15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
            onMouseLeave={e => (e.currentTarget.style.background = "none")}
          >
            <Icon d={item.icon} size={15} color="rgba(237,232,225,0.22)" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.16 }}
                  style={{ fontFamily: SANS, fontSize: 11, color: "rgba(237,232,225,0.25)", whiteSpace: "nowrap", fontWeight: 300 }}
                >{item.label}</motion.span>
              )}
            </AnimatePresence>
          </button>
        ))}
      </nav>

      {/* ── Version strip ── */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              padding: "0.8rem 1.3rem", borderTop: `1px solid ${C.border}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}
          >
            <p style={{ fontFamily: SANS, fontSize: 8, color: "rgba(237,232,225,0.1)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              PANELFORGE v2.4.1
            </p>
            <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.success, boxShadow: `0 0 5px ${C.success}` }} />
              <span style={{ fontSize: 8, color: "rgba(110,168,122,0.5)", letterSpacing: "0.12em" }}>LIVE</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}