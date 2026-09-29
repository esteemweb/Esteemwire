// Captures every demo site into public/work/<slug>/<name>.jpg at the exact
// pixel size declared in content/projects.ts, by rendering a 1440px-wide
// viewport and scaling the device pixel ratio. All eight demo servers must
// be running (ports 3001–3008 and 3010). Needs a local Chrome:
//   npm run capture [-- slug]
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve(new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"), "..", "public", "work");
const VW = 1440;

// [slug, [name, url, w, h, { wait?, scrollTo?, extra? }]]
const plan = [
  ["loud-laundry", [
    ["hero", "http://localhost:3001", 2048, 1280],
    ["g1", "http://localhost:3001/shop", 1600, 1000],
    ["g2", "http://localhost:3001/shop/fluoro", 1600, 1200],
    ["g3", "http://localhost:3001/the-label", 1600, 900],
  ]],
  ["talay-dao", [
    ["hero", "http://localhost:3002", 2048, 1152],
    ["g1", "http://localhost:3002/villas", 1600, 1000],
    ["g2", "http://localhost:3002/gallery", 1600, 2000],
  ]],
  ["leaf-and-cherry", [
    ["hero", "http://localhost:3003", 1600, 1000],
    ["g1", "http://localhost:3003/subscribe", 1600, 1000],
    ["g2", "http://localhost:3003/account", 1600, 1100],
  ]],
  ["overprint", [
    ["hero", "http://localhost:3004", 2048, 1365],
    ["g1", "http://localhost:3004/#work", 1600, 1000, { scrollTo: "work" }],
    ["g2", "http://localhost:3004/#process", 1600, 1000, { scrollTo: "process", extra: 420 }],
  ]],
  ["corneum", [
    ["hero", "http://localhost:3005", 1600, 1200],
    ["g1", "http://localhost:3005/range", 1600, 1000],
    ["g2", "http://localhost:3005/science", 1600, 1000],
    ["g3", "http://localhost:3005/range/cleanse", 1600, 1000],
  ]],
  ["le-comble", [
    ["hero", "http://localhost:3006/fr", 2048, 1280, { wait: 5000 }],
    ["g1", "http://localhost:3006/fr/restaurant", 1600, 1000],
    ["g2", "http://localhost:3006/fr/chambres", 1600, 1000],
  ]],
  ["ask-for-the-moon", [
    ["hero", "http://localhost:3007", 1600, 1000, { wait: 9000 }],
    ["g1", "http://localhost:3007/read", 1600, 1000, { wait: 9000 }],
    ["g2", "http://localhost:3007/#buy", 1600, 900, { wait: 9000, scrollTo: "buy", extra: 90 }],
  ]],
  ["traag", [
    ["hero", "http://localhost:3008", 2048, 1152, { wait: 8000 }],
    ["g1", "http://localhost:3008/music", 1600, 1000, { wait: 6000 }],
    ["g2", "http://localhost:3008/dates", 1600, 1000, { wait: 6000 }],
    ["g3", "http://localhost:3008/list", 1600, 1000, { wait: 6000 }],
  ]],
  ["uroko", [
    ["hero", "http://localhost:3010", 2048, 1152, { wait: 9000 }],
    ["g1", "http://localhost:3010/motifs", 1600, 1000, { wait: 6000 }],
    ["g2", "http://localhost:3010/motifs/koi", 1600, 1000, { wait: 6000 }],
    ["g3", "http://localhost:3010/book", 1600, 1000, { wait: 6000 }],
  ]],
];

const only = process.argv[2];
const browser = await chromium.launch({ channel: "chrome", headless: true });
for (const [slug, shots] of plan) {
  if (only && slug !== only) continue;
  await mkdir(path.join(OUT, slug), { recursive: true });
  for (const [name, url, w, h, opt = {}] of shots) {
    const dpr = w / VW;
    const vh = Math.round(h / dpr);
    const ctx = await browser.newContext({ viewport: { width: VW, height: vh }, deviceScaleFactor: dpr, colorScheme: "light" });
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    } catch (e) {
      console.warn(`  ${slug}/${name}: ${e.message.split("\n")[0]} — continuing`);
    }
    await page.waitForTimeout(opt.wait ?? 3500); // loaders and entrance reveals
    if (opt.scrollTo) {
      await page.evaluate(({ id, extra }) => {
        document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "instant" });
        window.scrollBy(0, extra);
      }, { id: opt.scrollTo, extra: opt.extra ?? 0 });
      await page.waitForTimeout(2500);
    }
    await page.mouse.move(VW / 2, vh / 2);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, slug, `${name}.jpg`), type: "jpeg", quality: 88, clip: { x: 0, y: 0, width: VW, height: vh } });
    console.log(`${slug}/${name} ← ${url} (${w}×${h})`);
    await ctx.close();
  }
}
await browser.close();
