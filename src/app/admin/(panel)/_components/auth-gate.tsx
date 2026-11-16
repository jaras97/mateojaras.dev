import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { AdminLink } from "@/components/admin/admin-link";
import { AdminNav, type AdminNavLabels } from "@/components/admin/admin-nav";
import { MobileMenu } from "@/components/admin/mobile-menu";
import { NavigationBlockerProvider } from "@/components/admin/navigation-blocker";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { countUnreadMessages } from "@/features/admin/panel-queries";
import { requireSession } from "@/lib/dal";
import { signOutAction } from "../actions";

// Real authorization point for the admin shell: the proxy only checks that a
// cookie exists, this validates it against the session table.
export async function AuthGate({ children }: { children: ReactNode }) {
  const session = await requireSession();
  const [t, nav, confirm] = await Promise.all([
    getTranslations({ locale: "es", namespace: "Admin.shell" }),
    getTranslations({ locale: "es", namespace: "Admin.nav" }),
    getTranslations({ locale: "es", namespace: "Admin.confirm.unsaved" }),
  ]);
  const unreadCount = await countUnreadMessages().catch(() => 0);
  const exportSkipped =
    Boolean(process.env.VERCEL) && !process.env.BLOB_READ_WRITE_TOKEN;

  const navLabels: AdminNavLabels = {
    label: nav("label"),
    entries: {
      settings: nav("settings"),
      projects: nav("projects"),
      experience: nav("experience"),
      skills: nav("skills"),
      education: nav("education"),
      cv: nav("cv"),
      messages: nav("messages"),
    },
    unread: nav("unread", { n: unreadCount }),
  };

  const identity = (
    <div className="flex flex-col gap-3 border-t border-border p-4">
      <p
        className="truncate font-mono text-xs text-muted-foreground"
        title={session.name}
      >
        {session.name}
      </p>
      <form action={signOutAction}>
        <Button type="submit" variant="outline" size="sm" className="w-full">
          {t("signOut")}
        </Button>
      </form>
    </div>
  );

  return (
    <NavigationBlockerProvider
      labels={{
        title: confirm("title"),
        body: confirm("body"),
        stay: confirm("stay"),
        leave: confirm("leave"),
      }}
    >
      <TooltipProvider>
        <div className="flex flex-1 flex-col lg:flex-row">
          <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-muted lg:flex">
            <div className="flex h-16 items-center px-4">
              <AdminLink
                href="/admin"
                className="font-heading text-base font-semibold"
              >
                mateojaras.dev
              </AdminLink>
            </div>
            <div className="flex-1 overflow-y-auto">
              <AdminNav unreadCount={unreadCount} labels={navLabels} />
            </div>
            {identity}
          </aside>
          <header className="flex h-16 items-center justify-between border-b border-border px-4 lg:hidden">
            <AdminLink
              href="/admin"
              className="font-heading text-base font-semibold"
            >
              mateojaras.dev
            </AdminLink>
            <MobileMenu label={nav("menu")}>
              <div className="flex h-full flex-col">
                <div className="flex-1 overflow-y-auto">
                  <AdminNav unreadCount={unreadCount} labels={navLabels} />
                </div>
                {identity}
              </div>
            </MobileMenu>
          </header>
          <div className="flex min-w-0 flex-1 flex-col">
            {exportSkipped ? (
              <output className="block border-b border-border bg-muted px-6 py-2 text-sm">
                {t("exportSkipped")}
              </output>
            ) : null}
            {children}
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </NavigationBlockerProvider>
  );
}
