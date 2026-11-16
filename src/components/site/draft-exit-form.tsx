"use client";

import { usePathname } from "next/navigation";

// POST form, never a Link: a prefetched GET must not clear the cookie.
export function DraftExitForm({ label }: { label: string }) {
  const pathname = usePathname();
  return (
    <form method="post" action="/api/draft">
      <input type="hidden" name="path" value={pathname} />
      <button
        type="submit"
        className="text-sm font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background"
      >
        {label}
      </button>
    </form>
  );
}
