import { Geist_Mono, Jost } from "next/font/google";

/* Two faces.
   - Jost: the logo sets "esteemwire" in a light geometric sans, widely
     spaced, and Jost is that shape. Exposed as --font-mark; it is also the
     site's text face (--font-brand), so body copy, titles and the wordmark
     share one family.
   - Geist Mono: the small uppercase labels (chrome, eyebrows, captions),
     tracked wide. Exposed as --font-label. */
export const mark = Jost({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-mark", display: "swap" });
export const label = Geist_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-label", display: "swap" });
