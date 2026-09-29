"use client";

import { useEffect, useRef } from "react";

/* A silent, seamless loop laid over a still. It plays only while its box is
   near the viewport, never under reduced motion, and fades in on its first
   frame so the still underneath stays the poster (and the flight's image).
   In GL mode the scene reads this same element as the card's texture, so
   there is one decode per card whichever layer paints it. */
export function Loop({ src, className = "" }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    v.muted = true; // the attribute alone is not enough for autoplay in every browser
    const onPlaying = () => v.setAttribute("data-live", "");
    v.addEventListener("playing", onPlaying);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { rootMargin: "25%" },
    );
    io.observe(v);
    return () => {
      io.disconnect();
      v.removeEventListener("playing", onPlaying);
      v.pause();
    };
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      loop
      muted
      playsInline
      preload="none"
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
      draggable={false}
      data-loop
      className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${className}`}
    />
  );
}
