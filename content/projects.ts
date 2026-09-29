// The nine sites. Every asset carries width/height so aspect ratios are
// known before load, so nothing jumps. Artwork is a capture of each site in
// `public/work/<slug>/`, rendered at a 1440px viewport and scaled to the
// declared size by `npm run capture`; the card loops come from `npm run clips`.
//
// Order is editorial: it is the order on the ribbon.

export type Media = {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Optional poster-backed video; the poster is `src`. */
  video?: string;
};

export type Project = {
  slug: string;
  title: string;
  /** Short category shown in the card caption and the ribbon eyebrow. */
  category: string;
  /** One paragraph. The case study has no other prose. */
  description: string;
  /** What we delivered: 3–5 short items. */
  built: string[];
  /** The case-study meta table. */
  client: string;
  location: string;
  sector: string;
  services: string[];
  year: string;
  /** The live site (Vercel, team esteemwire-9418; custom domains except Uroko and Le Comble). */
  demoUrl: string;
  /** A single reserved use of the accent colour, or null. */
  badge: string | null;
  /** The site's own palette: the case-study sheet is painted in it (paper,
      ink, one accent and the ink that sits on the accent); the index cloud
      previews use the paper. */
  theme: { paper: string; ink: string; accent: string; onAccent: string };
  hero: Media;
  gallery: Media[];
};

const shot = (slug: string, name: string, w: number, h: number, alt: string): Media => ({
  src: `/work/${slug}/${name}.jpg`,
  width: w,
  height: h,
  alt,
});

/** A hero: the 16:9 still plus its animated loop (see scripts/clips.mjs). */
const clip = (slug: string, w: number, h: number, alt: string): Media => ({
  ...shot(slug, "hero", w, h, alt),
  video: `/work/${slug}/hero.mp4`,
});

