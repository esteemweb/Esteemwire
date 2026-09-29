import { CloseButton } from "./CloseButton";

/* The shared shell for the legal pages (Privacy, Impressum): a readable
   text column on the room's black, the close button back to the home page,
   and the same fades under the fixed corners on phones as the About page.
   Plain prose styling lives in globals.css (.legal). */
export function LegalPage({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-svh justify-center px-30 pb-170 pt-110 s:px-80 s:pb-120 s:pt-120">
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-30 h-110 bg-linear-to-b from-room via-room/80 to-transparent s:hidden" />
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-160 bg-linear-to-t from-room from-45% via-room/90 to-transparent s:hidden" />
      <CloseButton />
      <article className="legal display-face w-full max-w-[62rem]">
        <p className="label opacity-60">{eyebrow}</p>
        <h1 className="mt-15 text-h1 font-light s:text-[5.2rem]">{title}</h1>
        {children}
      </article>
    </main>
  );
}
