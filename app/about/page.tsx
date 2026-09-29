import type { Metadata } from "next";
import { AboutBody } from "@/components/AboutBody";
import { ShaderBackground } from "@/components/ui/blue-halftone";
import { CloseButton } from "@/components/CloseButton";

export const metadata: Metadata = { title: "About" };

/* /about loaded directly: the same body as the overlay, as a page. */
export default function About() {
  return (
    <main className="relative flex min-h-svh items-center justify-center px-30 pb-170 pt-100 s:px-80 s:py-100">
      {/* The blue halftone field behind the page (components/ui/blue-halftone). */}
      <ShaderBackground className="pointer-events-none fixed inset-0 -z-10" />
      {/* Phones: the page scrolls under the fixed corners, so it fades out there. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-30 h-110 bg-linear-to-b from-room via-room/80 to-transparent s:hidden" />
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-160 bg-linear-to-t from-room from-45% via-room/90 to-transparent s:hidden" />
      <CloseButton />
      <div className="w-full max-w-overlay s:w-overlay-s s:max-w-none">
        <AboutBody />
      </div>
    </main>
  );
}
