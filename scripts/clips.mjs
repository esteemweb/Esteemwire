// The card loops. Each hero still (16:9, public/work/<slug>/hero.jpg) is
// animated by Higgsfield's Kling 3.0 Turbo image-to-video with a motion
// prompt that moves the picture and leaves the interface still; the raw
// five-second clip lands in generated/clips/<slug>.mp4 and is then made
// seamless — ping-pong for ambient motion (sway, mist, flicker, a turn),
// a tail-to-head crossfade for directional motion (traffic, a crowd) —
// into public/work/<slug>/hero.mp4. TRAAG is the exception: its card is
// composed from the TRAAG site's own crowd and portrait videos (the four
// treatments of her face cycle inside the loop) under a transparent capture
// of the site's chrome, so nothing is generated for it.
//
//   npm run clips -- <slug>          # regenerate (spends credits) and loop
//   npm run clips -- <slug> --loop   # only rebuild the loop from the raw clip
//   npm run clips -- --loop          # rebuild every loop
//   npm run clips -- --reel <slug>   # a showreel from the site's own art (see `reels`)
//
// Needs the `higgsfield` CLI (signed in) and ffmpeg on PATH.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"), "..");
const raw = (slug) => path.join(root, "generated", "clips", `${slug}.mp4`);
const still = (slug) => path.join(root, "public", "work", slug, "hero.jpg");
const out = (slug) => path.join(root, "public", "work", slug, "hero.mp4");

const STILL_TEXT = "stay perfectly still, crisp and legible.";
/** slug → [loop style, motion prompt, { until?: seconds to keep of the raw clip }] */
const clips = {
  "loud-laundry": ["pingpong", `The black hoodie sways gently as if hanging in a breeze, its drawstrings swinging; the row of tees along the top bobs softly; the fluorescent green print shimmers and the pink grid paper drifts very slowly. All text, the nav bar and the logo ${STILL_TEXT}`],
  "talay-dao": ["pingpong", `The ring of framed photographs spins smoothly around its empty centre like a wheel, a full steady rotation, every photograph staying tack sharp and fully legible as it travels, each frame gently tilting as it swings round; mist rolls across the water behind. The centre square stays empty; the existing 'Talay Dao' title, the vertical text and the buttons ${STILL_TEXT}`],
  "leaf-and-cherry": ["pingpong", `Strong, visible motion: the roaster drum spins fast, thick white steam billows up from the machine and rolls along the ceiling, roasted coffee beans pour out of the drum into the round cooling tray and get stirred by the rotating arm, a barista in an apron walks past behind the glass, and bright sunbeams sweep across the window from left to right. The logo, the header and the caption text ${STILL_TEXT}`],
  overprint: ["crossfade", `Red double-decker buses and black taxis stream past in motion blur; the woman in the grey coat walks steadily across the crossing; neon shop signs flicker and reflections shimmer on the wet street. The logo, navigation, list, paragraph and the big calligraphic headline ${STILL_TEXT}`],
  corneum: ["pingpong", `The clear glass vessel slowly turns on the spot, light glinting across the brushed steel cap and the glass, its shadow sweeping around with it; a small droplet slides down the inside. Everything else on the white page, every line of text and both buttons, ${STILL_TEXT}`],
  "le-comble": ["pingpong", `Candle flames flicker on the white tablecloths; the deep blue silk gradient on the panel ripples slowly like fabric in a breeze; the blue curtains sway gently; city lights twinkle through the tall windows and wine glasses catch the light. All the text, the buttons and the ticker ${STILL_TEXT}`],
  "ask-for-the-moon": ["pingpong", `The page stays completely still and every letter razor sharp, while the black half slowly slides to the left across the giant letters like a moving shadow, revealing the cream behind, and the small moon icon on the right glows and pulses softly.`],
  traag: ["site", "composed from E:/demo-sites/traag/public/traag (crowd.mp4 + hero.mp4) and the site chrome"],
  uroko: ["pingpong", `The tattooed man breathes slowly and lifts his gaze a little, the dragons and waves on his skin catching light; behind him indigo ink drifts and ripples through the fish-scale pattern and the thin vermilion scale lines glow in a slow wave; the pink scale emblem above the title pulses softly. The word UROKO, the navigation, the vertical Japanese text and every caption ${STILL_TEXT}`, { until: 2.8 }],
};

/** Showreels: a demo site's own artwork brought to life, shown in its case
    study gallery as public/work/<slug>/showreel.mp4 (+ .jpg poster).
    `npm run clips -- --reel <slug>` (spends credits). */
