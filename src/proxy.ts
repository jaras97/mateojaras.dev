import { getSessionCookie } from "better-auth/cookies";
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from "next/server";
import createMiddleware from "next-intl/middleware";
import { loadPublishedSlugs } from "./features/projects/slug-index";
import { routing } from "./i18n/routing";
import { isPublishedSlug } from "./lib/published-slug-guard";

const handleI18n = createMiddleware(routing);

const PROJECT_PATH = /^\/(en|es)\/projects\/([^/]+)\/?$/;

// One proxy, three jobs. The admin branch only checks that a session cookie
// exists and redirects; that is a UX hint, never authorization. The real check
// is requireSession (02-06), enforced by AuthGate (02-07). /admin never goes
// through next-intl. The third job (D-06): unknown or draft project slugs get a
// real HTTP 404. It lives here because with Cache Components the prerendered
// shell commits a 200 before an in-page notFound() runs (streaming.md, "The
// HTTP contract"). Draft Mode requests skip it so the admin preview keeps working.
export default async function proxy(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname === "/admin/login") return NextResponse.next();
    if (getSessionCookie(req)) return NextResponse.next();
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  const res = handleI18n(req);
  const rewrite = res.headers.get("x-middleware-rewrite");
  if (!rewrite || req.cookies.has("__prerender_bypass")) return res;
  const match = PROJECT_PATH.exec(new URL(rewrite).pathname);
  if (!match) return res;
  let slug: string;
  try {
    slug = decodeURIComponent(match[2]);
  } catch {
    return res;
  }
  const published = await isPublishedSlug(slug, {
    load: loadPublishedSlugs,
    waitUntil: (p) => event.waitUntil(p),
  });
  if (published) return res;
  return NextResponse.rewrite(new URL(`/${match[1]}/__missing`, req.url));
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*/opengraph-image|.*\\..*).*)"],
};
