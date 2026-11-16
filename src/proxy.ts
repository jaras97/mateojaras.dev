import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const handleI18n = createMiddleware(routing);

// One proxy, two jobs. The admin branch only checks that a session cookie
// exists and redirects; that is a UX hint, never authorization. The real check
// is requireSession (02-06), enforced by AuthGate (02-07). /admin never goes
// through next-intl.
export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname === "/admin/login") return NextResponse.next();
    if (getSessionCookie(req)) return NextResponse.next();
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  return handleI18n(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
