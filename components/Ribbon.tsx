"use client";

import { useEffect, useRef, useState } from "react";
import { ticker, wrap } from "@/lib/ticker";
import type { Project } from "@/content/projects";
import { WorkCard } from "./WorkCard";
import { damp, ribbon as R } from "@/lib/motion";
import { signals } from "@/lib/signals";

/* The infinite, draggable ribbon of project cards on the home page.

   The DOM is a plain flex row of cards; this component positions each card
   with translate3d so the row wraps forever, and moves the row with a wheel
   normaliser, a tanh-limited target, a dt-normalised lerp, pointer drag
   with a dead zone and a flick, and arrow keys. It publishes two things
   for everyone else: `--vel` (−1..1) on the track, and the centred card's
   index for the eyebrow.

   Below 650px the same loop runs vertically: the cards are a column, the
   drag reads clientY, the wheel deltaY, and the arrows are up/down. */

type Item = { el: HTMLElement; left: number; width: number; right: number };

export function Ribbon({ projects }: { projects: Project[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [centred, setCentred] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const small = matchMedia("(max-width: 649px)");
    const vertical = small.matches;
    const onModeChange = () => location.reload(); // layout mode changes are rare; keep it simple
    small.addEventListener("change", onModeChange, { once: true });

    let items: Item[] = [];
    let total = 0;
    // The axis: `ww` is the viewport's extent along it; `left`/`width` are
    // the card's offset and size along it, whichever axis that is.
    let ww = vertical ? window.innerHeight : window.innerWidth;
    const pos = { t: 0, c: 0 };
    let lastCentred = -1;

    const measure = (keepIndex = lastCentred < 0 ? 0 : lastCentred) => {
      const kids = [...track.children] as HTMLElement[];
      ww = vertical ? window.innerHeight : window.innerWidth;
      // Layout positions, not transformed rects: offsetLeft/Top ignore the
      // translate each card carries, so nothing has to be cleared first.
      items = kids.map((el) =>
        vertical
          ? { el, left: el.offsetTop, width: el.offsetHeight, right: el.offsetTop + el.offsetHeight }
          : { el, left: el.offsetLeft, width: el.offsetWidth, right: el.offsetLeft + el.offsetWidth },
      );
      if (!items.length) return;
      const gap = parseFloat(getComputedStyle(track)[vertical ? "rowGap" : "columnGap"]) || 0;
      total = items[items.length - 1].right + gap;
      centreOn(keepIndex);
      apply();
    };

    const centreOn = (i: number) => {
      const it = items[i];
      if (!it) return;
      pos.t = pos.c = it.left + it.width / 2 - ww / 2;
    };

    const apply = () => {
      let best = 0;
      let bestD = Infinity;
      items.forEach((it, i) => {
        // Each card wraps on its own range so the row never runs out.
        const s = wrap(-(total - it.right), it.right, pos.c);
        it.el.style.transform = vertical ? `translate3d(0,${-s}px,0)` : `translate3d(${-s}px,0,0)`;
        const d = Math.abs(it.left - s + it.width / 2 - ww / 2);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      if (best !== lastCentred) {
        lastCentred = best;
        signals.centred = best;
        setCentred(best);
      }
    };

    // ── Wheel: normalise, bucket discrete flicks, soft-limit the reach.
    let bucket = 0;
    let lastNotch = 0;
    let burstAt = -R.flickCooldown;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return;
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      const d = (Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * unit;
      const since = e.timeStamp - lastNotch;
      if (since < R.flickSpacing) burstAt = e.timeStamp;
      const isFlick = Math.abs(d) >= R.flickThreshold && since >= R.flickSpacing && e.timeStamp - burstAt >= R.flickCooldown;
      lastNotch = e.timeStamp;
      if (isFlick) bucket += d * R.wheelGain * 2;
      else push(d * R.wheelGain);
    };
    const push = (d: number) => {
      pos.t += d;
      const lim = ww * R.reach;
      pos.t = pos.c + Math.tanh((pos.t - pos.c) / lim) * lim;
    };

    // ── Drag: dead zone, gain, flick momentum, click swallow.
    let pressed = false;
    let dragging = false;
    let swallow = false;
    let x0 = 0;
    let y0 = 0;
    let lastX = 0;
    let lastDelta = 0;
    let lastMove = 0;
    const setGrab = (on: boolean) => document.documentElement.classList.toggle("grabbing", on);
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      pressed = true;
      dragging = false;
      x0 = lastX = vertical ? e.clientY : e.clientX;
      y0 = vertical ? e.clientX : e.clientY;
      lastDelta = 0;
      window.addEventListener("pointermove", onMove, { passive: false });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    };
    const onMove = (e: PointerEvent) => {
      if (!pressed) return;
      const along = vertical ? e.clientY : e.clientX;
      const across = vertical ? e.clientX : e.clientY;
      if (!dragging) {
        const dx = Math.abs(along - x0);
        const dy = Math.abs(across - y0);
        if (dx <= R.dragDeadZone || dx <= dy) return;
        dragging = true;
        swallow = true;
        setGrab(true);
        lastX = along;
      }
      e.preventDefault();
      lastDelta = (lastX - along) * R.dragGain;
      lastMove = e.timeStamp;
      lastX = along;
      push(lastDelta);
    };
    const onUp = (e: PointerEvent) => {
      if (dragging && e.timeStamp - lastMove < R.flickWindow) push(lastDelta * R.flickMomentum);
      pressed = false;
      dragging = false;
      setGrab(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      // A click that ends a drag is not a click.
      setTimeout(() => (swallow = false), 0);
    };
    const onClick = (e: MouseEvent) => {
      if (!swallow) return;
      e.preventDefault();
      e.stopPropagation();
      swallow = false;
    };

    // ── Keyboard: one card per arrow.
    const onKey = (e: KeyboardEvent) => {
      const fwd = vertical ? "ArrowDown" : "ArrowRight";
      const back = vertical ? "ArrowUp" : "ArrowLeft";
      if (e.key !== fwd && e.key !== back) return;
      e.preventDefault();
      const it = items[lastCentred] ?? items[0];
      if (!it) return;
      const gap = parseFloat(getComputedStyle(track)[vertical ? "rowGap" : "columnGap"]) || 0;
      push((e.key === fwd ? 1 : -1) * (it.width + gap));
    };

    // ── The clock.
    const tick = (ratio: number) => {
      if (bucket) {
        const rel = bucket * (1 - Math.pow(1 - R.flickRelease, Math.min(ratio, 4)));
        bucket -= rel;
        if (Math.abs(bucket) < 0.05) bucket = 0;
        push(rel);
      }
      pos.c = damp(pos.c, pos.t, R.lerp, ratio);
      pos.c = Math.round(pos.c * 100) / 100;
      const v = Math.tanh((pos.t - pos.c) / R.velocityNorm);
      signals.vel = v * Math.abs(v);
      track.style.setProperty("--vel", signals.vel.toFixed(3));
      apply();
    };

    const onResize = () => measure();

    measure(0);
    ticker.add(tick);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("click", onClick, true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    document.documentElement.classList.add("grabbable");
    return () => {
      small.removeEventListener("change", onModeChange);
      ticker.remove(tick);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.classList.remove("grabbable", "grabbing");
    };
  }, [projects]);

  const current = projects[centred];

  return (
    <div ref={rootRef} className="absolute inset-0 touch-none overflow-hidden">
      <div
        ref={trackRef}
        className="ribbon-track absolute left-0 top-0 flex w-full flex-col gap-y-20 px-20 s:top-1/2 s:w-auto s:-translate-y-1/2 s:flex-row s:gap-x-10 s:p-0"
      >
        {projects.map((p, i) => (
          <WorkCard key={p.slug} project={p} index={i} priority={i < 3} />
        ))}
      </div>
      {/* Phones: the column runs under the chrome, so it fades into the room at both ends. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-20 h-140 bg-linear-to-b from-room via-room/70 to-transparent s:hidden" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-140 bg-linear-to-t from-room via-room/70 to-transparent s:hidden" />
      {/* The eyebrow: names the centred card's category, so visitors know where they are. */}
      {current && (
        <p className="pointer-events-none fixed inset-x-0 bottom-48 z-30 flex justify-center s:bottom-32" aria-live="polite">
          {/* keyed by the card, so each new category pops in */}
          <span key={centred} className="eyebrow-pop label">
            {current.category}
          </span>
        </p>
      )}
    </div>
  );
}
