"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { boot, useGL, type PlaneEntry } from "./GLRoot";
import { cardFrag, cardVert, postFrag, quadVert, trailFrag } from "./shaders";
import { SURFACE, surfaceTS } from "./ribbonSurface";
import { ticker } from "@/lib/ticker";
import { signals } from "@/lib/signals";
import { damp, duration as D, stagger } from "@/lib/motion";
import { BootVeil, BOOT_INTRO_MS, BOOT_OPEN_MS } from "./BootVeil";
import { HomePaths } from "../HomePaths";

/* The room: the WebGL scene behind the home page. One canvas behind the page; the DOM lays out and
   catches clicks, this paints. World units are css px: a DOM rect becomes a
   plane at z = 0 with the same size and position, and the camera (fov 75)
   sits where the frustum matches the viewport exactly. Every frame the card
   planes re-read their elements' rects, so the ribbon's own physics drive
   the scene; the scene only adds depth.

   Passes, per frame:
   1. scene — the cards, into a full-size target (no MSAA: every edge on
      screen is an SDF cut in the fragment stage, so it is already smooth);
   2. trail — the cursor's height field, ping-ponged at quarter resolution;
   3. post — the scene resampled along the trail's slope, to the screen. */

const FOV = 75;
/** Camera tilt with the pointer, css px of travel at the frame's edge. */
const TILT = { x: 70, y: 40 };

type Card = {
  entry: PlaneEntry;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  caption: HTMLElement | null;
  hover: { t: number; c: number };
  index: number;
  corner: number;
  /** When this card's picture was ready (0 until then); it rises from here. */
  readyAt: number;
  inset: number;
  /** The card's <Loop> element, if it has one; its frames replace the still once it plays. */
  video: HTMLVideoElement | null;
  videoTex: THREE.VideoTexture | null;
  off?: () => void;
};

