import { NextResponse, type NextRequest } from "next/server";

/* Every page also answers as Markdown, for readers and AI tools: `/work/x.md` and
   any request whose Accept header prefers text/markdown are rewritten to
   the route handler in app/md/[...path]. Assets and Next internals pass. */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const url = req.nextUrl.clone();
  if (pathname.endsWith(".md")) {
    const bare = pathname.slice(0, -3).replace(/^\/+/, "");
    url.pathname = `/md/${bare || "index"}`;
    return NextResponse.rewrite(url);
  }
  const accept = req.headers.get("accept") ?? "";
  if (accept.includes("text/markdown") && !accept.includes("text/html")) {
    url.pathname = `/md/${pathname.replace(/^\/+|\/+$/g, "") || "index"}`;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|md|llms\.txt|sitemap\.xml|robots\.txt|favicon\.ico|icon\.svg).*)"],
};
