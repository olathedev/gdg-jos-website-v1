import { NextResponse, type NextRequest } from "next/server";

// Serves the admin area only at the secret ADMIN_PATH (rewritten to the internal
// route) and hides the internal route itself. Access control still happens in the
// admin pages and Server Functions; this only keeps the address private.
const INTERNAL = "/admin-internal";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secret = process.env.ADMIN_PATH?.trim().replace(/^\/+|\/+$/g, "");

  if (pathname === INTERNAL || pathname.startsWith(`${INTERNAL}/`)) {
    return NextResponse.rewrite(new URL("/__not-found", request.url));
  }

  if (secret && secret.length >= 6 && (pathname === `/${secret}` || pathname.startsWith(`/${secret}/`))) {
    const url = request.nextUrl.clone();
    url.pathname = INTERNAL + pathname.slice(secret.length + 1);
    const res = NextResponse.rewrite(url);
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "no-store");
    res.headers.set("Referrer-Policy", "no-referrer");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  // Every page request (the secret path can't be listed here), but not static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpe?g|webp|avif|gif|svg|ico|mp4|woff2?|ttf|css|js|map|txt|xml)$).*)"],
};
