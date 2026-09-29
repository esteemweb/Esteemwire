import { site } from "@/content/site";
import { AboutSeal } from "./AboutSeal";
import { Mark3D } from "./Mark3D";

/* The About body: mark, position, paragraph, three principles, the proof
   line, links, then services. Rendered centred inside the overlay and
   left-aligned as a page. */
export function AboutBody({ centred = true }: { centred?: boolean }) {
  const align = centred ? "items-center text-center" : "items-start";
  return (
    <div className={`display-face flex flex-col ${align}`}>
      <h1 className="sr-only">About {site.name}</h1>
      <Mark3D id="about-mark" className="mb-30 h-60 s:mb-35 s:h-75" tilt={16} />
      <AboutSeal>
      <p className="label about-in opacity-60" style={{ "--d": "0.1s" } as React.CSSProperties}>
        About the studio
      </p>
      <p className="mt-15 max-w-[52rem] text-h2 font-light leading-[1.1] tracking-[-0.03em] s:mt-20 s:text-[3.8rem]">
        {site.lead.split(" ").map((w, i) => (
          <span key={i} className="about-word inline-block overflow-hidden pb-[0.08em] align-bottom">
            <span className="inline-block" style={{ "--d": `${0.2 + i * 0.06}s` } as React.CSSProperties}>
              {w}&nbsp;
            </span>
          </span>
        ))}
      </p>
      <p className="about-in mt-20 max-w-[52rem] text-copy leading-[1.5] opacity-80 s:mt-25" style={{ "--d": "0.75s" } as React.CSSProperties}>
        {site.about}
      </p>
      </AboutSeal>

      <ol className={`mt-40 grid w-full max-w-[64rem] gap-y-25 text-left s:mt-50 s:grid-cols-3 s:gap-x-30`}>
        {site.principles.map((p, i) => (
          <li key={p.title} className="about-principle relative pt-15" style={{ "--d": `${1 + i * 0.15}s` } as React.CSSProperties}>
            <span className="label tabular-nums opacity-50">{String(i + 1).padStart(2, "0")}</span>
            <h2 className="mt-8 text-copy font-medium">{p.title}</h2>
            <p className="mt-6 text-body leading-[1.5] opacity-70">{p.body}</p>
          </li>
        ))}
      </ol>

      <ul className={`label mt-40 s:mt-50 flex list-none flex-wrap gap-x-20 gap-y-8 ${centred ? "justify-center" : ""}`}>
        {site.profiles.map((p) => (
          <li key={p.url}>
            <a href={p.url} target="_blank" rel="noopener" className="hit transition-opacity duration-(--duration-state) has-hover:hover:opacity-60">
              {p.label}
            </a>
          </li>
        ))}
        <li>
          <a href={`mailto:${site.email}`} className="hit transition-opacity duration-(--duration-state) has-hover:hover:opacity-60">
            Email
          </a>
        </li>
      </ul>
      <section id="services" className={`mt-40 s:mt-50 ${centred ? "" : "w-full"}`}>
        <h2 className="label opacity-60">Services</h2>
        <ul className={`mt-15 flex flex-wrap gap-x-20 gap-y-8 text-body ${centred ? "justify-center" : ""}`}>
          {site.services.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
