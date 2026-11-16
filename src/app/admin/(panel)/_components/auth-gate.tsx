import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/dal";
import { signOutAction } from "../actions";

// Real authorization point for the admin shell: the proxy only checks that a
// cookie exists, this validates it against the session table.
export async function AuthGate({ children }: { children: ReactNode }) {
  const session = await requireSession();
  const t = await getTranslations({ locale: "es", namespace: "Admin.shell" });
  const exportSkipped =
    Boolean(process.env.VERCEL) && !process.env.BLOB_READ_WRITE_TOKEN;
  return (
    <>
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <p className="font-mono text-sm text-muted-foreground">
          {session.name}
        </p>
        <form action={signOutAction}>
          <Button type="submit" variant="outline" size="sm">
            {t("signOut")}
          </Button>
        </form>
      </header>
      {exportSkipped ? (
        <output className="block border-b border-border bg-muted px-6 py-2 text-sm">
          {t("exportSkipped")}
        </output>
      ) : null}
      {children}
    </>
  );
}
