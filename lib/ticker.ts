/* One clock for everything that moves. Callbacks receive a
   frame ratio (1 at 60 fps, 0.5 at 120 fps, capped at 4) so lerps feel the
   same on every refresh rate. The loop only runs while something listens. */

type Fn = (ratio: number) => void;

const fns = new Set<Fn>();
let raf = 0;
let last = 0;

const loop = (t: number) => {
  const dt = last ? t - last : 1000 / 60;
  last = t;
  const ratio = Math.min(dt / (1000 / 60), 4);
  for (const f of fns) f(ratio);
  raf = requestAnimationFrame(loop);
};

export const ticker = {
  add(f: Fn) {
    fns.add(f);
    if (fns.size === 1) {
      last = 0;
      raf = requestAnimationFrame(loop);
    }
  },
  remove(f: Fn) {
    fns.delete(f);
    if (!fns.size && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  },
};

/** Wrap `v` into [min, max). */
export const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};
