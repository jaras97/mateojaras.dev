export function draftPreviewHref(_input: {
  kind: "project" | "home";
  id?: string;
  locale?: "en" | "es";
}): string {
  return "";
}

export function safeReturnPath(value: unknown): string {
  return String(value);
}
