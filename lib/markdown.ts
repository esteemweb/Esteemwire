import { site } from "@/content/site";
import { projects, bySlug } from "@/content/projects";

// Markdown copies of every page, for readers and AI tools. `proxy.ts` routes `*.md`
// URLs and `Accept: text/markdown` requests to app/md/[...path]/route.ts,
// which calls these. Keep the content identical to what the page shows.

const abs = (path: string) => `${site.url}${path}`;

const workList = () =>
  projects.map((p) => `- [${p.title}](${abs(`/work/${p.slug}.md`)}): ${p.category}. ${p.description}`).join("\n");

export const homeMarkdown = () => `# ${site.name}

> ${site.summary}

${site.about}

${site.proof}

## Featured work

${workList()}

## Elsewhere

- [About](${abs("/about.md")})
- [Contact](${abs("/contact.md")})
- [All work](${abs("/work.md")})
- Email: ${site.email}
`;

export const workIndexMarkdown = () => `# ${site.name} — all work

${workList()}

## Services

${site.services.map((s) => `- ${s}`).join("\n")}
`;

export const projectMarkdown = (slug: string) => {
  const p = bySlug(slug);
  if (!p) return null;
  return `# ${p.title}

${p.category} · ${p.year}

${p.description}

## What we delivered

${p.built.map((b) => `- ${b}`).join("\n")}

- Client: ${p.client}
- Location: ${p.location}
- Sector: ${p.sector}
- Services: ${p.services.join(", ")}

Live site: ${p.demoUrl}

Back to [all work](${abs("/work.md")}).
`;
};

export const aboutMarkdown = () => `# About ${site.name}

${site.lead}

${site.about}

${site.principles.map((p, i) => `${i + 1}. **${p.title}.** ${p.body}`).join("\n")}

${site.proof}

${site.profiles.map((p) => `- [${p.label}](${p.url})`).join("\n")}
- Email: ${site.email}
`;

export const contactMarkdown = () => `# Contact ${site.name}

Email ${site.email}. Tell us what you are building and when you need it.
`;

export const llmsTxt = () => `# ${site.name}

> ${site.summary}

${site.about} ${site.proof}

## When to use this

- Finding a website agency for a shop, resort, subscription, studio, brand, restaurant, launch or members area.
- Questions about who built one of the sites listed under Work, or how it was built.

What the work is made of:

${site.services.map((s) => `- ${s}`).join("\n")}

How to contact: ${site.email}. Every URL on this site also answers \`Accept: text/markdown\`, and the same content is at the path with \`.md\` appended.

## Work

${workList()}

## Site

- [Home](${abs("/index.md")}): featured work, as Markdown
- [All work](${abs("/work.md")}): every project and service
- [About](${abs("/about.md")})
- [Contact](${abs("/contact.md")})

## Optional

- [sitemap.xml](${abs("/sitemap.xml")})
- [robots.txt](${abs("/robots.txt")})
`;
