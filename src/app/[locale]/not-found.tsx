import { locale } from "next/root-params";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { isLocale } from "@/lib/locale";

export default async function NotFound() {
  const param = await locale();
  const active = isLocale(param) ? param : "en";
  const t = await getTranslations({
    locale: active,
    namespace: "Site.notFound",
  });
  return (
    <main className="mx-auto max-w-page px-6 py-12 md:px-12 lg:py-16">
      <h1 className="font-heading text-4xl font-semibold tracking-display text-balance">
        {t("title")}
      </h1>
      <p className="mt-4">{t("body")}</p>
      <p className="mt-8">
        <Link href="/" className="underline underline-offset-4">
          {t("home")}
        </Link>
      </p>
    </main>
  );
}
