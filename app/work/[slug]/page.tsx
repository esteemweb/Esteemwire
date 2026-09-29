import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, bySlug, neighbours } from "@/content/projects";
import { Flight } from "@/components/VT";
import { Loop } from "@/components/Loop";
import { FlowButton, FlowIcon } from "@/components/ui/flow-button";
import { revealAt } from "@/lib/motion";
import { creativeWork, graph, serialise } from "@/lib/jsonld";

export const dynamicParams = false;
export const generateStaticParams = () => projects.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = bySlug((await params).slug);
  if (!p) return {};
  return { title: p.title, description: p.description, openGraph: { images: [p.hero.src] } };
}

const at = (s: number) => ({ "--at": `${s}s` }) as React.CSSProperties;

function Turn({ href, label, side, theme }: { href: string; label: string; side: "left" | "right"; theme: React.CSSProperties }) {
  const right = side === "right";
  return (
    <Link
      href={href}
      aria-label={label}
      style={theme}
      className={`sheet-turn group fixed top-1/2 z-30 hidden -translate-y-1/2 s:block ${right ? "flex-row-reverse s:right-22" : "s:left-22"}`}
    >
      <FlowIcon icon={right ? "right" : "left"} className="sheet-turn-button size-48 s:size-56" />
      {/* The name floats beside the button, outside the link's box, so the
          hidden label never sits over the page's own buttons. */}
      <span
        className={`sheet-turn-name label pointer-events-none absolute top-1/2 hidden s:block ${right ? "right-full mr-12" : "left-full ml-12"}`}
      >
        {label}
      </span>
    </Link>
  );
}

/* The case-study sheet: a fixed inset panel inside the black
   room, painted in the project's own palette (content/projects.ts `theme`):
   its paper, its ink, one accent. Two columns at s: — the text column
   (flexible) and a 70rem gallery that scrolls — one column below. The hero
   carries the same flight name as its card, so the picture flies in. The
   text column starts below the fixed chrome so nothing sits under the
   lockup; the close pill sits below the About link. Prev/next peek at the
   sides. */