const reels = {
  uroko: {
    source: "E:/demo-sites/uroko/public/motifs/koi.webp",
    crop: "crop=800:800:0:0", // square from the top: the head and whiskers stay, the tail runs out of frame
    aspect: "1:1",
    style: "pingpong",
    prompt: "Locked, perfectly still camera, no zoom, no pan. The koi swims upward against the current with slow, powerful sweeps of its tail, its fins and whiskers rippling, scales catching light; the waves around it surge and crash and fling droplets of spray; the paper texture stays completely still. Ukiyo-e woodblock ink illustration, every line stays crisp and the colours flat and printed.",
  },
};

const ff = (args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });
const probe = (file) =>
  execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries", "stream=nb_read_frames:format=duration", "-of", "json", file]).toString();

function generate(slug) {
  mkdirSync(path.dirname(raw(slug)), { recursive: true });
  // Through the shell (the CLI is a .cmd shim on Windows), prompt on stdin.
  const json = execFileSync("higgsfield", ["generate", "create", "kling3_0_turbo", "--start-image", still(slug), "--aspect_ratio", "16:9", "--duration", "5", "--wait", "--json"], { encoding: "utf8", input: clips[slug][1], shell: true, stdio: ["pipe", "pipe", "inherit"] });
  const url = (json.match(/"result_url"\s*:\s*"([^"]+)"/) || [])[1];
  if (!url) throw new Error(`${slug}: no result_url in the job output`);
  writeFileSync(raw(slug), execFileSync("curl", ["-sL", url], { maxBuffer: 1 << 28 }));
  console.log(`${slug}: raw clip → generated/clips/${slug}.mp4`);
}

const TRAAG = "E:/demo-sites/traag";
/** The TRAAG card, built the way the site builds its hero: the crowd video
    (cover, ×1.04, orange multiply tint) under the 4:5 portrait video with
    feathered sides, under the site's chrome captured with a transparent
    background at 1440×810 (generated/clips/traag-ui.png; recaptured from
    the running site on :3008 when missing). 5.2 s: one portrait through its
    four treatments; the crowd layer crossfades tail-to-head so the loop's
    hard cut back to the plain portrait is the only cut, as on the site. */
async function composeTraag() {
  const ui = path.join(root, "generated", "clips", "traag-ui.png");
  if (!existsSync(ui)) {
    const { chromium } = await import("playwright-core");
    const browser = await chromium.launch({ channel: "chrome", headless: true });
    const page = await (await browser.newContext({ viewport: { width: 1440, height: 810 } })).newPage();
    await page.goto("http://localhost:3008", { waitUntil: "networkidle" });
    await page.waitForTimeout(9000);
    await page.evaluate(() => {
      const sec = document.querySelector("section[data-hero]");
      for (const v of sec.querySelectorAll("video")) v.closest("section[data-hero] > *").style.visibility = "hidden";
      for (const el of [document.documentElement, document.body, sec]) el.style.background = "transparent";
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: ui, omitBackground: true });
    await browser.close();
  }
  // Geometry measured on the site at 1440×810, scaled to 1280×720.
  const fc = [
    "[0:v]trim=0:5.7,setpts=PTS-STARTPTS,fps=24,scale=1280:-2,crop=1280:720,scale=1331:-2,crop=1280:720,colorchannelmixer=rr=1:gg=0.645:bb=0.5,split[ca][cb]",
    "[ca]trim=0:5.2,setpts=PTS-STARTPTS[chead];[cb]trim=5.2:5.7,setpts=PTS-STARTPTS[ctail]",
    "[ctail][chead]xfade=transition=fade:duration=0.5:offset=0[crowd]",
    "[1:v]trim=0:5.2,setpts=PTS-STARTPTS,fps=24,scale=525:656,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*clip(min(X/(W*0.14),(W-X)/(W*0.14)),0,1)'[face]",
    "[crowd][face]overlay=378:64:format=auto[stage]",
    "[2:v]scale=1280:720[ui]",
    "[stage][ui]overlay=0:0:format=auto,format=yuv420p[v]",
  ].join(";");
  ff(["-i", `${TRAAG}/public/traag/crowd.mp4`, "-i", `${TRAAG}/public/traag/hero.mp4`, "-i", ui, "-filter_complex", fc, "-map", "[v]", "-t", "5.2", "-an", "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", "22", "-movflags", "+faststart", out("traag")]);
  // The poster is the loop's first frame, so the still and the clip match.
  ff(["-i", out("traag"), "-frames:v", "1", "-vf", "scale=2048:1152:flags=lanczos", "-q:v", "2", still("traag")]);
  console.log("traag: composed from the site → public/work/traag/hero.mp4 (+ hero.jpg)");
}