const easeExpoOut = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function GLScene() {
  const { planes } = useGL();
  const ref = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  // No veil when the visit did not start here, or it has already played.
  const [veil] = useState(() => boot.pending);
  const [open, setOpen] = useState(false); // the veil is lifting
  const [booted, setBooted] = useState(!veil); // the veil is gone

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    // Phones run the ribbon as a column: the surface bends along y.
    const axis: 0 | 1 = matchMedia("(max-width: 649px)").matches ? 1 : 0;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0); // transparent where nothing is drawn: the page's backdrop shows through
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const cardsGroup = new THREE.Group();
    scene.add(cardsGroup);
    const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 40000);

    // ── Loading: the veil draws the mark while textures arrive (BootVeil).
    // The room opens through the mark once both the textures are in and the
    // intro has played out, so a cached load still shows it.
    const manager = new THREE.LoadingManager();
    let expected = 0;
    let loaded = 0;
    let bootAt = 0;
    // Coming back from inside the site (no veil): the page's own cards stay
    // visible until every picture here is ready; then `shownAt` is set, GLRoot
    // hands over: the room's cards are drawn in full underneath and the page's
    // own cards fade off the top of them (globals.css), so nothing dips.
    let shownAt = 0;
    const handoverGuard = setTimeout(() => { if (!veil && !shownAt) { shownAt = performance.now(); window.dispatchEvent(new Event("gl:shown")); } }, 1500);
    let texturesIn = false;
    let foldDone = !veil; // no veil: the room opens as soon as the pictures are in
    manager.onProgress = () => {
      loaded += 1;
      setProgress(expected ? loaded / expected : 1);
    };
    const tryOpen = () => {
      if (bootAt || !texturesIn || !foldDone) return;
      bootAt = performance.now();
      boot.pending = false;
      setOpen(true);
      setTimeout(() => setBooted(true), BOOT_OPEN_MS + 60); // the opening
    };
    const finishBoot = () => {
      texturesIn = true;
      setProgress(1);
      tryOpen();
    };
    manager.onLoad = finishBoot;
    const foldTimer = setTimeout(() => {
      foldDone = true;
      tryOpen();
    }, veil ? BOOT_INTRO_MS : 0);
    // Never leave the veil up: if a texture stalls, open anyway.
    const bootGuard = setTimeout(finishBoot, 6000);
    const loader = new THREE.TextureLoader(manager);
    const textures = new Map<string, THREE.Texture>();
    const texture = (src: string) => {
      let t = textures.get(src);
      if (!t) {
        expected += 1;
        t = loader.load(src);
        t.colorSpace = THREE.SRGBColorSpace;
        t.minFilter = THREE.LinearMipmapLinearFilter;
        t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        textures.set(src, t);
      }
      return t;
    };

    // ── Targets
    const sceneTarget = new THREE.WebGLRenderTarget(64, 64, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
    const trailA = new THREE.WebGLRenderTarget(64, 64, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false });
    const trailB = trailA.clone();
    let trailRead = trailA;
    let trailWrite = trailB;

    // ── Full-screen passes
    const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quadGeo = new THREE.PlaneGeometry(2, 2);
    const trailMat = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: quadVert,
      fragmentShader: trailFrag,
      uniforms: {
        u_prev: { value: trailRead.texture },
        u_texel: { value: new THREE.Vector2(1 / 64, 1 / 64) },
        u_decay: { value: 0.955 },
        u_diff: { value: 0.35 },
        u_pos: { value: new THREE.Vector2(-10, -10) },
        u_amp: { value: 0 },
        u_rad: { value: 0.055 },
        u_aspect: { value: 1 },
      },
      depthTest: false,
      depthWrite: false,
    });
    const trailQuad = new THREE.Mesh(quadGeo, trailMat);
    const trailScene = new THREE.Scene();
    trailScene.add(trailQuad);
    const postMat = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: quadVert,
      fragmentShader: postFrag,
      uniforms: {
        u_scene: { value: sceneTarget.texture },
        u_trail: { value: trailRead.texture },
        u_texel: { value: new THREE.Vector2(1 / 64, 1 / 64) },
        u_push: { value: 0.09 },
        u_light: { value: 1.6 },
        u_on: { value: fine ? 1 : 0 },
      },
      depthTest: false,
      depthWrite: false,
    });
    const postScene = new THREE.Scene();
    postScene.add(new THREE.Mesh(quadGeo, postMat));

    // ── Pointer
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, u: 0.5, v: 0.5, speed: 0, present: 0 };
    const onMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / W) * 2 - 1;
      pointer.ty = (e.clientY / H) * 2 - 1;
      const nu = e.clientX / W;
      const nv = 1 - e.clientY / H;
      pointer.speed = Math.min(1, Math.hypot(nu - pointer.u, nv - pointer.v) * 12 + 0.25);
      pointer.u = nu;
      pointer.v = nv;
      pointer.present = 1;
    };
    const onLeave = () => (pointer.present = 0);

    let W = 0;
    let H = 0;
    let camZ = 0;
    let rem = 10;
    const size = () => {
      W = innerWidth;
      H = innerHeight;
      camZ = H / 2 / Math.tan((FOV * Math.PI) / 360);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H, false);
      const dpr = renderer.getPixelRatio();
      sceneTarget.setSize(Math.floor(W * dpr), Math.floor(H * dpr));
      const tw = Math.max(64, Math.floor(W / 4));
      const th = Math.max(64, Math.floor(H / 4));
      trailA.setSize(tw, th);
      trailB.setSize(tw, th);
      (trailMat.uniforms.u_texel.value as THREE.Vector2).set(1 / tw, 1 / th);
      (postMat.uniforms.u_texel.value as THREE.Vector2).set(1 / tw, 1 / th);
      trailMat.uniforms.u_aspect.value = W / H;
      rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;
      for (const c of cards.values()) styleOf(c);
    };

    // ── Cards
    const cards = new Map<string, Card>();
    const styleOf = (c: Card) => {
      c.corner = parseFloat(getComputedStyle(c.entry.el.firstElementChild as Element).borderRadius) || 20;
      c.inset = (c.caption ? parseFloat(getComputedStyle(c.caption).getPropertyValue("--inset")) || 2 : 2) * rem;
    };
    const makeCard = (entry: PlaneEntry, index: number): Card => {
      const geo = new THREE.PlaneGeometry(1, 1, 40, 10);
      const mat = new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        vertexShader: cardVert,
        fragmentShader: cardFrag,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          u_map: { value: entry.src ? texture(entry.src) : null },
          u_res: { value: new THREE.Vector2(16, 10) },
          u_size: { value: new THREE.Vector2(1, 1) },
          u_corner: { value: 20 },
          u_alpha: { value: 0 },
          u_halfW: { value: 1 },
          u_D: { value: 0 },
          u_vel: { value: 0 },
          u_hover: { value: 0 },
          u_rise: { value: 0 },
          u_axis: { value: axis },
          u_shade: { value: 0.5 },
          u_scrim: { value: 0.45 },
        },
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.renderOrder = 1 + index;
      cardsGroup.add(mesh);
      const caption = entry.el.querySelector<HTMLElement>("[data-caption]");
      const video = entry.el.querySelector<HTMLVideoElement>("video[data-loop]");
      const card: Card = { entry, mesh, caption, hover: { t: 0, c: 0 }, index, corner: 20, inset: 20, readyAt: 0, video, videoTex: null };
      styleOf(card);
      const onEnter = () => (card.hover.t = 1);
      const onLeaveCard = () => (card.hover.t = 0);
      if (fine) {
        entry.el.addEventListener("pointerenter", onEnter);
        entry.el.addEventListener("pointerleave", onLeaveCard);
      }
      card.off = () => {
        entry.el.removeEventListener("pointerenter", onEnter);
        entry.el.removeEventListener("pointerleave", onLeaveCard);
      };
      return card;
    };
    const dropCard = (id: string) => {
      const c = cards.get(id);
      if (!c) return;
      c.off?.();
      cardsGroup.remove(c.mesh);
      c.mesh.geometry.dispose();
      c.mesh.material.dispose();
      c.videoTex?.dispose();
      if (c.caption) c.caption.style.cssText = "";
      cards.delete(id);
    };

    const v3 = new THREE.Vector3();
    const project = (p: { x: number; y: number; z: number }) => {
      v3.set(p.x, p.y, p.z).project(camera);
      return { x: (v3.x * 0.5 + 0.5) * W, y: (1 - (v3.y * 0.5 + 0.5)) * H };
    };

    const sync = (ratio: number) => {
      for (const [id, entry] of planes) {
        if (entry.kind !== "card") continue;
        if (!cards.has(id)) cards.set(id, makeCard(entry, cards.size));
      }
      for (const id of [...cards.keys()]) if (!planes.has(id)) dropCard(id);
      if (expected === 0) finishBoot();

      const halfW = (axis ? H : W) / 2; // half-extent along the ribbon's axis
      const Damp = SURFACE.sweep * halfW;
      const vel = signals.vel;
      const now = performance.now();

      // Camera: a small tilt with the pointer, looking at the room's centre.
      pointer.x = damp(pointer.x, pointer.tx * pointer.present, 0.06, ratio);
      pointer.y = damp(pointer.y, pointer.ty * pointer.present, 0.06, ratio);
      camera.position.set(pointer.x * TILT.x, -pointer.y * TILT.y, camZ);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();

      for (const card of cards.values()) {
        const r = card.entry.el.getBoundingClientRect();
        if (r.width === 0) continue;
        const cx = r.left + r.width / 2 - W / 2;
        const cy = H / 2 - (r.top + r.height / 2);
        card.mesh.position.set(cx, cy, 0);
        card.mesh.scale.set(r.width, r.height, 1);
        card.hover.c = damp(card.hover.c, card.hover.t, 0.12, ratio);
        // A card rises once the room is open AND its own picture is in, so a
        // late texture never shows as an empty black frame.
        if (!card.readyAt) {
          const img = (card.mesh.material.uniforms.u_map.value as THREE.Texture | null)?.image as { width?: number; complete?: boolean; videoWidth?: number } | undefined;
          // a still that has loaded, or the card's loop once it has a frame
          if ((img?.videoWidth ?? 0) > 0 || (img?.width && img.complete !== false)) card.readyAt = now;
        }
        const from = bootAt && card.readyAt ? Math.max(bootAt, card.readyAt - card.index * stagger.cards * 1000) : 0;
        const since = from ? (now - from) / 1000 : 0;
        // A fresh visit: the cards rise in one by one after the boot. Coming
        // back to the room from inside the site: no entrance, just a short
        // fade as each picture is ready, so it reads as simply returning.
        const rise = veil
          ? (!from ? 0 : easeExpoOut((since - 0.1 - card.index * stagger.cards) / D.stack))
          : shownAt ? 1 : 0; // the room sits under the page: it is drawn in full, and the page's cards fade off it
        const u = card.mesh.material.uniforms;
        (u.u_size.value as THREE.Vector2).set(r.width, r.height);
        // The loop takes over from the still once it is actually playing (a
        // paused video never uploads a frame, which would paint black)
        // (the <Loop> element plays it; here it is only sampled).
        const v = card.video;
        if (v && !card.videoTex && v.readyState >= 2 && v.videoWidth && !v.paused && v.currentTime > 0) {
          const vt = new THREE.VideoTexture(v);
          vt.colorSpace = THREE.SRGBColorSpace;
          vt.minFilter = THREE.LinearFilter;
          vt.magFilter = THREE.LinearFilter;
          vt.generateMipmaps = false;
          card.videoTex = vt;
          u.u_map.value = vt;
        }
        if (card.videoTex && v) (u.u_res.value as THREE.Vector2).set(v.videoWidth, v.videoHeight);
        else {
          const img = (u.u_map.value as THREE.Texture | null)?.image as { width?: number; height?: number } | undefined;
          if (img?.width && img?.height) (u.u_res.value as THREE.Vector2).set(img.width, img.height);
        }
        u.u_corner.value = card.corner;
        u.u_halfW.value = halfW;
        u.u_D.value = Damp;
        u.u_vel.value = vel;
        u.u_hover.value = card.hover.c;
        u.u_rise.value = veil ? rise : 1; // a return fades in place, it does not rise
        u.u_alpha.value = rise;

        // Before the handover the page lays out its own captions; leave them be.
        if (card.caption && (veil || shownAt)) {
          const inset = card.inset;
          const su = { halfW, D: Damp, vel, hover: card.hover.c, rise, axis, size: { x: r.width, y: r.height } };
          const pl = project(surfaceTS({ x: cx - r.width / 2 + inset, y: cy - r.height / 2 + inset, z: 0 }, { x: -0.5 + inset / r.width, y: -0.5 + inset / r.height }, su));
          const pr = project(surfaceTS({ x: cx + r.width / 2 - inset, y: cy - r.height / 2 + inset, z: 0 }, { x: 0.5 - inset / r.width, y: -0.5 + inset / r.height }, su));
          const s = card.caption.style;
          s.position = "absolute";
          s.left = "0";
          s.top = "0";
          s.right = "auto";
          s.bottom = "auto";
          s.width = `${Math.max(0, pr.x - pl.x)}px`;
          s.transform = `translate3d(${(pl.x - r.left).toFixed(1)}px, ${(pl.y - r.top - card.caption.offsetHeight).toFixed(1)}px, 0)`;
          s.opacity = veil ? String(rise) : "1";
        }
      }

      // Every picture is in: hand over from the page's cards to the room's.
      if (!veil && !shownAt && cards.size && [...cards.values()].every((c) => c.readyAt)) {
        shownAt = now;
        window.dispatchEvent(new Event("gl:shown"));
      }

      // 1. Scene
      renderer.setRenderTarget(sceneTarget);
      renderer.clear();
      renderer.render(scene, camera);

      // 2. Trail
      trailMat.uniforms.u_prev.value = trailRead.texture;
      (trailMat.uniforms.u_pos.value as THREE.Vector2).set(pointer.u, pointer.v);
      trailMat.uniforms.u_amp.value = pointer.present * pointer.speed * 0.22;
      pointer.speed *= Math.pow(0.85, ratio);
      renderer.setRenderTarget(trailWrite);
      renderer.render(trailScene, quadCam);
      [trailRead, trailWrite] = [trailWrite, trailRead];

      // 3. Post
      postMat.uniforms.u_trail.value = trailRead.texture;
      renderer.setRenderTarget(null);
      renderer.render(postScene, quadCam);
    };

    size();
    (window as unknown as { __gl?: unknown }).__gl = {
      cards,
      camera,
      renderer,
      scene,
      step: (n = 1) => {
        for (let i = 0; i < n; i++) sync(1);
      },
    };
    window.addEventListener("resize", size);
    if (fine) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }
    ticker.add(sync);
    return () => {
      clearTimeout(bootGuard);
      clearTimeout(handoverGuard);
      clearTimeout(foldTimer);
      boot.pending = false; // left mid-boot: do not replay it on return
      ticker.remove(sync);
      window.removeEventListener("resize", size);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      for (const id of [...cards.keys()]) dropCard(id);
      for (const t of textures.values()) t.dispose();
      sceneTarget.dispose();
      trailA.dispose();
      trailB.dispose();
      quadGeo.dispose();
      trailMat.dispose();
      postMat.dispose();
      renderer.dispose();
    };
  }, [planes, veil]);

  return (
    <>
      {/* the drifting lines, under the transparent canvas so they stay behind the cards */}
      <HomePaths />
      <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 block h-full w-full" />
      {/* Boot veil: the mark draws itself, then the room opens through it (BootVeil). */}
      {!booted && <BootVeil open={open} />}
    </>
  );
}
