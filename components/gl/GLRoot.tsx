"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

/* The root of the WebGL layer, which draws page elements that the DOM lays out.

   - decides once per route whether the machine gets the scene, exposed as
     `data-gl-mode="dom|gl"` on <html> so CSS and components can branch;
   - keeps the registry of elements that want a plane (`useGLPlane`), keyed
     by `data-id`, which the scene reads every frame;
   - mounts the scene (three.js, client only) when the mode is `gl`.

   The scene runs on the home ribbon only, at every width (phones get the
   column, bent along y), with WebGL2, on machines with some headroom,
   without reduced motion, and can be forced off with `?gl=0`. Clicking a card flips the mode to `dom`
   synchronously so the DOM picture is visible for the view transition. */

const GLScene = dynamic(() => import("./GLScene").then((m) => m.GLScene), { ssr: false });

/** The boot veil plays once per visit, and only when the visit starts on the
    home page: navigating back to the ribbon from inside the site (a close
    button, the wordmark, Featured) opens straight into the room. */
export const boot = {
  pending: typeof window !== "undefined" && window.location.pathname === "/",
};

export type PlaneKind = "card" | "sheet" | "hero";

export type PlaneEntry = {
  id: string;
  kind: PlaneKind;
  el: HTMLElement;
  src?: string;
};

type Mode = "dom" | "gl";

type Registry = {
  mode: Mode;
  register: (entry: PlaneEntry) => () => void;
  planes: Map<string, PlaneEntry>;
};

const Ctx = createContext<Registry | null>(null);

function capable(): boolean {
  if (typeof window === "undefined") return false;
  if (new URLSearchParams(location.search).get("gl") === "0") return false;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  if ((nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2) return false;
  try {
    const c = document.createElement("canvas");
    return !!c.getContext("webgl2");
  } catch {
    return false;
  }
}

const setAttr = (m: Mode) => {
  document.documentElement.dataset.glMode = m;
};

export function GLRoot({ children }: { children: React.ReactNode }) {
  const planes = useRef(new Map<string, PlaneEntry>()).current;
  const pathname = usePathname();
  const [mode, setMode] = useState<Mode>("dom");

  useEffect(() => {
    const m: Mode = pathname === "/" && capable() ? "gl" : "dom";
    setMode(m);
    if (m === "dom" || boot.pending) {
      setAttr(m);
      return;
    }
    // Returning to the room: keep the page's cards on screen (the closing
    // case study flies back onto them) until the scene has drawn its own,
    // then switch; globals.css crossfades the two.
    setAttr("dom");
    const onShown = () => setAttr("gl");
    window.addEventListener("gl:shown", onShown, { once: true });
    return () => window.removeEventListener("gl:shown", onShown);
  }, [pathname]);

  // A click on a card leaves the room: hand the picture back to the DOM
  // before the navigation commits, so the flight has something to fly.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('[data-gl="card"] a');
      if (!a || e.defaultPrevented) return;
      setAttr("dom");
    };
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, []);

  const value = useMemo<Registry>(
    () => ({
      mode,
      planes,
      register: (entry) => {
        planes.set(entry.id, entry);
        return () => {
          if (planes.get(entry.id) === entry) planes.delete(entry.id);
        };
      },
    }),
    [mode, planes],
  );

  return (
    <Ctx.Provider value={value}>
      {mode === "gl" && <GLScene />}
      {children}
    </Ctx.Provider>
  );
}

export function useGL() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useGL must be used inside <GLRoot>");
  return ctx;
}

/** Register an element as a plane; the scene reads `planes` each frame. */
export function useGLPlane(ref: React.RefObject<HTMLElement | null>, id: string, kind: PlaneKind, src?: string) {
  const { register } = useGL();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return register({ id, kind, el, src });
  }, [ref, id, kind, src, register]);
}
