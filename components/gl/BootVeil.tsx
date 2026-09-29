"use client";

import { useEffect, useRef, useState } from "react";
import { faces, MARK, WORDMARK } from "@/content/mark";

/* The boot veil: you enter the site through the mark.

   1. draw   — the five faces of the ribbon are traced as lines of light;
   2. open   — the mark becomes a cut-out in the black veil: the room shows
               through the E, and the E grows about a point inside its middle
               band until the opening swallows the screen.

   The veil is one full-screen SVG in css px. The mark's placement is a
   single transform (translate to the pivot, scale, translate back), so the
   drawn mark and the hole share the same geometry exactly. */

export const BOOT_INTRO_MS = 1250; // the draw; a cached load still shows it
export const BOOT_OPEN_MS = 2200;

const PIVOT: [number, number] = [130, 160]; // inside the middle band
const HEIGHT = 150; // the mark's height on screen, css px
const points = faces.map((f) => f.points.map((p) => p.join(",")).join(" "));

export function BootVeil({ open }: { open: boolean }) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const holeRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const set = () => setSize({ w: innerWidth, h: innerHeight });
    set();
    addEventListener("resize", set);
    return () => removeEventListener("resize", set);
  }, []);

  const k = HEIGHT / MARK.height;
  const sx = size ? size.w / 2 + (PIVOT[0] - MARK.width / 2) * k : 0;
  const sy = size ? size.h / 2 - 24 + (PIVOT[1] - MARK.height / 2) * k : 0;
  const at = (f: number) => `translate(${sx} ${sy}) scale(${k * f}) translate(${-PIVOT[0]} ${-PIVOT[1]})`;

  // The opening: an exponential zoom (steady to the eye) with an ease-in-out,
  // from 1 to past the screen, after a beat so the room can rise into the E.
  useEffect(() => {
    if (!open || !size) return;
    const g = holeRef.current;
    if (!g) return;
    const far = (Math.hypot(size.w, size.h) / (38 * k)) * 2.2; // the band is ~38 units thick
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - t0 - 150) / (BOOT_OPEN_MS - 150)));
      const e = Math.pow(t, 2.4); // ease-in: linger on the window, then push through
      g.setAttribute("transform", at(Math.pow(far, e)));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, size]);

  if (!size) return <div aria-hidden="true" className="fixed inset-0 z-50 bg-room" />;

  return (
    <div aria-hidden="true" data-open={open ? "" : undefined} className="boot-veil pointer-events-none fixed inset-0 z-50">
      <svg width={size.w} height={size.h} className="absolute inset-0">
        <defs>
          {faces.map((f) => (
            <linearGradient key={f.name} id={`boot-${f.name}`} x1={f.axis[0]} y1={f.axis[1]} x2={f.axis[2]} y2={f.axis[3]}>
              <stop offset="0" stopColor={f.colors[0]} />
              <stop offset="1" stopColor={f.colors[1]} />
            </linearGradient>
          ))}
          <mask id="boot-hole" maskUnits="userSpaceOnUse" x="0" y="0" width={size.w} height={size.h}>
            <rect width={size.w} height={size.h} fill="#fff" />
            {open && (
              <g ref={holeRef} transform={at(1)}>
                {points.map((p, i) => (
                  <polygon key={i} points={p} fill="#000" />
                ))}
              </g>
            )}
          </mask>
          <filter id="boot-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width={size.w} height={size.h} fill="var(--color-room)" mask="url(#boot-hole)" />

        {!open && (
          <g transform={at(1)}>
            <g filter="url(#boot-glow)">
              {faces.map((f, i) => (
                <polygon
                  key={`l${f.name}`}
                  className="boot-line"
                  style={{ animationDelay: `${i * 0.1}s` }}
                  points={points[i]}
                  pathLength={1}
                  fill="none"
                  stroke="#c9bcff"
                  strokeWidth={2 / k}
                  strokeLinejoin="round"
                />
              ))}
            </g>
          </g>
        )}
      </svg>

      <div className="boot-caption absolute inset-x-0 flex flex-col items-center gap-y-12" style={{ top: size.h / 2 - 24 + HEIGHT / 2 + 34 }}>
        <p className="wordmark">{WORDMARK}</p>
      </div>
    </div>
  );
}
