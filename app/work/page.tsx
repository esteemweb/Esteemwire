import type { Metadata } from "next";
import { site } from "@/content/site";
import { projects } from "@/content/projects";
import { IndexCloud, type CloudItem } from "@/components/IndexCloud";

export const metadata: Metadata = {
  title: "All work",
  description: `Every ${site.name} project and service, by name.`,
};

/* The full index: every project plus services, as a word cloud with a
   hover preview. The services make up the numbers so it reads as a cloud. */
export default function WorkIndex() {
  const items: CloudItem[] = [
    ...projects.map((p) => ({ label: p.title, href: `/work/${p.slug}`, preview: p.hero, tone: p.theme.paper })),
    ...site.services.map((s) => ({ label: s, href: `/about#services` })),
  ];
  return (
    <main className="flex min-h-svh flex-col justify-center py-100">
      <h1 className="sr-only">{site.name} — all work</h1>
      <IndexCloud items={items} />
    </main>
  );
}
