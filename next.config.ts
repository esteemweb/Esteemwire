import type { NextConfig } from "next";
import { unfilled } from "./content/legal";

// The Impressum and Privacy policy read from content/legal.ts. Warn while
// any placeholder there is still unfilled, so they never go live half-done.
const missing = unfilled();
if (missing.length) {
  console.warn(
    [
      "",
      `WARNING: content/legal.ts still has ${missing.length} placeholder(s): ${missing.join(", ")}.`,
      "         The Impressum and Privacy pages will show them until filled in.",
      "",
    ].join("\n"),
  );
}

// The contact form cannot deliver without RESEND_API_KEY (app/actions.ts).
// Warn loudly at build time; the form also logs an error on every attempt.
if (!process.env.RESEND_API_KEY) {
  console.warn(
    [
      "",
      "WARNING: RESEND_API_KEY is not set. The contact form will NOT deliver enquiries.",
      "         Set it in Vercel > Project > Settings > Environment Variables (Production).",
      "",
    ].join("\n"),
  );
}

// Security headers, sent with every response. Kept to headers that cannot
// break fonts, images, video, WebGL or animations: a full
// Content-Security-Policy is deliberately not set; add one only with
// re-testing of all of those.
const securityHeaders = [
  // Browsers must not guess file types (stops a file being run as a script).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Other sites only learn our domain, never full page addresses.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Switch off device features the site never uses.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  // No other site may show ours inside a frame (clickjacking protection):
  // the modern rule and the older one, for older browsers.
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  // Do not advertise the framework in a response header.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // The layout is width-driven (fluid rem, see globals.css). Cards are at
    // most ~700px wide at the design width, galleries 700px; 2x for retina.
    deviceSizes: [390, 650, 1024, 1440, 1536, 2048],
    imageSizes: [160, 320, 480, 640, 700, 1400],
  },
  experimental: {
    inlineCss: true,
  },
};

export default nextConfig;