export default async function Work({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) notFound();
  const { prev, next } = neighbours(slug);
  const index = projects.findIndex((x) => x.slug === slug);
  const theme = {
    "--sheet-paper": p.theme.paper,
    "--sheet-ink": p.theme.ink,
    "--sheet-accent": p.theme.accent,
    "--sheet-on-accent": p.theme.onAccent,
  } as React.CSSProperties;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialise(graph(creativeWork(p))) }} />
      <main
        style={theme}
        className="sheet fixed inset-x-20 inset-y-15 z-20 overflow-hidden rounded-card s:inset-x-50 s:inset-y-20 s:rounded-card-s"
        data-gl="sheet"
        data-id={p.slug}
      >
        <div className="no-scrollbar flex h-full flex-col gap-y-40 overflow-y-auto px-10 s:flex-row s:items-stretch s:gap-x-80 s:overflow-hidden s:pl-50 s:pr-120 s:pb-45 s:pt-90">
          {/* ── Text column */}
          <div className="display-face no-scrollbar flex min-w-0 flex-col items-start px-15 pt-85 s:h-full s:flex-1 s:overflow-y-auto s:px-0 s:pt-0 s:pb-30">
            <p className="label reveal flex items-center gap-x-12 text-(--sheet-accent)" style={at(revealAt.title)}>
              <span className="tabular-nums">
                {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
              </span>
              <span aria-hidden="true" className="h-px w-20 bg-current opacity-60" />
              <span>{p.category}</span>
            </p>
            <h1 className="reveal display-face mt-20 text-h1 font-light s:mt-25 s:text-hero" style={at(revealAt.title + 0.05)}>
              {p.title}
            </h1>
            <p className="reveal mt-25 max-w-lead text-copy s:mt-35 s:text-lead" style={at(revealAt.text)}>
              {p.description}
            </p>
            {/* Visit site sits right under the description, so it is on the
                first screen on every device without scrolling. */}
            <div className="reveal mt-25 flex w-full s:mt-35" style={at(revealAt.text + 0.05)}>
              <FlowButton text="Visit site" href={p.demoUrl} external className="sheet-cta" />
            </div>

            <section className="reveal mt-45 w-full s:mt-60" style={at(revealAt.text + 0.1)} aria-labelledby="built">
              <h2 id="built" className="label sheet-muted">
                What we delivered
              </h2>
              <ol className="mt-12 grid gap-x-40 s:grid-cols-2">
                {p.built.map((b, i) => (
                  <li key={b} className="sheet-rule flex items-baseline gap-x-14 py-12 text-body">
                    <span className="label sheet-muted tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ol>
            </section>

            <dl className="reveal sheet-rule mt-30 grid w-full grid-cols-[9rem_1fr] gap-y-8 pt-15 text-body s:mt-40" style={at(revealAt.pills)}>
              <dt className="label sheet-muted">Client</dt>
              <dd>{p.client}</dd>
              <dt className="label sheet-muted">Location</dt>
              <dd>{p.location}</dd>
              <dt className="label sheet-muted">Sector</dt>
              <dd>{p.sector}</dd>
              <dt className="label sheet-muted">Services</dt>
              <dd>{p.services.join(" · ")}</dd>
              <dt className="label sheet-muted">Year</dt>
              <dd className="tabular-nums">{p.year}</dd>
              {p.badge && (
                <>
                  <dt className="label sheet-muted">Award</dt>
                  <dd className="text-(--sheet-accent)">● {p.badge}</dd>
                </>
              )}
            </dl>

            <div className="pb-30 s:pb-0" aria-hidden="true" />
          </div>

          {/* ── Gallery column */}
          <div className="display-face no-scrollbar flex w-full flex-col gap-y-30 pb-90 s:h-full s:w-gallery s:shrink-0 s:gap-y-40 s:overflow-y-auto s:pb-20">
            <div className="reveal sheet-frame relative w-full flex-none overflow-hidden rounded-card s:rounded-card-s" style={at(revealAt.stack)} data-gl="hero" data-id={p.slug}>
              <Flight name={`work-${p.slug}`}>
                <Image src={p.hero.src} alt={p.hero.alt} width={p.hero.width} height={p.hero.height} priority sizes="(min-width: 650px) 70rem, 100vw" className="h-auto w-full" />
              </Flight>
              {p.hero.video && <Loop src={p.hero.video} />}
            </div>
            {p.gallery.map((m, i) => (
              <figure key={m.src} className="reveal w-full flex-none" style={at(revealAt.stack + 0.1 * (i + 1))}>
                <div className="sheet-frame relative overflow-hidden rounded-card s:rounded-card-s">
                  <Image src={m.src} alt={m.alt} width={m.width} height={m.height} sizes="(min-width: 650px) 70rem, 100vw" className="h-auto w-full" />
                  {m.video && <Loop src={m.video} />}
                </div>
                <figcaption className="label sheet-muted mt-10 flex justify-between tabular-nums">
                  <span>{m.alt}</span>
                  <span>
                    {String(i + 2).padStart(2, "0")} / {String(p.gallery.length + 1).padStart(2, "0")}
                  </span>
                </figcaption>
              </figure>
            ))}
            {/* Phones: the page turns sit at the end of the sheet instead of floating over it. */}
            <nav aria-label="Neighbouring projects" className="sheet-rule flex items-center justify-between gap-x-20 pt-25 s:hidden">
              <Link href={`/work/${prev.slug}`} className="group flex items-center gap-x-12">
                <FlowIcon icon="left" className="sheet-turn-button size-48" />
                <span className="label">
                  <span className="sheet-muted block">Previous</span>
                  {prev.title}
                </span>
              </Link>
              <Link href={`/work/${next.slug}`} className="group flex flex-row-reverse items-center gap-x-12 text-right">
                <FlowIcon icon="right" className="sheet-turn-button size-48" />
                <span className="label">
                  <span className="sheet-muted block">Next</span>
                  {next.title}
                </span>
              </Link>
            </nav>
          </div>
        </div>

        <Link href="/" aria-label="Close project" className="group absolute right-15 top-60 z-10 s:right-30">
          <FlowIcon icon="close" className="sheet-close size-40 s:size-45" />
        </Link>
      </main>

      {/* Page turns: next at the right middle, previous at the left, on the
          sheet's edge, in the project's accent. The name shows on hover. */}
      <Turn href={`/work/${next.slug}`} label={`Next: ${next.title}`} side="right" theme={theme} />
      <Turn href={`/work/${prev.slug}`} label={`Previous: ${prev.title}`} side="left" theme={theme} />
    </>
  );
}