export const projects: Project[] = [
  {
    slug: "loud-laundry",
    title: "Loud Laundry",
    category: "Clothing store",
    description:
      "PULP prints small runs of loud colour in Portugal. We built the shop to feel like the label's own room rather than a marketplace template: a grid-paper world, product pages that lead with the print, and a basket and checkout that stay out of the way.",
    built: ["Storefront with collection and product pages", "Basket, checkout and order confirmation", "Size guide, label story and policies", "Content model for new drops"],
    client: "PULP",
    location: "Porto, Portugal",
    sector: "Streetwear retail",
    services: ["Art direction", "E-commerce build", "Content system"],
    year: "2026",
    demoUrl: "https://www.pulpp.shop/",
    badge: null,
    theme: { paper: "#bfdc3f", ink: "#111111", accent: "#2b1fd9", onAccent: "#ffffff" },
    hero: clip("loud-laundry", 2048, 1152, "Loud Laundry storefront"),
    gallery: [
      shot("loud-laundry", "g1", 1600, 1000, "Product grid"),
      shot("loud-laundry", "g2", 1600, 1200, "Product page"),
      shot("loud-laundry", "g3", 1600, 900, "The label"),
    ],
  },
  {
    slug: "talay-dao",
    title: "Talay Dao",
    category: "Resort",
    description:
      "A resort on the water in Phang Nga Bay. The site is built around the property itself, the villas, the shoreline and the light, with a room or a table one step away from every page.",
    built: ["Home with the ring of the day's views", "Villas and rates", "Gallery", "Room and table enquiry flows"],
    client: "Talay Dao",
    location: "Phang Nga Bay, Thailand",
    sector: "Hospitality",
    services: ["Brand site", "Booking flow", "Photography direction"],
    year: "2026",
    demoUrl: "https://www.talaydao.space/",
    badge: null,
    theme: { paper: "#1f4f55", ink: "#f1e6d6", accent: "#e0664a", onAccent: "#13171a" },
    hero: clip("talay-dao", 2048, 1152, "Talay Dao resort"),
    gallery: [shot("talay-dao", "g1", 1600, 1000, "Villas"), shot("talay-dao", "g2", 1600, 2000, "Gallery")],
  },
  {
    slug: "leaf-and-cherry",
    title: "Leaf & Cherry",
    category: "Café subscription",
    description:
      "A neighbourhood café that roasts Sri Lankan coffee to order. Members choose a lot, a grind and a rhythm, and the account page lets them change any of it before the next roast without sending an email.",
    built: ["Subscription plans and pricing", "Checkout and shipment scheduling", "Member account with plan changes", "Transactional email flows"],
    client: "Leaf & Cherry",
    location: "Colombo, Sri Lanka",
    sector: "Coffee subscription",
    services: ["Brand site", "Subscription commerce", "Account area"],
    year: "2026",
    demoUrl: "https://www.leafandcherry.site/",
    badge: null,
    theme: { paper: "#2b1a10", ink: "#fbf6ee", accent: "#d6a23e", onAccent: "#2b1a10" },
    hero: clip("leaf-and-cherry", 2048, 1152, "Leaf & Cherry subscription"),
    gallery: [shot("leaf-and-cherry", "g1", 1600, 1000, "Plans"), shot("leaf-and-cherry", "g2", 1600, 1100, "Account")],
  },
  {
    slug: "overprint",
    title: "Overprint",
    category: "Design studio",
    description:
      "A graphic design studio that prints loud. A one-page site where the work leads: a long scroll of selected projects, the four-plate process, the studio and a way to start a project, with the CMYK misregistration carried through the type.",
    built: ["Single-page site with pinned chapters", "Selected work index", "Process section", "Contact"],
    client: "Overprint",
    location: "Manchester, UK",
    sector: "Design studio",
    services: ["Brand site", "Motion", "Development"],
    year: "2026",
    demoUrl: "https://www.overprint.uno/",
    badge: null,
    theme: { paper: "#ffd8e2", ink: "#6e0f26", accent: "#ff2d55", onAccent: "#ffffff" },
    hero: clip("overprint", 2048, 1152, "Overprint studio"),
    gallery: [shot("overprint", "g1", 1600, 1000, "Work"), shot("overprint", "g2", 1600, 1000, "Process")],
  },
  {
    slug: "corneum",
    title: "Corneum",
    category: "Scalp-care brand",
    description:
      "A skincare brand for the scalp. The science is laid out plainly, the range is small and easy to choose from, and a refillable vessel sits at the centre of the offer.",
    built: ["Range and product pages with technical sheets", "Science, conditions and how-it-works pages", "Bag and checkout", "Living style guide"],
    client: "Corneum",
    location: "Boston, USA",
    sector: "Clinical scalp care",
    services: ["Brand site", "E-commerce", "Design system"],
    year: "2026",
    demoUrl: "https://www.corneum.sbs/",
    badge: null,
    theme: { paper: "#ffffff", ink: "#0a0a0a", accent: "#176a58", onAccent: "#ffffff" },
    hero: clip("corneum", 2048, 1152, "Corneum range"),
    gallery: [shot("corneum", "g1", 1600, 1000, "Range"), shot("corneum", "g2", 1600, 1000, "Science"), shot("corneum", "g3", 1600, 1000, "Product page")],
  },
  {
    slug: "le-comble",
    title: "Le Comble",
    category: "Restaurant with rooms",
    description:
      "A restaurant with nineteen rooms above it, in a former silk workshop on the Croix-Rousse. The site carries the menu, the rooftop, the building's story and same-evening table reservations, in French and English.",
    built: ["Bilingual site (FR/EN) with localised routes", "Menu, rooms and the roof", "Table reservation with live slots", "Content management"],
    client: "Le Comble",
    location: "Lyon, France",
    sector: "Restaurant with rooms",
    services: ["Bilingual site", "Reservations", "Content management"],
    year: "2026",
    demoUrl: "https://le-comble.vercel.app/fr",
    badge: null,
    theme: { paper: "#2b3ab5", ink: "#f4f1ea", accent: "#dba63c", onAccent: "#1b246e" },
    hero: clip("le-comble", 2048, 1152, "Le Comble"),
    gallery: [shot("le-comble", "g1", 1600, 1000, "Restaurant"), shot("le-comble", "g2", 1600, 1000, "Rooms")],
  },
  {
    slug: "ask-for-the-moon",
    title: "Ask for the Moon",
    category: "Book launch",
    description:
      "A launch site for one novel. Readers can open the first chapter, meet the author and buy the book in the format they want, with a loader and a split page that set the mood before a word is read.",
    built: ["Reading experience for chapter one", "Author section", "Format chooser and retailer links", "Loader and page motion"],
    client: "Bramber Press",
    location: "London, UK",
    sector: "Publishing",
    services: ["Launch site", "Editorial design", "Motion"],
    year: "2026",
    demoUrl: "https://www.askforthemoon.store/",
    badge: null,
    theme: { paper: "#c9c7bf", ink: "#12131a", accent: "#c8452d", onAccent: "#f2f0ea" },
    hero: clip("ask-for-the-moon", 2048, 1152, "Ask for the Moon"),
    gallery: [shot("ask-for-the-moon", "g1", 1600, 1000, "Read"), shot("ask-for-the-moon", "g2", 1600, 900, "Buy")],
  },
  {
    slug: "traag",
    title: "TRAAG",
    category: "Artist site",
    description:
      "A site for a DJ: music, dates, video and booking, plus a members list that opens presales forty-eight hours early and signs its own sessions, so there is no password to remember.",
    built: ["Music, dates and video pages", "Showreel and platform links", "Booking form", "Members list with signed magic links"],
    client: "TRAAG",
    location: "Brussels, Belgium",
    sector: "Music",
    services: ["Artist site", "Members area", "Showreel"],
    year: "2026",
    demoUrl: "https://www.traag.fun/",
    badge: null,
    theme: { paper: "#0b0b0b", ink: "#f3efe9", accent: "#ff4a00", onAccent: "#0b0b0b" },
    hero: clip("traag", 2048, 1152, "TRAAG"),
    gallery: [shot("traag", "g1", 1600, 1000, "Music"), shot("traag", "g2", 1600, 1000, "Dates"), shot("traag", "g3", 1600, 1000, "List")],
  },
  {
    slug: "uroko",
    title: "Uroko",
    category: "Tattoo studio",
    description:
      "A traditional tattoo studio in Motomachi. A library of twenty-four motifs with their meanings, three resident artists, a three-step consultation booking and a tracker for pieces that take several sessions.",
    built: ["Motif library with filters and shared links", "Artists and studio pages", "Three-step consultation booking", "Piece tracker and aftercare guides"],
    client: "Uroko",
    location: "Yokohama, Japan",
    sector: "Tattoo studio",
    services: ["Brand site", "Booking", "Motif library"],
    year: "2026",
    demoUrl: "https://uroko-kohl.vercel.app/",
    badge: null,
    theme: { paper: "#1e3553", ink: "#eceff0", accent: "#ec6a4a", onAccent: "#0f0f12" },
    hero: clip("uroko", 2048, 1152, "Uroko studio"),
    gallery: [
      // The showreel: the koi plate brought to life (`npm run clips -- --reel uroko`).
      { src: "/work/uroko/showreel.jpg", width: 960, height: 960, alt: "Showreel: the koi motif swimming upstream", video: "/work/uroko/showreel.mp4" },
      shot("uroko", "g1", 1600, 1000, "Motif library"),
      shot("uroko", "g2", 1600, 1000, "Motif page"),
      shot("uroko", "g3", 1600, 1000, "Booking"),
    ],
  },
];

export const featured = projects; // all nine are featured; keep the seam for later

export const bySlug = (slug: string) => projects.find((p) => p.slug === slug);

export const neighbours = (slug: string) => {
  const i = projects.findIndex((p) => p.slug === slug);
  const n = projects.length;
  return { prev: projects[(i - 1 + n) % n], next: projects[(i + 1) % n] };
};
