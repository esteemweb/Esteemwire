import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { projects } from "@/content/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${site.url}/`, lastModified: now, priority: 1 },
    { url: `${site.url}/work`, lastModified: now, priority: 0.6 },
    { url: `${site.url}/about`, lastModified: now, priority: 0.5 },
    { url: `${site.url}/contact`, lastModified: now, priority: 0.4 },
    // PRE-LAUNCH: add these back at launch (see CLAUDE.md).
    // { url: `${site.url}/privacy`, lastModified: now, priority: 0.1 },
    // { url: `${site.url}/impressum`, lastModified: now, priority: 0.1 },
    ...projects.map((p) => ({ url: `${site.url}/work/${p.slug}`, lastModified: now, priority: 0.8 })),
  ];
}
