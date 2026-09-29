import { site } from "@/content/site";
import { featured } from "@/content/projects";
import { Ribbon } from "@/components/Ribbon";
import { HomePaths } from "@/components/HomePaths";
import { graph, organization, webSite, creativeWork, serialise } from "@/lib/jsonld";

/* Home: the name, one line, and nine pictures on the ribbon. The readable
   block is real markup, pinned as a top-centre label at every size so the
   pictures stay the hero; the summary is for readers and search. */
export default function Home() {
  const ld = graph(organization(), webSite(), ...featured.map(creativeWork));
  return (
    <main className="relative h-svh overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialise(ld) }} />
      <header className="label pointer-events-none fixed inset-x-0 top-65 z-30 px-40 text-center opacity-60 s:top-40 s:px-0">
        <h1>
          <span className="sr-only">{site.name} — </span>
          {site.tagline}
        </h1>
        <p className="sr-only">{site.summary}</p>
      </header>
      <div className="home-paths-dom">
        <HomePaths />
      </div>
      <Ribbon projects={featured} />
    </main>
  );
}
