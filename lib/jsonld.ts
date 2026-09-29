import { site } from "@/content/site";
import type { Project } from "@/content/projects";

// Structured data (schema.org JSON-LD) so search engines understand the studio and its work.

export const orgId = `${site.url}/#organization`;
export const siteId = `${site.url}/#website`;

export const organization = () => ({
  "@type": "Organization",
  "@id": orgId,
  name: site.name,
  url: `${site.url}/`,
  email: site.email,
  description: site.summary,
  ...(site.profiles.length ? { sameAs: site.profiles.map((p) => p.url) } : {}),
});

export const webSite = () => ({
  "@type": "WebSite",
  "@id": siteId,
  url: `${site.url}/`,
  name: site.name,
  inLanguage: "en",
  publisher: { "@id": orgId },
});

export const creativeWork = (p: Project) => ({
  "@type": "CreativeWork",
  "@id": `${site.url}/work/${p.slug}#work`,
  name: p.title,
  url: `${site.url}/work/${p.slug}`,
  description: p.description,
  genre: p.category,
  keywords: [p.sector, ...p.services].join(", "),
  locationCreated: { "@type": "Place", name: p.location },
  dateCreated: p.year,
  creator: { "@id": orgId },
});

export const graph = (...nodes: object[]) => ({ "@context": "https://schema.org", "@graph": nodes });

/** Serialise for a `<script type="application/ld+json">`. */
export const serialise = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");
