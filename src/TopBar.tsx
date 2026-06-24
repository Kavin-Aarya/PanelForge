import { useState } from "react";
import { motion } from "framer-motion";
import { C, SANS, SERIF, glass, glassGold } from "./tokens";

/* ═══════════════════════════════════════════════════════════════════
   TOP BAR — Global header with search, notifications, and user avatar
═══════════════════════════════════════════════════════════════════ */

interface TopBarProps {
  title: string;
  sub: string;
  setPage: (s: string) => void;
}

export default function TopBar({ title, sub, setPage }: TopBarProps) {
  const [notifs] = useState(3);

  return (
    <div style={{
      height: 65, borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 2.5rem", flexShrink: 0,
      ...glass(0.03, 20),
    }}>
      <div>
        <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em", color: C.main }}>{title}</h2>
        <p style={{ fontFamily: SANS, fontSize: 10, color: "rgba(237,232,225,0.3)", fontWeight: 300, marginTop: 2 }}>{sub}</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {/* Search */}
        <div style={{ position: "relative" }}>
          <input
            placeholder="Search projects…"
            style={{
              borderRadius: 6, padding: "7px 12px 7px 34px",
              fontFamily: SANS, fontSize: 12, color: C.main, width: 200, outline: "none",
              transition: "all .2s", ...glass(0.04, 16),
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = C.goldBorder;
              e.currentTarget.style.boxShadow = `0 0 0 1px ${C.goldBorder}, inset 0 1px 0 rgba(255,255,255,0.06)`;
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = C.glassBorder;
              e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.06)";
            }}
          />
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(237,232,225,0.25)" strokeWidth="2" strokeLinecap="round"
            style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
        </div>

        {/* Notifications */}
        <button
          style={{
            position: "relative", width: 36, height: 36, borderRadius: 8, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s",
            ...glass(0.04, 16),
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.goldBorder; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.glassBorder; }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(237,232,225,0.45)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {notifs > 0 && (
            <div style={{
              position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%",
              background: C.gold, border: `1.5px solid ${C.bg}`, boxShadow: `0 0 6px ${C.gold}`,
            }} />
          )}
        </button>

        {/* New comic button */}
        <motion.button
          onClick={() => setPage("crafter")}
          whileTap={{ scale: 0.97 }}
          style={{
            padding: "8px 18px", borderRadius: 7, fontFamily: SANS, fontSize: 10,
            letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700,
            color: C.bg, cursor: "pointer", border: "none",
            background: `linear-gradient(135deg, ${C.gold} 0%, #e8c05a 50%, ${C.warm} 100%)`,
            boxShadow: `0 2px 16px rgba(201,168,76,0.3)`, transition: "box-shadow .2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 24px rgba(201,168,76,0.5)`; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 2px 16px rgba(201,168,76,0.3)`; }}
        >+ New Comic</motion.button>

        {/* Avatar */}
        <div
          style={{
            width: 36, height: 36, borderRadius: "50%", cursor: "pointer",
            background: `radial-gradient(circle at 35% 35%, ${C.gold}55, ${C.surface4})`,
            border: `1.5px solid ${C.goldBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 14px ${C.gold}22`, transition: "box-shadow .2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 0 20px ${C.gold}44`)}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = `0 0 14px ${C.gold}22`)}
        >
          <span style={{ fontFamily: SANS, fontSize: 11, color: C.gold, fontWeight: 700 }}>JD</span>
        </div>
      </div>
    </div>
  );
}
