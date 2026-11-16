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

// Only a single-slash relative path may be redirected to (no open redirect).
export function safeReturnPath(value: unknown): string {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/")) return "/";
  if (value.startsWith("//") || value.startsWith("/\\")) return "/";
  return value;
}
