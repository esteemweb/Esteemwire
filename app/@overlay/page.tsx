/* The overlay slot on the home route renders nothing, so navigating to "/"
   from an open About or Contact overlay (its close button) clears it.
   Without this the slot keeps its last state on a soft navigation. */
export default function NoOverlay() {
  return null;
}
