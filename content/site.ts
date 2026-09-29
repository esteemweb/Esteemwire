// Agency-level content: the studio's name, copy, contact details and the
// chrome's labels. Edit words here; layout lives in the components.

export const site = {
  name: "Esteemwire",
  legalName: "Esteemwire",
  // The live address, used for share previews, canonical links and the
  // sitemap. Override with NEXT_PUBLIC_SITE_URL (e.g. for a staging copy).
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://esteemwire.com",
  role: "Website agency",
  tagline: "Websites with a point of view.",
  // One sentence: meta description, structured data and the readable layer.
  summary:
    "Esteemwire is an independent design and engineering studio building websites for brands that need their site to carry real weight.",
  // The About page: a one-line position, one paragraph, three principles.
  lead: "We design and build websites that carry a brand's weight.",
  about:
    "Esteemwire is an independent studio for design and engineering. We take a site from positioning and art direction through build, content and launch, with one team accountable for the result. Every project is made for the business it serves: no templates, no hand-offs, and no trade between how a site looks and how it performs.",
  principles: [
    { title: "Strategy first", body: "Every decision starts from what the site has to achieve for the business, and is measured against it." },
    { title: "Made, not assembled", body: "Custom design and code, built for speed, accessibility and search from the first commit." },
    { title: "Accountable end to end", body: "The people who design your site build it, launch it and stand behind it afterwards." },
  ],
  // One short trust line about the studio's track record. Keep it to one line.
  proof: "Nine launches across retail, hospitality, publishing, music and beauty.",
  email: "hello@esteemwire.com",
  // Social profiles, shown on the About page and listed for search engines.
  // ADD YOUR PROFILES HERE when you have the final URLs, one per line, e.g.
  //   { label: "Instagram", url: "https://www.instagram.com/esteemwire/" },
  //   { label: "LinkedIn", url: "https://www.linkedin.com/company/esteemwire/" },
  // While the list is empty, no social links appear anywhere on the site.
  profiles: [] as { label: string; url: string }[],
  // Chrome labels (four corners). Words only; the layout is in components/Frame.tsx.
  chrome: {
    about: "About",
    contact: "Contact",
    views: [
      { label: "Featured", href: "/" },
      { label: "All", href: "/work" },
    ],
  },
  // Services and industries feed the index word cloud so it has enough words.
  services: [
    "Design",
    "Development",
    "E-commerce",
    "Booking systems",
    "Subscriptions",
    "Members areas",
    "Content management",
    "Motion",
  ],
} as const;

export type Site = typeof site;
