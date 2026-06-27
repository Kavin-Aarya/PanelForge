import { useEffect, useState } from "react";
import { C, SANS, glass } from "./tokens";
import { SectionHead } from "./components";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════════ */

interface ComicSummary {
  id: string;
  storyTitle: string;
  artStyle: string;
  numberOfPanels: number;
  thumbnail: string | null;
  generateComic: boolean;
}

interface ComicDetail {
  id: string;
  storyTitle: string;
  storyline: string;
  characters: string;
  moral: string;
  artStyle: string;
  numberOfPanels: number;
  panelWidth: number;
  panelHeight: number;
  layoutImage: string | null;
  panelImages: string[] | null;
}


/* ═══════════════════════════════════════════════════════════════════
   API HELPERS
   NOTE: assumes the access token is stored under "accessToken" in
   localStorage — update the key below if yours differs.
═══════════════════════════════════════════════════════════════════ */

const API_BASE = "/api/comics";

function authHeaders() {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchMyComics(): Promise<ComicSummary[]> {
  const res = await fetch(`${API_BASE}/mine`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load comic history.");
  return res.json();
}

async function fetchComicDetail(id: string): Promise<ComicDetail> {
  const res = await fetch(`${API_BASE}/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load comic detail.");
  return res.json();
}

/**
 * Comic images are stored in Postgres as raw base64 (no "data:" prefix).
 * This normalizes any of: raw base64 / full data URI / external URL into
 * a valid <img src>. Long-term, prepending the prefix on the backend DTO
 * is cleaner — this is the resilient fallback either way.
 */
function toImageSrc(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("data:") || value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  // Bare base64 — assume PNG; change to image/jpeg if your generator outputs JPEGs.
  return `data:image/png;base64,${value}`;
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE: HISTORY
   Filterable card grid of all previously generated comics
═══════════════════════════════════════════════════════════════════ */

export default function PageHistory() {
  const [filter, setFilter] = useState("all");
  const filters = ["all", "done", "processing"];

  const [comics, setComics] = useState<ComicSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchMyComics()
      .then(data => {
        if (!cancelled) setComics(data);
      })
      .catch(err => {
        if (!cancelled) setError(err.message ?? "Something went wrong.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const statusOf = (c: ComicSummary) => (c.generateComic ? "done" : "processing");
  const shown = filter === "all" ? comics : comics.filter(c => statusOf(c) === filter);

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

      {/* Loading / error states */}
      {loading && (
        <p style={{ fontFamily: SANS, fontSize: 12, color: C.muted }}>Loading your comics…</p>
      )}
      {!loading && error && (
        <p style={{ fontFamily: SANS, fontSize: 12, color: C.warm }}>{error}</p>
      )}
      {!loading && !error && shown.length === 0 && (
        <p style={{ fontFamily: SANS, fontSize: 12, color: C.muted }}>No comics here yet.</p>
      )}

      {/* Card grid */}
      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {shown.map(item => {
            const status = statusOf(item);
            return (
              <div
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                style={{ borderRadius: 10, overflow: "hidden", cursor: "pointer", transition: "all .2s", ...glass(0.035, 16) }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 8px 30px rgba(201,168,76,0.1), inset 0 1px 0 rgba(255,255,255,0.06)`)}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)")}
              >
                {/* Thumbnail */}
                <div style={{ height: 140, overflow: "hidden", position: "relative" }}>
                  {toImageSrc(item.thumbnail) && (
                    <img src={toImageSrc(item.thumbnail)!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.8)" }} />
                  )}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(10,9,8,0.8) 100%)" }} />
                  <span style={{
                    position: "absolute", top: 10, right: 10,
                    fontFamily: SANS, fontSize: 9, padding: "2px 9px", borderRadius: 100,
                    color: status === "done" ? C.success : C.warm,
                    background: status === "done" ? "rgba(110,168,122,0.18)" : "rgba(196,149,106,0.18)",
                    border: status === "done" ? "1px solid rgba(110,168,122,0.3)" : "1px solid rgba(196,149,106,0.3)",
                    backdropFilter: "blur(8px)",
                  }}>{status === "done" ? "✓ Done" : "⟳ Processing"}</span>
                </div>

                {/* Info */}
                <div style={{ padding: "1rem 1.2rem" }}>
                  <p style={{ fontFamily: SANS, fontSize: 13, color: C.main, fontWeight: 600, marginBottom: 4 }}>{item.storyTitle}</p>
                  <p style={{ fontFamily: SANS, fontSize: 11, color: C.muted }}>{item.artStyle} · {item.numberOfPanels} panels</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedId && (
        <ComicDetailModal comicId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DETAIL MODAL
═══════════════════════════════════════════════════════════════════ */

function ComicDetailModal({ comicId, onClose }: { comicId: string; onClose: () => void }) {
  const [detail, setDetail] = useState<ComicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchComicDetail(comicId)
      .then(data => {
        if (!cancelled) setDetail(data);
      })
      .catch(err => {
        if (!cancelled) setError(err.message ?? "Something went wrong.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [comicId]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(8,7,6,0.7)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "min(880px, 100%)", maxHeight: "85vh", overflowY: "auto",
          borderRadius: 14, padding: "2rem",
          ...glass(0.05, 24),
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div>
            <p style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: C.gold, marginBottom: 6 }}>
              Comic Detail
            </p>
            {detail && (
              <h2 style={{ fontFamily: SANS, fontSize: 22, color: C.main, fontWeight: 600 }}>{detail.storyTitle}</h2>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 8, border: "none", cursor: "pointer",
              color: C.muted, fontSize: 14, ...glass(0.06, 10),
            }}
          >✕</button>
        </div>

        {loading && <p style={{ fontFamily: SANS, fontSize: 12, color: C.muted }}>Loading details…</p>}
        {!loading && error && <p style={{ fontFamily: SANS, fontSize: 12, color: C.warm }}>{error}</p>}

        {!loading && !error && detail && (
          <>
            {/* Meta row */}
            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
              <Meta label="Style" value={detail.artStyle} />
              <Meta label="Panels" value={String(detail.numberOfPanels)} />
              <Meta label="Dimensions" value={`${detail.panelWidth} × ${detail.panelHeight}`} />
            </div>

            {/* Storyline */}
            {detail.storyline && (
              <Section title="Storyline" body={detail.storyline} />
            )}
            {detail.characters && (
              <Section title="Characters" body={detail.characters} />
            )}
            {detail.moral && (
              <Section title="Moral" body={detail.moral} />
            )}

            {/* Panel images */}
            {detail.panelImages && detail.panelImages.length > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                <p style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>
                  Panels
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem" }}>
                  {detail.panelImages.map((src, i) => {
                    const resolvedSrc = toImageSrc(src);
                    if (!resolvedSrc) return null;
                    return (
                      <img
                        key={i}
                        src={resolvedSrc}
                        alt={`Panel ${i + 1}`}
                        style={{ width: "100%", borderRadius: 8, border: `1px solid ${C.border}` }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, marginBottom: 3 }}>{label}</p>
      <p style={{ fontFamily: SANS, fontSize: 13, color: C.main }}>{value}</p>
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ marginBottom: "1.2rem" }}>
      <p style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, marginBottom: 6 }}>{title}</p>
      <p style={{ fontFamily: SANS, fontSize: 13, color: C.main, lineHeight: 1.6 }}>{body}</p>
    </div>
  );
}