import { getTranslations } from "next-intl/server";

export default async function AdminHome() {
  const t = await getTranslations({ locale: "es", namespace: "Admin.panel" });
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        {t("title")}
      </h1>
    </main>
  );
}
