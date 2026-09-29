"use client";

import { useEffect, useRef, useState } from "react";

/* The seal around the About text: an ellipse that wraps the headline and
   paragraph. A line of spaced capitals travels along the inner ellipse, a
   point of light orbits the outer hairline the other way, and a dotted
   ring between them breathes. The text is laid twice along the path and
   slid by one path-length, so the loop is seamless (each half holds the
   ring text twice, to keep the letters close). Hidden on phones,
   where the text column is too tall for a frame; static under reduced
   motion. */
const RING = "Esteemwire · Design · Engineering · Launch · Independent studio · ";
const W = 400;
const H = 200;
const inner = `M ${W / 2 - 184},${H / 2} a 184,86 0 1,1 368,0 a 184,86 0 1,1 -368,0`;
const outer = `M ${W / 2},${H / 2 - 98} a 196,98 0 1,1 -0.01,0 Z`;

export function AboutSeal({ children }: { children: React.ReactNode }) {
  const pathRef = useRef<SVGPathElement>(null);
  const textRef = useRef<SVGTextPathElement>(null);
  // The orbiting dot moves only when motion is allowed (reduce motion: still).
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    setMoving(document.documentElement.hasAttribute("data-motion"));
  }, []);

  useEffect(() => {
    const path = pathRef.current;
    const tp = textRef.current;
    if (!path || !tp) return;
    const P = path.getTotalLength();
    tp.setAttribute("textLength", String(P * 2));
    if (!document.documentElement.hasAttribute("data-motion")) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const x = (((now - t0) / 1000) * 9) % P; // 9 user units a second
      tp.setAttribute("startOffset", String(-x));
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="seal relative my-10 flex w-full flex-col items-center s:my-40">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 hidden w-[86rem] -translate-x-1/2 -translate-y-1/2 s:block" style={{ aspectRatio: `${W} / ${H}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full overflow-visible">
          <defs>
            <path id="seal-inner-path" ref={pathRef} d={inner} />
            <path id="seal-outer-path" d={outer} />
          </defs>
          <path d={outer} fill="none" stroke="currentColor" strokeOpacity="0.16" strokeWidth="0.3" />
          <ellipse className="seal-inner" cx={W / 2} cy={H / 2} rx="190" ry="92" fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="0.3" strokeDasharray="0.6 3" />
          <text className="seal-letters">
            <textPath ref={textRef} href="#seal-inner-path" lengthAdjust="spacing">
              {(RING + RING + RING + RING).toUpperCase()}
            </textPath>
          </text>
          <circle r="1.3" className="seal-dot">
            {moving && (
              <animateMotion dur="22s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear">
                <mpath href="#seal-outer-path" />
              </animateMotion>
            )}
          </circle>
        </svg>
      </div>
      {/* Phones: the ring text runs as a ticker band above the text instead. */}
      <div aria-hidden="true" className="seal-ticker relative mb-25 w-screen overflow-hidden border-y border-ink/15 py-8 s:hidden">
        <div className="seal-ticker-track flex w-max">
          {[0, 1].map((k) => (
            <span key={k} className="label whitespace-nowrap pr-[0.6em] opacity-50">
              {(RING + RING).toUpperCase()}
            </span>
          ))}
        </div>
      </div>
      <div className="relative flex flex-col items-center">{children}</div>
    </div>
  );
}
