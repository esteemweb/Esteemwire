"use client";

import { useEffect, useRef } from "react";
import { Mark } from "./Mark";

/* The mark with depth. A stack of darker copies behind the face, each a
   step further back in a preserve-3d box, reads as the thickness of the
   folded strip; the box tilts towards the pointer (it looks at the cursor
   wherever it is on the page), turns slowly by itself when the pointer
   rests, and a sheen sweeps the folds now and then. Every part of this is
   motion-gated in globals.css, so reduced motion gets the flat mark. */
const LAYERS = 5;

export function Mark3D({ className = "", id, tilt = 22 }: { className?: string; id: string; tilt?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!document.documentElement.hasAttribute("data-motion")) return;
    const body = el.firstElementChild as HTMLElement;
    let idle: ReturnType<typeof setTimeout> | undefined;
    const rest = () => body.classList.add("is-idle");
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
      const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
      body.classList.remove("is-idle");
      body.style.setProperty("--rx", `${(-dy * 2 * tilt).toFixed(2)}deg`);
      body.style.setProperty("--ry", `${(dx * 2 * tilt).toFixed(2)}deg`);
      clearTimeout(idle);
      idle = setTimeout(rest, 1800);
    };
    idle = setTimeout(rest, 1200);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      clearTimeout(idle);
      window.removeEventListener("pointermove", onMove);
    };
  }, [tilt]);

  return (
    <span ref={ref} className={`mark3d ${className}`}>
      <span className="mark3d-body">
        {Array.from({ length: LAYERS }, (_, i) => (
          <Mark key={i} id={`${id}-d${i}`} className="mark3d-layer" />
        ))}
        <Mark id={id} className="mark3d-face" sheen />
      </span>
    </span>
  );
}
