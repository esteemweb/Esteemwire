# Esteemwire — project notes

The agency's own site. Next.js 16 (App Router, no `src/`), TypeScript, Tailwind v4.

```
npm run dev      # http://localhost:3009
npm run build && npm start   # prebuilt, also port 3009
```

## ⚠ BEFORE LAUNCH — must all be done

The legal pages exist but are deliberately hidden until they are complete. Do all four before
the site goes public:

1. **Fill in `content/legal.ts`.** Replace every `[PLACEHOLDER]` in the block at the top (name,
   legal form, address, phone, register, VAT ID, content responsible, retention period,
   supervisory authority). Optional fields become `""`. `npm run build` warns until none are left.
2. **Restore the legal links** on every page: in `components/Frame.tsx` set
   `SHOW_LEGAL_LINKS` to `true`. They sit above Contact in the bottom-right corner; German law
   expects the Impressum one click from every page.
3. **Remove `noindex`:** delete the `robots: { index: false, follow: false }` part of `metadata`
   in `app/impressum/page.tsx` and `app/privacy/page.tsx`, and uncomment the two lines for
   `/privacy` and `/impressum` in `app/sitemap.ts`.
4. **Set `RESEND_API_KEY`** in Vercel (see below), verify the `esteemwire.com` domain in Resend,
   then send a real test enquiry and confirm it arrives. Without the key the form shows visitors
   a failure message and nothing is delivered.

Until then `/impressum` and `/privacy` are reachable by direct URL only, and not indexed.

## Deployment notes (Vercel)

- **One secret is required: `RESEND_API_KEY`.** Set it in Vercel → Project → Settings →
  Environment Variables for Production (and Preview if previews should send mail). Create it at
  resend.com → API Keys with "Sending access". Server-only: never give it a `NEXT_PUBLIC_`
  prefix, never commit it. `.env.example` names it; local testing uses `.env.local`
  (git-ignored).
- **The contact form** (`app/actions.ts`, a server action) emails each enquiry through Resend's
  API, from `hello@esteemwire.com` to the studio inbox, with the visitor as reply-to. The
  delivery address is server-only and must never appear on the site. Spam protection: a
  honeypot field, a 3-second minimum fill time, and 3 sends per IP per 10 minutes (counted per
  server instance, which is intended). If the key is missing, the build, the server start and
  every submission log a loud warning; the visitor is never told "sent" unless Resend accepted
  the email.
- **Domain:** `https://esteemwire.com`, set as `site.url` in `content/site.ts`; share previews,
  canonical links, the sitemap and robots.txt all use it. Optional env var
  `NEXT_PUBLIC_SITE_URL` overrides it (e.g. for a staging copy); it is public, not a secret.
- **Security headers** are set in `next.config.ts` for every response (`nosniff`,
  `strict-origin-when-cross-origin`, a Permissions-Policy switching off camera / mic /
  location / payment / USB, `frame-ancestors 'none'` plus `X-Frame-Options: DENY`), and
  `poweredByHeader: false`. There is deliberately no full Content-Security-Policy: add one only
  after re-testing fonts, images, the card videos, the WebGL room, the About shader and the
  drifting lines.
- **Social links:** none yet. Add profiles in `content/site.ts` → `profiles` (commented
  examples there); while the list is empty, no social links appear anywhere.
- **Demo links still on vercel.app:** Uroko (`uroko-kohl.vercel.app`) and Le Comble
  (`le-comble.vercel.app/fr`). Once those projects have custom domains, update `demoUrl` in
  `content/projects.ts`.
- Build command `npm run build`, default Next.js output: Vercel's defaults work. No database,
  no analytics, no cookies. Fonts are downloaded at build and served from the site itself.
- `.gitignore` keeps out every env file (except `.env.example`), private notes and audit
  reports (`LESSONS.md`, `REFERENCE-*.md`, briefs, `SECURITY-AUDIT.md`, `DESIGN.md`), `generated/` (raw
  video takes, ~38 MB) and build output. The finished videos in `public/work` are committed.
  See `SECURITY-AUDIT.md` (local only) for the full audit.

## Security-audit phases

A (`.gitignore`), B (contact form), C (legal pages) and D (headers, placeholders, unused code,
reduce motion, comment clean-up, grid floor removed) are all done. The home ribbon's motion (the
S-shaped bend, speed shear and cursor trail) was kept deliberately at the owner's request. What is left before launch is the
list at the top of this file, plus the two vercel.app demo links above.
