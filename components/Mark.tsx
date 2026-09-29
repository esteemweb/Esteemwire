import { faces, MARK } from "@/content/mark";

/* The mark as inline SVG so it can be sized in rem, linked, and painted
   in its own colours wherever it sits. Gradient ids are prefixed so several
   marks can share a page. `sheen` adds a band of light that sweeps across
   the folds (clipped to the mark; animated in globals.css, motion only). */
export function Mark({ className = "", title, id = "mark", sheen = false }: { className?: string; title?: string; id?: string; sheen?: boolean }) {
  const outline = faces.map((f) => f.points.map((p) => p.join(",")).join(" "));
  return (
    <svg viewBox={`0 0 ${MARK.width} ${MARK.height}`} className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <defs>
        {faces.map((f) => (
          <linearGradient key={f.name} id={`${id}-${f.name}`} x1={f.axis[0]} y1={f.axis[1]} x2={f.axis[2]} y2={f.axis[3]}>
            <stop offset="0" stopColor={f.colors[0]} />
            <stop offset="1" stopColor={f.colors[1]} />
          </linearGradient>
        ))}
        {sheen && (
          <>
            <clipPath id={`${id}-clip`}>
              {outline.map((points, i) => (
                <polygon key={i} points={points} />
              ))}
            </clipPath>
            <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="0.6">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.45" stopColor="#fff" stopOpacity="0.55" />
              <stop offset="0.55" stopColor="#fff" stopOpacity="0.55" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </>
        )}
      </defs>
      {faces.map((f, i) => (
        <polygon key={f.name} points={outline[i]} fill={`url(#${id}-${f.name})`} />
      ))}
      {sheen && (
        <g clipPath={`url(#${id}-clip)`}>
          <rect className="mark-sheen" x="-160" y="-40" width="160" height={MARK.height + 80} fill={`url(#${id}-sheen)`} />
        </g>
      )}
    </svg>
  );
}
