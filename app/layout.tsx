import type { Metadata, Viewport } from "next";
import { site } from "@/content/site";
import { Frame } from "@/components/Frame";
import { GLRoot } from "@/components/gl/GLRoot";
import { label, mark } from "./fonts";
import "./globals.css";

// Runs before first paint. Motion styles only apply when `data-motion` is
// present, so reduced motion and no-JS both get the final state at once.
const MOTION =
  "try{var h=document.documentElement;if(!matchMedia('(prefers-reduced-motion: reduce)').matches){h.setAttribute('data-motion','')}}catch(e){}";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s — ${site.name}` },
  description: site.summary,
  openGraph: { siteName: site.name, type: "website", images: ["/og.jpg"] },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children, overlay }: { children: React.ReactNode; overlay: React.ReactNode }) {
  return (
    <html lang="en" className={`${mark.variable} ${label.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION }} />
      </head>
      <body>
        <a href="#content" className="label sr-only focus:not-sr-only focus:fixed focus:left-40 focus:top-25 focus:z-50">
          Skip to content
        </a>
        {/* The persistent canvas root. In DOM mode it only keeps the plane
            registry; in GL mode it also mounts the WebGL room behind the page. */}
        <GLRoot>
          <div id="content">{children}</div>
          {overlay}
          <Frame />
        </GLRoot>
      </body>
    </html>
  );
}
