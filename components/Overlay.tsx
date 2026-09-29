"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CloseButton } from "./CloseButton";

/* A centred overlay panel for About and Contact: 42rem wide, 60rem at s:, text
   centred, over the room at 70%. Escape and the backdrop go back. Used by the
   intercepting routes in app/@overlay; the same bodies render as full pages
   when loaded directly. */
export function Overlay({ children, label, background }: { children: React.ReactNode; label: string; background?: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && router.back();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <div role="dialog" aria-modal="true" aria-label={label} className="no-scrollbar fixed inset-0 z-30 overflow-y-auto overscroll-contain">
      <button type="button" aria-label="Close" onClick={() => router.back()} className="fixed inset-0 bg-room/95 backdrop-blur-md" />
      {background && <div aria-hidden="true" className="pointer-events-none fixed inset-0">{background}</div>}
      {/* Phones: the overlay scrolls under the fixed corners, so it fades out there. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[1] h-110 bg-linear-to-b from-room via-room/80 to-transparent s:hidden" />
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 bottom-0 z-[1] h-160 bg-linear-to-t from-room from-45% via-room/90 to-transparent s:hidden" />
      <div className="pointer-events-none relative flex min-h-full items-center justify-center px-30 pb-170 pt-100 s:px-0 s:py-80">
        <div className="reveal pointer-events-auto relative w-full max-w-overlay text-center s:w-overlay-s s:max-w-none s:px-20">{children}</div>
      </div>
      <CloseButton />
    </div>
  );
}
