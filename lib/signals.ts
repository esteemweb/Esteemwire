/* Values shared between the DOM movers and the GL layer without React
   re-renders. The ribbon writes, the scene reads, once per frame. */
export const signals = {
  /** Smoothed ribbon velocity, −1..1. */
  vel: 0,
  /** Index of the centred card. */
  centred: 0,
};
