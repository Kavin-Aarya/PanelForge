import React from "react";

/* ═══════════════════════════════════════════════════════════════════
   DESIGN TOKENS — PanelForge editorial dark palette + gold
═══════════════════════════════════════════════════════════════════ */
export const C = {
  bg:         "#0a0908",
  surface:    "#111009",
  surface2:   "#17150f",
  surface3:   "#1e1b13",
  surface4:   "#24211a",
  primary:    "#b8a99a",
  accent:     "#8fa89e",
  warm:       "#c4956a",
  gold:       "#c9a84c",
  goldDim:    "rgba(201,168,76,0.12)",
  goldBorder: "rgba(201,168,76,0.22)",
  goldGlow:   "rgba(201,168,76,0.08)",
  goldText:   "rgba(201,168,76,0.9)",
  main:       "#ede8e1",
  muted:      "rgba(237,232,225,0.38)",
  faint:      "rgba(237,232,225,0.05)",
  border:     "rgba(237,232,225,0.055)",
  borderMid:  "rgba(184,169,154,0.16)",
  success:    "#6ea87a",
  successDim: "rgba(110,168,122,0.1)",
  glass:      "rgba(255,255,255,0.03)",
  glassBorder:"rgba(255,255,255,0.07)",
};

export const SERIF   = "'Cormorant Garamond', serif";
export const SANS    = "'DM Sans', sans-serif";
export const DISPLAY = "'Bebas Neue', sans-serif";

/* ── Liquid Glass mixins ── */
export const glass = (alpha = 0.04, blur = 18): React.CSSProperties => ({
  background: `rgba(255,255,255,${alpha})`,
  backdropFilter: `blur(${blur}px) saturate(160%)`,
  WebkitBackdropFilter: `blur(${blur}px) saturate(160%)`,
  border: "1px solid rgba(255,255,255,0.07)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)",
});

export const glassGold = (): React.CSSProperties => ({
  background: "rgba(201,168,76,0.06)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
  border: `1px solid ${C.goldBorder}`,
  boxShadow: `inset 0 1px 0 rgba(201,168,76,0.12), 0 4px 24px rgba(201,168,76,0.08)`,
});

/* ═══════════════════════════════════════════════════════════════════
   STATIC DATA
═══════════════════════════════════════════════════════════════════ */
export const ART_STYLES = [
  { id:"comic",      label:"Comic Book (Default)" },
  { id:"anime",      label:"Anime / Manga"        },
  { id:"fantasy",    label:"Fantasy Art"          },
  { id:"scifi",      label:"Sci-Fi Concept Art"   },
  { id:"pixel",      label:"Pixel Art"            },
  { id:"minimal",    label:"Minimalist Line Art"  },
  { id:"watercolor", label:"Watercolor"           },
  { id:"none",       label:"No Specific Style"    },
];

export const PANELS_IMGS = [
  "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=480&q=80",
  "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=480&q=80",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=480&q=80",
  "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=480&q=80",
  "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=480&q=80",
  "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=480&q=80",
];

export const HISTORY_DATA = [
  { id:1, title:"Superman Saves Metropolis",  style:"Comic Book",   panels:6, date:"Today, 11:14 PM",  status:"done",       thumb:PANELS_IMGS[0] },
  { id:2, title:"Dragon vs. Knight at Dawn",  style:"Fantasy Art",  panels:4, date:"Today, 09:40 AM",  status:"done",       thumb:PANELS_IMGS[3] },
  { id:3, title:"Robot Uprising on Mars",     style:"Sci-Fi",       panels:8, date:"Yesterday",         status:"done",       thumb:PANELS_IMGS[2] },
  { id:4, title:"The Last Samurai's Journey", style:"Anime/Manga",  panels:6, date:"Apr 3",             status:"done",       thumb:PANELS_IMGS[1] },
  { id:5, title:"Vegetable Rock Band",         style:"Watercolor",   panels:5, date:"Apr 1",             status:"done",       thumb:PANELS_IMGS[4] },
  { id:6, title:"Neon City Detective",         style:"Pixel Art",    panels:9, date:"Mar 28",            status:"processing", thumb:PANELS_IMGS[5] },
];

export const STATS = [
  { label:"Comics Created",   value:"47",  sub:"+12 this month",  accent:C.gold    },
  { label:"Panels Generated", value:"312", sub:"+68 this month",  accent:C.accent  },
  { label:"Styles Used",      value:"6",   sub:"of 8 available",  accent:C.warm    },
  { label:"Avg. Quality",     value:"94%", sub:"based on steps",  accent:C.success },
];

export const NAV_ITEMS = [
  { id:"dashboard", icon:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", label:"Dashboard"     },
  { id:"crafter",   icon:"M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", label:"Comic Crafter"  },
  { id:"history",   icon:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",                                                                                                               label:"History"        },
  { id:"gallery",   icon:"M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z", label:"Gallery"        },
  { id:"templates", icon:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",                                      label:"Templates"      },
  { id:"analytics", icon:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", label:"Analytics"      },
  { id:"settings",  icon:"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z", label:"Settings" },
];

export const BOTTOM_NAV = [
  { id:"help",    icon:"M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label:"Help & Docs" },
  { id:"billing", icon:"M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",                                                                   label:"Billing"     },
];

export const GALLERY_ITEMS = [
  { title:"Cosmic Odyssey",   style:"Sci-Fi",      panels:6, likes:128, thumb:PANELS_IMGS[2] },
  { title:"Forest Spirits",   style:"Fantasy Art", panels:4, likes:94,  thumb:PANELS_IMGS[3] },
  { title:"Steel & Soul",     style:"Anime/Manga", panels:8, likes:217, thumb:PANELS_IMGS[1] },
  { title:"Pixel Metropolis", style:"Pixel Art",   panels:5, likes:76,  thumb:PANELS_IMGS[5] },
  { title:"Ink & Wash",       style:"Watercolor",  panels:3, likes:143, thumb:PANELS_IMGS[4] },
  { title:"The Iron Archive", style:"Comic Book",  panels:9, likes:301, thumb:PANELS_IMGS[0] },
];

export const TEMPLATES = [
  { id:"hero",    label:"Hero's Journey",  panels:6, style:"Comic Book",  desc:"Classic 6-act superhero arc with action beats" },
  { id:"mystery", label:"Mystery Noir",    panels:8, style:"Minimal Line",desc:"Detective story with twist reveal in final panel" },
  { id:"romance", label:"Star-Crossed",    panels:4, style:"Watercolor",  desc:"Short-form romance with lyrical visual pacing" },
  { id:"scifi",   label:"First Contact",   panels:6, style:"Sci-Fi",      desc:"Alien encounter told through dual perspectives" },
  { id:"fable",   label:"Moral Fable",     panels:5, style:"Fantasy Art", desc:"Illustrated moral tale with symbolic imagery" },
  { id:"action",  label:"Battle Sequence", panels:9, style:"Anime/Manga", desc:"High-energy combat with dynamic panel layouts" },
];

export const PAGE_META: Record<string, { title: string; sub: string }> = {
  dashboard: { title:"Dashboard",     sub:"Welcome back, Jamie. Let's create." },
  crafter:   { title:"Comic Crafter", sub:"Generate stories & visuals powered by AI." },
  history:   { title:"History",       sub:"All your previously generated comics." },
  gallery:   { title:"Gallery",       sub:"Published and favourite comic pages." },
  templates: { title:"Templates",     sub:"Start from a curated comic structure." },
  analytics: { title:"Analytics",     sub:"Your creative output over time." },
  settings:  { title:"Settings",      sub:"Manage your account and preferences." },
};
