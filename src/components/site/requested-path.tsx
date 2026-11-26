"use client";

import { usePathname } from "next/navigation";

function decode(path: string): string {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

// The requested path comes from the visitor, so it is only ever a text child.
export function RequestedPath() {
  const pathname = usePathname();
  return (
    <code className="font-mono text-sm text-muted-foreground break-all">
      {decode(pathname ?? "")}
    </code>
  );
}
