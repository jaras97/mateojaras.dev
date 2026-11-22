import { getTranslations } from "next-intl/server";
import { ListHeader } from "@/components/admin/list-header";
import { listMessagesForAdmin } from "@/features/contact/admin-queries";
import { MessagesTable } from "@/features/contact/components/messages-table";
import { requireSession } from "@/lib/dal";

export default async function MessagesPage() {
  await requireSession();
  const [t, toasts, errors, confirm] = await Promise.all([
    getTranslations({ locale: "es", namespace: "Admin.messages" }),
    getTranslations({ locale: "es", namespace: "Admin.toasts" }),
    getTranslations({ locale: "es", namespace: "Admin.errors" }),
    getTranslations({ locale: "es", namespace: "Admin.confirm" }),
  ]);
  const c = await getTranslations({
    locale: "es",
    namespace: "Admin.common.status",
  });

  let rows: Awaited<ReturnType<typeof listMessagesForAdmin>> | null = null;
  try {
    rows = await listMessagesForAdmin();
  } catch (error) {
    console.error("listMessagesForAdmin failed", error);
  }
  const unread = rows?.filter((row) => row.readAt === null).length ?? 0;

  return (
    <main className="w-full flex-1 px-6 py-12 lg:px-12">
      <ListHeader title={t("title")} count={t("unread", { n: unread })} />
      {rows ? (
        <MessagesTable
          rows={rows.map((row) => ({
            ...row,
            createdAt: row.createdAt.toISOString(),
            readAt: row.readAt ? row.readAt.toISOString() : null,
            emailSentAt: row.emailSentAt ? row.emailSentAt.toISOString() : null,
          }))}
          labels={{
            columns: {
              name: t("columns.name"),
              email: t("columns.email"),
              message: t("columns.message"),
              locale: t("columns.locale"),
              received: t("columns.received"),
            },
            new: c("new"),
            emailNotSent: t("emailNotSent"),
            empty: { heading: t("empty.heading"), body: t("empty.body") },
            reader: {
              reader: t("reader", { nombre: "{nombre}" }),
              reply: t("reply"),
              emailNotSentHelp: t("emailNotSentHelp"),
              replyPrefix: t("replyPrefix"),
              markRead: t("markRead"),
              markUnread: t("markUnread"),
              delete: t("delete"),
              close: t("close"),
              messageRead: toasts("messageRead"),
              messageUnread: toasts("messageUnread"),
              messageDeleted: toasts("messageDeleted"),
              updateFailed: errors("messageUpdateFailed"),
              deleteConfirm: {
                title: confirm("deleteMessage.title"),
                body: confirm("deleteMessage.body", { nombre: "{nombre}" }),
                cancel: confirm("deleteMessage.cancel"),
                confirm: confirm("deleteMessage.confirm"),
              },
            },
          }}
        />
      ) : (
        <p className="text-sm text-muted-foreground">{errors("loadFailed")}</p>
      )}
    </main>
  );
}
