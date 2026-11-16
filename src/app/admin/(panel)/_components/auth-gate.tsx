import type { ReactNode } from "react";
import { requireSession } from "@/lib/dal";

// Real authorization point for the admin shell: the proxy only checks that a
// cookie exists, this validates it against the session table.
export async function AuthGate({ children }: { children: ReactNode }) {
  const session = await requireSession();
  return (
    <>
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <p className="font-mono text-sm text-muted-foreground">
          {session.name}
        </p>
      </header>
      {children}
    </>
  );
}
