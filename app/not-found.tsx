import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-y-20 px-40 text-center">
      <h1 className="text-h1 s:text-display">Nothing here.</h1>
      <Link href="/" className="label hit opacity-60 transition-opacity duration-(--duration-state) has-hover:hover:opacity-100">
        Back to the work
      </Link>
    </main>
  );
}
