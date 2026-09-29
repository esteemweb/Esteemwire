# Esteemwire

The agency's own site. Next.js 16 (App Router, no `src`), TypeScript, Tailwind v4.

```
npm run build && npm start        # serves the prebuilt bundle on http://localhost:3009
npm run dev                       # dev server on 3009
npm run capture [-- slug]         # re-shoots the public/work stills from the running demo sites
npm run clips -- <slug>           # regenerates one card loop with Higgsfield (spends credits), see scripts/clips.mjs
```

`next start` serves a prebuilt bundle: after changing any file, run `npm run build`, stop the old
process and start it again.

## Structure

```
app/
  layout.tsx            html/body, the motion opt-in script, <GLRoot>, <Frame>, the @overlay slot
  globals.css           all tokens (@theme), role utilities, reveals, view-transition timing
  page.tsx              home: name + one line + the ribbon
  fonts.ts              Jost (text and wordmark) and Geist Mono (labels)
  icon.svg              the mark on a black tile (generated from content/mark.ts)
  work/page.tsx         the index: every project and service as a word cloud with hover previews
  work/[slug]/page.tsx  the case-study sheet
  about/, contact/      full pages
  @overlay/(.)about     the same bodies as overlays when reached from inside the site
  @overlay/(.)contact
  actions.ts            contact form server action (validates; delivery TODO)
  llms.txt/route.ts     /llms.txt
  md/[...path]/route.ts Markdown twin of every page (see proxy.ts)
  sitemap.ts, robots.ts, not-found.tsx, icon.svg
components/
  Frame.tsx             the four-corner chrome
  Ribbon.tsx            the infinite draggable ribbon (wheel, drag, flick, keys, --vel, eyebrow)
  WorkCard.tsx          card anatomy: picture, caption, scrim, flight name
  IndexCloud.tsx        word cloud + travelling preview
  Overlay.tsx           centred overlay panel (Escape / backdrop go back)
  AboutBody.tsx, ContactBody.tsx, ContactForm.tsx
  VT.tsx                the shared-element flight (React ViewTransition), swappable for a GL flight
  gl/GLRoot.tsx         capability decision + plane registry; mounts the scene in `gl` mode
  gl/GLScene.tsx        the room: three.js canvas behind the page; card planes follow their DOM
                        rects, bent onto the ribbon surface; the cursor trail and post pass
  gl/ribbonSurface.ts   the one height field (GLSL + TS twin) every card and caption lies on
  gl/shaders.ts         card shader, cursor trail and post pass
content/
  site.ts               agency copy, contact details, chrome labels, services
  projects.ts           the nine demos, with media dimensions
lib/
  motion.ts             every duration, ease, stagger and the ribbon physics constants
  ticker.ts             the one clock (frame-ratio callbacks) and wrap()
  jsonld.ts             structured data
  markdown.ts           Markdown renderers for the twins and llms.txt
components/Loop.tsx     a silent in-view loop over a still (cards and the sheet hero)
components/Mark.tsx     the mark as inline SVG
components/Mark3D.tsx   the mark with depth: extruded layers, pointer tilt, idle turn, sheen (chrome, About)
content/mark.ts         the mark's five faces and gradients, traced from logo/
logo/                   the supplied logo (JPEG on black; also public/og.jpg)
proxy.ts                rewrites `*.md` and `Accept: text/markdown` to app/md
scripts/capture.mjs      # stills of the demo sites (ports 3001–3008, 3010) into public/work
scripts/clips.mjs        # the animated card loops: Kling image-to-video from each hero, made seamless
```

## The system in one screen

- **Root rem is fluid**: `10 × 100vw / 390` below 650px, `/ 1500` above, capped at 18px. Every numeric
  utility is a tenth of a rem (`p-40` = 40 design px). One breakpoint: `s:` at 650px.
- **Type**: one family, weights 400/500, roles `label` (10) / `text-body` (14) / `text-copy` (16) /
  `text-title` (18) / `text-h2` (24) / `text-index` (30) / `text-h1` (35) / `text-display` (45), with
  tracking that tightens as size grows. Uppercase only at the label size.
- **Colour**: `room` (black), `ink` (white), `paper` (the case-study sheet), `pill`, `black`, one
  `accent` reserved for a single mark. Muted tones are `ink/60`, `ink/50` and so on.
- **Motion**: `lib/motion.ts` and the `--ease-*` / `--duration-*` tokens. Reveals use `.reveal` with
  `--at` for the delay; they only animate when `<html data-motion>` is present (set before first paint
  unless the user prefers reduced motion).
- **Chrome**: four labels in the corners, 40/25 → 80/40 insets, blended with `difference` so they read
  on both the room and the paper.

## The GL layer

The home ribbon renders in WebGL on capable machines (WebGL2, hover-capable, ≥ 650px, no reduced
motion; `?gl=0` forces the DOM version). The DOM still lays out and catches clicks: each card's
`<article>` registers a plane, the scene reads its rect every frame and draws the picture on a
closed-form ribbon surface (depth sweep, resting bank, velocity twist and rear-up, hinge, hover
dome), and the cards lean (skew) with the ribbon's speed. Captions are projected onto the same
surface. The camera tilts a little with the pointer. A post pass resamples the frame along a
cursor trail (a height field painted at quarter resolution) so the page slides as if a ball
rolled under it. The boot veil draws the logo and opens the room through
it; returning from inside the site skips it and crossfades from the page's cards to the room's.
Clicking a card flips the mode to DOM synchronously so the view-transition flight has a visible
picture to fly. Drifting lines (`components/HomePaths.tsx`) sit behind the transparent canvas.

Per frame: scene pass (full size) → trail pass (1/4 size) → post pass to screen.

Tuning lives in `components/gl/ribbonSurface.ts` (`SURFACE`) and `lib/motion.ts` (`ribbon`).
`window.__gl` exposes the scene, and `__gl.step(n)` drives frames by hand in a background tab.

## What is deliberately not here yet

- Type: Jost for text and the wordmark, Geist Mono for labels, both in `app/fonts.ts`.
- Copy: everything marked `TODO` in `content/`. Stills are captured from the demo sites with
  `npm run capture`; the card loops are generated from them with `npm run clips`; hosted demo URLs replace the local ports when they exist.
- Contact delivery: `app/actions.ts` validates and logs; wire the email provider there.
- Hosting: not set up. Do not deploy until asked.
