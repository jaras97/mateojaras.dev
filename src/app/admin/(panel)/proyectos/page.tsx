import { getTranslations } from "next-intl/server";
import { AdminLink } from "@/components/admin/admin-link";
import { ListHeader } from "@/components/admin/list-header";
import { buttonVariants } from "@/components/ui/button";
import { listProjectsForAdmin } from "@/features/projects/admin-queries";
import { ProjectsTable } from "@/features/projects/components/projects-table";
import { requireSession } from "@/lib/dal";

export default async function ProjectsPage() {
  await requireSession();
  const [t, c, d, toasts, errors, confirm] = await Promise.all([
    getTranslations({ locale: "es", namespace: "Admin.projects" }),
    getTranslations({ locale: "es", namespace: "Admin.common" }),
    getTranslations({ locale: "es", namespace: "Admin.dnd" }),
    getTranslations({ locale: "es", namespace: "Admin.toasts" }),
    getTranslations({ locale: "es", namespace: "Admin.errors" }),
    getTranslations({ locale: "es", namespace: "Admin.confirm" }),
  ]);

  let rows: Awaited<ReturnType<typeof listProjectsForAdmin>> | null = null;
  try {
    rows = await listProjectsForAdmin();
  } catch (error) {
    console.error("listProjectsForAdmin failed", error);
  }

  return (
    <main className="w-full flex-1 px-6 py-12 lg:px-12">
      <ListHeader
        title={t("title")}
        count={t("count", { n: rows?.length ?? 0 })}
        action={
          <AdminLink
            href="/admin/proyectos/nuevo"
            className={buttonVariants({ variant: "default" })}
          >
            {t("new")}
          </AdminLink>
        }
      />
      {rows ? (
        <ProjectsTable
          initialRows={rows.map((row) => ({
            ...row,
            updatedAt: row.updatedAt.toISOString(),
          }))}
          labels={{
            columns: {
              title: t("columns.title"),
              slug: t("columns.slug"),
              status: t("columns.status"),
              visible: t("columns.visible"),
              featured: t("columns.featured"),
              updated: t("columns.updated"),
              actions: t("columns.actions"),
            },
            status: {
              draft: c("status.draft"),
              published: c("status.published"),
              pending: c("status.pending"),
              hidden: c("status.hidden"),
            },
            sortable: {
              roleDescription: d("roleDescription"),
              instructions: d("instructions"),
              pickedUp: d("pickedUp", { nombre: "{nombre}" }),
              over: d("over", {
                nombre: "{nombre}",
                n: "{n}",
                total: "{total}",
              }),
              dropped: d("dropped", {
                nombre: "{nombre}",
                n: "{n}",
                total: "{total}",
              }),
              cancelled: d("cancelled", { nombre: "{nombre}", n: "{n}" }),
              moveItem: c("moveItem", { nombre: "{nombre}" }),
              moveUpItem: c("moveUpItem", { nombre: "{nombre}" }),
              moveDownItem: c("moveDownItem", { nombre: "{nombre}" }),
              moveUp: c("moveUp"),
              moveDown: c("moveDown"),
            },
            moreActions: c("moreActions", { nombre: "{nombre}" }),
            edit: c("edit"),
            discard: c("discard"),
            delete: c("delete"),
            visibleOn: toasts("visibleOn"),
            visibleOff: toasts("visibleOff"),
            orderSaved: toasts("orderSaved"),
            reorderFailed: errors("reorderFailed"),
            saveFailed: errors("saveFailed"),
            deleted: toasts("deleted", { nombre: "{nombre}" }),
            discarded: toasts("discarded"),
            discardConfirm: {
              title: confirm("discard.title"),
              body: confirm("discard.body"),
              cancel: confirm("discard.cancel"),
              confirm: confirm("discard.confirm"),
            },
            deleteConfirm: {
              title: confirm("delete.title", { nombre: "{nombre}" }),
              body: confirm("delete.body"),
              inputLabel: confirm("delete.inputLabel", { nombre: "{nombre}" }),
              cancel: confirm("delete.cancel"),
              confirm: confirm("delete.confirm"),
            },
            empty: {
              heading: t("empty.heading"),
              body: t("empty.body"),
              action: t("new"),
            },
          }}
        />
      ) : (
        <p className="text-sm text-muted-foreground">{errors("loadFailed")}</p>
      )}
    </main>
  );
}
