import { projects } from "@/content/projects";
import { aboutMarkdown, contactMarkdown, homeMarkdown, projectMarkdown, workIndexMarkdown } from "@/lib/markdown";

/* Markdown copies of every page, for readers and AI tools. proxy.ts rewrites `/x.md` and
   `Accept: text/markdown` requests here. */
export const dynamic = "force-static";
export const dynamicParams = false;
export const generateStaticParams = () => [
  { path: ["index"] },
  { path: ["work"] },
  { path: ["about"] },
  { path: ["contact"] },
  ...projects.map((p) => ({ path: ["work", p.slug] })),
];

const md = (body: string) => new Response(body, { headers: { "content-type": "text/markdown; charset=utf-8" } });

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const key = path.join("/");
  if (key === "index") return md(homeMarkdown());
  if (key === "work") return md(workIndexMarkdown());
  if (key === "about") return md(aboutMarkdown());
  if (key === "contact") return md(contactMarkdown());
  if (path[0] === "work" && path.length === 2) {
    const body = projectMarkdown(path[1]);
    if (body) return md(body);
  }
  return new Response("Not found", { status: 404 });
}
