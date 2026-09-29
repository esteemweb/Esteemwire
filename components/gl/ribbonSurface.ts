/* The ribbon as a surface: the shape every card on the home page is bent onto.

   Every card and its caption lie on ONE closed-form height field, written
   once here in GLSL for the vertex shader and once in TypeScript so the DOM
   captions can be projected onto the same surface. The two must agree:
   change one, change both.

   Terms, in the order they compose:
   1. wind   — the surface rolls about the ribbon's centreline (y = z = 0):
               a resting bank that follows the depth sweep's own slope, plus
               a velocity twist that wrings the two sides opposite ways.
   2. sweep  — an S in DEPTH across the frame: near through the left half,
               far through the right, eased flat off frame by a gaussian tail.
   3. rear   — with speed the left side lifts and comes nearer.
   4. lean   — a small hinge so the right side recedes.
   5. dome   — hover: the card's middle bows away, its rim pinned.

   The field runs along one axis: x on wide screens, y on phones, where the
   ribbon is a column. `u_axis` (0 or 1) swaps x and y going in and coming
   out, so the same maths bends either way; u_halfW is then the half-extent
   of the viewport along that axis. */

export const SURFACE = {
  /** Depth sweep amplitude as a share of the frustum half-width. */
  sweep: 0.12,
  /** Slides the sweep so the near peak sits left of centre. */
  shift: 0.2,
  /** Gaussian tail tightness. */
  tail: 1.5,
  /** Resting bank, radians at the steepest point. */
  bank: 0.16,
  /** Velocity edge twist, radians at the mask's far end. */
  twist: 0.45,
  /** Rear-up reach (y, z) as shares of the half-width at full speed. */
  rearY: 0.04,
  rearZ: 0.09,
  /** Hinge slope (z per x). */
  lean: 0.04,
  /** Hover dome depth as a share of the card's height. */
  dome: 0.1,
} as const;

/** Shared GLSL. Expects the same uniforms the card material declares. */
export const surfaceGLSL = /* glsl */ `
  uniform float u_halfW;
  uniform float u_D;
  uniform float u_vel;
  uniform float u_hover;
  uniform float u_rise;
  uniform float u_axis;
  uniform vec2 u_size;

  const float PI = 3.14159265;

  vec3 surface(vec3 p0, vec2 local) {
    vec3 p = mix(p0, p0.yxz, u_axis); // axis-local: x runs along the ribbon
    float q = p.x / u_halfW;
    float qs = q + ${SURFACE.shift};
    float tail = exp(-${SURFACE.tail} * q * q);
    float sweep = u_D * sin(PI * qs) * tail;
    // exact slope of the sweep, normalised so 1 = the steepest point
    float slope = (PI * cos(PI * qs) - 2.0 * ${SURFACE.tail} * q * sin(PI * qs)) * tail / PI;
    float mask = smoothstep(0.3, 0.9, abs(q)) * sign(q);
    float a = ${SURFACE.bank} * slope + ${SURFACE.twist} * u_vel * mask;
    // wind about the centreline
    float c = cos(a), s = sin(a);
    vec2 yz = vec2(p.y * c - p.z * s, p.y * s + p.z * c);
    p.y = yz.x;
    p.z = yz.y + sweep;
    // rear-up, left of centre only
    float m = smoothstep(0.0, 0.8, -q) * u_vel;
    p.y += m * ${SURFACE.rearY} * u_halfW;
    p.z += m * ${SURFACE.rearZ} * u_halfW;
    // hinge
    p.z -= ${SURFACE.lean} * p.x;
    // hover dome: 1 at the centre, 0 along every edge
    float dome = (1.0 - 4.0 * local.x * local.x) * (1.0 - 4.0 * local.y * local.y);
    p.z -= u_hover * ${SURFACE.dome} * u_size.y * dome;
    p = mix(p, p.yxz, u_axis); // back to screen axes
    // intro rise
    p.y -= (1.0 - u_rise) * 0.4 * u_size.y;
    return p;
  }
`;

/** The same function in TypeScript, for projecting DOM captions. */
export function surfaceTS(
  p0: { x: number; y: number; z: number },
  local: { x: number; y: number },
  u: { halfW: number; D: number; vel: number; hover: number; rise: number; axis: 0 | 1; size: { x: number; y: number } },
) {
  const PI = Math.PI;
  const p = u.axis ? { x: p0.y, y: p0.x, z: p0.z } : p0;
  const q = p.x / u.halfW;
  const qs = q + SURFACE.shift;
  const tail = Math.exp(-SURFACE.tail * q * q);
  const sweep = u.D * Math.sin(PI * qs) * tail;
  const slope = ((PI * Math.cos(PI * qs) - 2 * SURFACE.tail * q * Math.sin(PI * qs)) * tail) / PI;
  const aq = Math.abs(q);
  const sm = aq <= 0.3 ? 0 : aq >= 0.9 ? 1 : ((aq - 0.3) / 0.6) ** 2 * (3 - 2 * ((aq - 0.3) / 0.6));
  const mask = sm * Math.sign(q);
  const a = SURFACE.bank * slope + SURFACE.twist * u.vel * mask;
  const c = Math.cos(a);
  const s = Math.sin(a);
  let y = p.y * c - p.z * s;
  let z = p.y * s + p.z * c + sweep;
  const mq = -q;
  const mm = (mq <= 0 ? 0 : mq >= 0.8 ? 1 : (mq / 0.8) ** 2 * (3 - 2 * (mq / 0.8))) * u.vel;
  y += mm * SURFACE.rearY * u.halfW;
  z += mm * SURFACE.rearZ * u.halfW;
  z -= SURFACE.lean * p.x;
  const dome = (1 - 4 * local.x * local.x) * (1 - 4 * local.y * local.y);
  z -= u.hover * SURFACE.dome * u.size.y * dome;
  const out = u.axis ? { x: y, y: p.x, z } : { x: p.x, y, z };
  out.y -= (1 - u.rise) * 0.4 * u.size.y;
  return out;
}
