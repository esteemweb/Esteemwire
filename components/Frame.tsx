"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";
import { WORDMARK } from "@/content/mark";
import { Mark } from "./Mark";
import { Mark3D } from "./Mark3D";
import { FlowLink } from "./ui/flow-button";

/* The four-corner chrome: the labels fixed at the corners of every page. Fixed, full-viewport, pointer
   events off except on the labels. Insets 40/25 on mobile, 80/40 at s:.
   Top-left: wordmark. Top-right: About. Bottom-left: the view switch.
   Bottom-right: Contact. Nothing else. The frame blends with `difference` so
   its white ink stays white on the room and turns dark over the paper sheet.

   The wordmark is mark + name. The mark keeps its own colours (and its
   depth, components/Mark3D.tsx), so it lives in a second, unblended layer
   with the same insets; each layer renders the other's half invisibly so
   the two halves always line up. */

/** PRE-LAUNCH: false until the legal pages are filled in (see CLAUDE.md). */
const SHOW_LEGAL_LINKS = false;

const corner = "label pointer-events-none fixed inset-0 z-40 flex flex-col justify-between px-40 py-25 s:px-80 s:py-40";
const lockup = "hit pointer-events-auto flex items-center gap-x-10";

function Lockup({ show }: { show: "mark" | "name" }) {
  return (
    <Link href="/" className={lockup} aria-label={show === "mark" ? undefined : site.name} aria-hidden={show === "mark" ? true : undefined} tabIndex={show === "mark" ? -1 : undefined}>
      {show === "mark" ? <Mark3D id="frame-mark" className="h-[2.2rem]" /> : <Mark id="frame-name" className="invisible h-[2.2rem] w-auto" />}
      <span className={`wordmark ${show === "name" ? "" : "invisible"}`}>{WORDMARK}</span>
    </Link>
  );
}
export function Frame() {
  const pathname = usePathname();
  const isView = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <div className={corner} aria-hidden="true">
        <div className="flex items-start justify-between">
          <Lockup show="mark" />
        </div>
      </div>
    <div className={`${corner} mix-blend-difference`}>
      <div className="flex items-start justify-between">
        <Lockup show="name" />
        <FlowLink href="/about" className="pointer-events-auto">
          {site.chrome.about}
        </FlowLink>
      </div>
      <div className="flex items-end justify-between">
        <nav aria-label="Work views" className="pointer-events-auto flex items-center gap-x-5">
          {site.chrome.views.map((v, i) => (
            <span key={v.href} className="contents">
              {i > 0 && (
                <span aria-hidden="true" className="relative z-[1] opacity-50">
                  /
                </span>
              )}
              <FlowLink href={v.href} current={isView(v.href)} dim={!isView(v.href)}>
                {v.label}
              </FlowLink>
            </span>
          ))}
        </nav>
        <div className="flex flex-col items-end gap-y-12">
          {/* PRE-LAUNCH: the legal links are switched off until content/legal.ts is
              filled in. At launch set SHOW_LEGAL_LINKS to true (see CLAUDE.md): they
              must then be on every page, one click away (German Impressum rules). */}
          {SHOW_LEGAL_LINKS && (
            <nav aria-label="Legal" className="legal-links pointer-events-auto flex items-center gap-x-5">
              <Link href="/privacy" className="hit transition-opacity duration-(--duration-state) has-hover:hover:opacity-100">
                Privacy
              </Link>
              <span aria-hidden="true">·</span>
              <Link href="/impressum" className="hit transition-opacity duration-(--duration-state) has-hover:hover:opacity-100">
                Impressum
              </Link>
            </nav>
          )}
          <FlowLink href="/contact" className="pointer-events-auto">
            {site.chrome.contact}
          </FlowLink>
        </div>
      </div>
    </div>
    </>
  );
}
