"use client";

import { useEffect, useState } from "react";
import { FloatingPaths } from "@/components/ui/background-paths";

/* The home room's backdrop: the two mirrored sets of drifting lines from
   the 21st.dev "Background Paths" component, in white on the room's black,
   fixed behind the WebGL canvas (which is transparent where nothing is
   drawn). Rendered by GLScene just before its canvas; the home page renders
   it too, for the plain DOM ribbon, and that copy is hidden when the room
   is live (globals.css). Forced to white whatever the OS colour scheme.
   With "reduce motion" on, the lines are drawn still. */
export function HomePaths() {
  // Read the browser's reduce-motion setting directly (and follow changes).
  const [still, setStill] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setStill(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return (
    <div aria-hidden="true" className="home-paths pointer-events-none fixed inset-0 z-0">
      <FloatingPaths position={1} still={still} />
      <FloatingPaths position={-1} still={still} />
    </div>
  );
}
