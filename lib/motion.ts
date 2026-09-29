// The motion grammar: every duration, ease and stagger on the
// site comes from here so the whole site moves on one clock. Values are
// seconds unless named otherwise.

export const ease = {
  /** Anything that arrives. */
  arrive: "expo.out",
  /** Small state changes: alpha, hover uniforms. */
  state: "power2.out",
  /** Long settle for flights. Mirrors the CSS `--ease-flight` curve. */
  flight: "expo.inOut",
  /** Progress-driven masks. */
  none: "none",
} as const;

export const duration = {
  hover: 0.5,
  state: 0.3,
  chrome: 0.3,
  content: 1.1,
  stack: 1.25,
  pills: 0.85,
  flight: 1,
  intro: 1.5,
} as const;

export const stagger = {
  cards: 0.05,
  title: 0.06,
  text: 0.075,
  stack: 0.1,
} as const;

/** Delays for the case-study reveal, after the sheet appears. */
export const revealAt = {
  stack: 0.25,
  title: 0.25,
  text: 0.35,
  pills: 0.5,
} as const;

/** Ribbon physics: how the home ribbon responds to wheel, drag and keys. */
export const ribbon = {
  /** Fraction of the remaining distance closed per 60 fps frame. */
  lerp: 0.1,
  /** Wheel delta multiplier after deltaMode normalisation. */
  wheelGain: 1.25,
  /** A wheel notch this large (px) is a discrete flick and gets inertia. */
  flickThreshold: 40,
  /** Minimum ms between notches for them to count as flicks. */
  flickSpacing: 30,
  /** Quiet ms after a burst before flicks are recognised again. */
  flickCooldown: 500,
  /** Share of the inertia bucket released per frame. */
  flickRelease: 0.22,
  /** Target may run this many viewport widths ahead of the current position. */
  reach: 1,
  /** Pointer travel (px) before a press becomes a drag. */
  dragDeadZone: 10,
  /** Drag distance multiplier. */
  dragGain: 1.5,
  /** A release within this many ms of the last move adds momentum. */
  flickWindow: 100,
  /** Momentum = last move delta × this. */
  flickMomentum: 12,
  /** Velocity normaliser for the shared `--vel` signal: the distance still
      to travel (px) at which the signal reads ~0.76. */
  velocityNorm: 420,
} as const;

/** dt-normalised lerp: the same feel at 60 and 120 Hz. */
export const damp = (current: number, target: number, factor: number, ratio: number) =>
  current + (target - current) * (1 - Math.pow(1 - factor, Math.min(ratio, 2)));
