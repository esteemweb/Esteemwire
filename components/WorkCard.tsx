"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import type { Project } from "@/content/projects";
import { Flight } from "./VT";
import { Loop } from "./Loop";
import { useGLPlane } from "./gl/GLRoot";

/* A project card: picture only (a still, with the site's
   scroll loop playing over it when there is one), caption at the bottom inset
   10 → 20 with the title left and the category right, a squared scrim so
   the caption reads over anything. Height 43.5svh capped at 55rem on the
   ribbon; width from the CMS aspect ratio. The whole card is the link.

   The article registers as a GL plane: in `gl` mode the scene paints the
   picture on the bent ribbon and moves the caption with it; the DOM keeps
   the layout and the click. */
export function WorkCard({ project, priority = false, index }: { project: Project; priority?: boolean; index: number }) {
  const { hero } = project;
  const ref = useRef<HTMLElement>(null);
  useGLPlane(ref, project.slug, "card", hero.src);
  return (
    <article
      ref={ref}
      className="ribbon-card relative w-full flex-none s:h-[50svh] s:max-h-[64rem] s:w-auto"
      style={{ aspectRatio: `${hero.width} / ${hero.height}` }}
      data-gl="card"
      data-id={project.slug}
      data-index={index}
    >
      <Link
        href={`/work/${project.slug}`}
        className="scrim group relative block h-full w-full overflow-hidden rounded-card s:rounded-card-s"
        draggable={false}
        aria-label={`${project.title}, ${project.category}`}
      >
        <Flight name={`work-${project.slug}`}>
          <Image
            src={hero.src}
            alt={hero.alt}
            width={hero.width}
            height={hero.height}
            priority={priority}
            draggable={false}
            sizes="(min-width: 650px) 45vw, 100vw"
            className="h-full w-full object-cover transition-transform duration-(--duration-state) ease-(--ease-state) has-hover:group-hover:scale-[1.02]"
          />
        </Flight>
        {hero.video && (
          <Loop
            src={hero.video}
            className="transition-transform duration-(--duration-state) ease-(--ease-state) has-hover:group-hover:scale-[1.02]"
          />
        )}
      </Link>
      <span
        data-caption
        className="pointer-events-none absolute inset-x-10 bottom-10 z-10 flex items-end justify-between gap-x-10 s:inset-x-20 s:bottom-20"
      >
        <span className="text-title">{project.title}</span>
        <span className="label opacity-60">{project.category}</span>
      </span>
    </article>
  );
}
