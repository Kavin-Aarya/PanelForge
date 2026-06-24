import { useRef, useEffect } from "react";
import { C } from "./tokens";

/* ═══════════════════════════════════════════════════════════════════
   CURSOR — Custom magnetic gold cursor with lagged ring follower
═══════════════════════════════════════════════════════════════════ */
export default function Cursor() {
  const dot  = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const pos  = useRef({ x: -200, y: -200 });
  const rpos = useRef({ x: -200, y: -200 });
  const raf  = useRef<number | null>(null);

  useEffect(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const tick = () => {
      rpos.current.x = lerp(rpos.current.x, pos.current.x, 0.1);
      rpos.current.y = lerp(rpos.current.y, pos.current.y, 0.1);
      if (ring.current) ring.current.style.transform = `translate3d(${rpos.current.x}px,${rpos.current.y}px,0) translate(-50%,-50%)`;
      if (dot.current)  dot.current.style.transform  = `translate3d(${pos.current.x}px,${pos.current.y}px,0) translate(-50%,-50%)`;
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    const mv = (e: MouseEvent) => { pos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", mv, { passive: true });
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      window.removeEventListener("mousemove", mv);
    };
  }, []);

  return (
    <>
      <div ref={dot} style={{
        position: "fixed", top: 0, left: 0, width: 5, height: 5,
        background: C.gold, borderRadius: "50%", pointerEvents: "none",
        zIndex: 9999, mixBlendMode: "difference",
      }} />
      <div ref={ring} style={{
        position: "fixed", top: 0, left: 0, width: 36, height: 36,
        border: `1px solid rgba(201,168,76,0.35)`, borderRadius: "50%",
        pointerEvents: "none", zIndex: 9998,
        transition: "width .3s, height .3s",
      }} />
    </>
  );
}
