// Admin preview link and the exit return path. Pure, shared by the admin UI
// and /api/draft.

export function draftPreviewHref({
  kind,
  id,
  locale = "es",
}: {
  kind: "project" | "home";
  id?: string;
  locale?: "en" | "es";
}): string {
  const params = new URLSearchParams({ kind });
  if (id) params.set("id", id);
  params.set("locale", locale);
  return `/api/draft?${params.toString()}`;
}

const UNSAFE_CHARS = /[\\\s]/;

// Control characters (C0 and DEL), backslash and whitespace are never valid.
function isUnsafe(value: string): boolean {
  if (UNSAFE_CHARS.test(value)) return true;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}
// Public routes the exit form can come from: /, /es, /projects/<slug>,
// /es/proyectos/<slug>.
const PUBLIC_ROUTE = /^\/(?:es)?$|^\/projects\/[^/]+$|^\/es\/proyectos\/[^/]+$/;

// The exit path must be a same-origin path to a known public route (no open
// redirect). Anything else goes to "/".
export function safeReturnPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/")) return "/";
  if (isUnsafe(value)) return "/";
  let url: URL;
  try {
    url = new URL(value, "http://x");
  } catch {
    return "/";
  }
  if (url.origin !== "http://x") return "/";
  let decoded: string;
  try {
    decoded = decodeURIComponent(url.pathname);
  } catch {
    return "/";
  }
  if (isUnsafe(decoded) || decoded.startsWith("//")) return "/";
  if (!PUBLIC_ROUTE.test(url.pathname)) return "/";
  return url.pathname + url.search;
}
