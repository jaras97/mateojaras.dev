import { getTranslations } from "next-intl/server";
import { AdminLink } from "@/components/admin/admin-link";
import { getPanelStatus } from "@/features/admin/panel-queries";
import { requireSession } from "@/lib/dal";

type Status = Awaited<ReturnType<typeof getPanelStatus>>;

const ROWS = [
  { key: "settings", href: "/admin/ajustes" },
  { key: "projects", href: "/admin/proyectos" },
  { key: "experience", href: "/admin/experiencia" },
  { key: "skills", href: "/admin/skills" },
  { key: "education", href: "/admin/educacion" },
  { key: "cv", href: "/admin/cv" },
  { key: "messages", href: "/admin/mensajes" },
] as const;

export default async function AdminHome() {
  await requireSession();
  const [t, nav, e, s] = await Promise.all([
    getTranslations({ locale: "es", namespace: "Admin.panel" }),
    getTranslations({ locale: "es", namespace: "Admin.nav" }),
    getTranslations({ locale: "es", namespace: "Admin.errors" }),
    getTranslations({ locale: "es", namespace: "Admin.panel.status" }),
  ]);

  let status: Status | null = null;
  try {
    status = await getPanelStatus();
  } catch (error) {
    console.error("getPanelStatus failed", error);
  }

  function line(key: (typeof ROWS)[number]["key"], data: Status): string {
    switch (key) {
      case "settings":
        return s("settings", { missing: data.settings.missingEs });
      case "projects":
        return s("projects", {
          total: data.projects.total,
          drafts: data.projects.drafts,
          missing: data.projects.missingEs,
        });
      case "experience":
        return s("experience", {
          total: data.experience.total,
          drafts: data.experience.drafts,
        });
      case "skills":
        return s("skills", {
          total: data.skills.total,
          drafts: data.skills.drafts,
        });
      case "education":
        return s("education", {
          total: data.education.total,
          drafts: data.education.drafts,
        });
      case "cv":
        return data.cv
          ? s("cv", {
              version: data.cv.version,
              date: new Intl.DateTimeFormat("es", {
                day: "numeric",
                month: "short",
                year: "numeric",
                timeZone: "America/Bogota",
              }).format(data.cv.generatedAt),
            })
          : s("cvNone");
      case "messages":
        return s("messages", { n: data.unread });
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <h1 className="font-heading text-3xl font-semibold tracking-display">
        {t("title")}
      </h1>
      <ul className="mt-8 border-t border-border">
        {ROWS.map((row, index) => (
          <li
            key={row.key}
            className="flex items-baseline gap-4 border-b border-border py-4"
          >
            <span className="font-mono text-xs text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <AdminLink
                href={row.href}
                className="text-base font-semibold underline-offset-4 hover:underline"
              >
                {nav(row.key)}
              </AdminLink>
              <p className="font-mono text-xs text-muted-foreground">
                {status ? line(row.key, status) : e("loadFailed")}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
