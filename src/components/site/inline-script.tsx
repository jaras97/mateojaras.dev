// Inline script without React's "script tag inside a component" warning: the
// server emits a real script, the client renders an inert type so hydration
// does not try to re-execute it.
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      suppressHydrationWarning
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: static string, no interpolation
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
