import { ViewTransition } from "react";

/* The shared-element flight, using React's view transitions. A card's picture and
   the case study's hero carry the same name, so the browser flies the rect
   between them on navigation. The `.flight` class is styled in globals.css
   with the 1s flight ease. Wrapped here so the mechanism can be swapped for
   the GL flight later without touching pages. */
export function Flight({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <ViewTransition name={name} share="flight" default="none">
      {children}
    </ViewTransition>
  );
}
