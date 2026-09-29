"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ticker } from "@/lib/ticker";
import type { Media } from "@/content/projects";
import { damp } from "@/lib/motion";

/* The typographic index with a travelling preview: a centred
   word cloud; hovering or focusing an entry shows a fixed picture that
   follows the pointer with a lerp and crossfades between two slots. */

export type CloudItem = {
  label: string;
  href: string;
  external?: boolean;
  preview?: Media;
  tone?: string;
};

export function IndexCloud({ items }: { items: CloudItem[] }) {
  const [active, setActive] = useState<CloudItem | null>(null);
  const [slots, setSlots] = useState<[CloudItem | null, CloudItem | null]>([null, null]);
  const [front, setFront] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0, cx: 0, cy: 0, fine: false });

  useEffect(() => {
    pointer.current.fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
    };
    const tick = (ratio: number) => {
      const p = pointer.current;
      p.cx = damp(p.cx, p.x, 0.12, ratio);
      p.cy = damp(p.cy, p.y, 0.12, ratio);
      const el = previewRef.current;
      if (el) el.style.transform = `translate3d(${p.cx}px, ${p.cy}px, 0) translate(-50%, -50%)`;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    ticker.add(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      ticker.remove(tick);
    };
  }, []);

  const show = (item: CloudItem | null) => {
    setActive(item);
    if (!item?.preview) return;
    setSlots((s) => {
      const next = (front + 1) % 2;
      const copy: [CloudItem | null, CloudItem | null] = [s[0], s[1]];
      copy[next] = item;
      setFront(next);
      return copy;
    });
  };

  return (
    <>
      <ul className="mx-auto flex max-w-cloud flex-wrap content-center items-center justify-center gap-x-24 gap-y-6 px-20 s:max-w-cloud-s">
        {items.map((it, i) => {
          const Cmp = it.external ? "a" : Link;
          return (
            <li key={it.href + it.label} className="reveal relative flex" style={{ "--at": `${0.06 * i}s` } as React.CSSProperties}>
              <Cmp
                href={it.href}
                {...(it.external ? { target: "_blank", rel: "noopener" } : {})}
                className={`whitespace-nowrap text-title transition-opacity duration-(--duration-state) ease-(--ease-out) s:text-index ${
                  active && active !== it ? "opacity-40" : ""
                }`}
                onPointerEnter={() => show(it)}
                onPointerLeave={() => show(null)}
                onFocus={() => show(it)}
                onBlur={() => show(null)}
              >
                {it.label}
              </Cmp>
              {it.external && (
                <span aria-hidden="true" className="pointer-events-none absolute left-full top-1/2 ml-12 -translate-x-1/2 -translate-y-1/2 text-[0.8rem] leading-none">
                  ↗
                </span>
              )}
            </li>
          );
        })}
      </ul>
      {/* The travelling preview: two slots so the picture crossfades while it keeps moving. */}
      <div
        ref={previewRef}
        aria-hidden="true"
        className={`pointer-events-none fixed left-0 top-0 z-20 hidden w-[32rem] overflow-hidden rounded-card-s transition-opacity duration-(--duration-state) ease-(--ease-out) has-hover:block ${
          active?.preview ? "opacity-100" : "opacity-0"
        }`}
        style={{ aspectRatio: `${active?.preview?.width ?? 16} / ${active?.preview?.height ?? 10}` }}
      >
        {slots.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-(--duration-state) ease-(--ease-out)"
            style={{ opacity: i === front ? 1 : 0, background: s?.tone }}
          >
            {s?.preview && <Image src={s.preview.src} alt="" width={s.preview.width} height={s.preview.height} sizes="32rem" className="h-full w-full object-cover" />}
          </div>
        ))}
      </div>
    </>
  );
}