function loop(slug) {
  const [style, , opt = {}] = clips[slug];
  const info = JSON.parse(probe(raw(slug)));
  // `until` keeps only the opening of a take (e.g. before a camera move).
  const dur = Math.min(Number(info.format.duration), opt.until ?? Infinity);
  const fps = Number(info.streams[0].nb_read_frames) / Number(info.format.duration);
  const frames = Math.round(dur * fps);
  const head = opt.until ? `trim=0:${dur},setpts=PTS-STARTPTS,` : "";
  const enc = ["-an", "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", "22", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out(slug)];
  if (style === "pingpong") {
    // Forward, then backward without the two turnaround frames, so no frame repeats at either seam.
    ff(["-i", raw(slug), "-filter_complex", `[0:v]${head}split[a][b];[b]reverse,trim=start_frame=1:end_frame=${frames - 1},setpts=PTS-STARTPTS[r];[a][r]concat=n=2:v=1:a=0[v]`, "-map", "[v]", ...enc]);
  } else {
    // The last 0.8 s dissolves into the first 0.8 s; the loop is that much shorter.
    const f = 0.8;
    ff(["-i", raw(slug), "-filter_complex", `[0:v]${head}split[a][b];[a]trim=0:${dur - f},setpts=PTS-STARTPTS[head];[b]trim=${dur - f}:${dur},setpts=PTS-STARTPTS[tail];[tail][head]xfade=transition=fade:duration=${f}:offset=0[v]`, "-map", "[v]", ...enc]);
  }
  console.log(`${slug}: ${style} loop → public/work/${slug}/hero.mp4`);
}

function reel(slug) {
  const r = reels[slug];
  if (!r) throw new Error(`no reel for ${slug}: ` + Object.keys(reels).join(", "));
  const dir = path.join(root, "public", "work", slug);
  const rawFile = path.join(root, "generated", "clips", `${slug}-reel.mp4`);
  const poster = path.join(dir, "showreel.jpg");
  const outFile = path.join(dir, "showreel.mp4");
  mkdirSync(path.dirname(rawFile), { recursive: true });
  ff(["-i", r.source, "-vf", r.crop, "-q:v", "2", poster]);
  if (!process.argv.includes("--loop")) {
    const json = execFileSync("higgsfield", ["generate", "create", "kling3_0_turbo", "--start-image", poster, "--aspect_ratio", r.aspect, "--duration", "5", "--wait", "--json"], { encoding: "utf8", input: r.prompt, shell: true, stdio: ["pipe", "pipe", "inherit"] });
    const url = (json.match(/"result_url"\s*:\s*"([^"]+)"/) || [])[1];
    if (!url) throw new Error(`${slug} reel: no result_url in the job output`);
    writeFileSync(rawFile, execFileSync("curl", ["-sL", url], { maxBuffer: 1 << 28 }));
    console.log(`${slug}: raw reel → generated/clips/${slug}-reel.mp4`);
  }
  const info = JSON.parse(probe(rawFile));
  const frames = Number(info.streams[0].nb_read_frames);
  const enc = ["-an", "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", "22", "-pix_fmt", "yuv420p", "-movflags", "+faststart", outFile];
  ff(["-i", rawFile, "-filter_complex", `[0:v]split[a][b];[b]reverse,trim=start_frame=1:end_frame=${frames - 1},setpts=PTS-STARTPTS[r];[a][r]concat=n=2:v=1:a=0[v]`, "-map", "[v]", ...enc]);
  // the poster is the loop's first frame, so still and clip match exactly
  ff(["-i", outFile, "-frames:v", "1", "-q:v", "2", poster]);
  console.log(`${slug}: ${r.style} showreel loop → public/work/${slug}/showreel.mp4 (+ showreel.jpg)`);
}

const args = process.argv.slice(2);
const reelAt = args.indexOf("--reel");
if (reelAt >= 0) {
  reel(args[reelAt + 1]);
  process.exit(0);
}
const loopOnly = args.includes("--loop");
const slugs = args.filter((a) => !a.startsWith("--"));
if (!slugs.length && !loopOnly) {
  console.error("name a slug (or --loop to rebuild every loop): " + Object.keys(clips).join(", "));
  process.exit(1);
}
for (const slug of slugs.length ? slugs : Object.keys(clips)) {
  if (!clips[slug]) throw new Error(`unknown slug ${slug}`);
  if (clips[slug][0] === "site") {
    await composeTraag();
    continue;
  }
  if (!loopOnly || !existsSync(raw(slug))) generate(slug);
  loop(slug);
}
