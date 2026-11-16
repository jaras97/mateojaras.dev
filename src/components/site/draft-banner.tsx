import { draftMode } from "next/headers";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/features/site-settings/types";
import { DraftExitForm } from "./draft-exit-form";

// Shown only with the Draft Mode cookie, which only a signed-in admin gets.
// During prerender draftMode() resolves disabled, so the shell has no band.
export async function DraftBanner({ locale }: { locale: Locale }) {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;
  const t = await getTranslations({ locale, namespace: "DraftMode" });
  return (
    <section
      aria-label={t("label")}
      className="sticky top-0 z-50 flex h-10 items-center justify-between gap-4 bg-foreground px-6 text-background md:px-12"
    >
      <p className="truncate font-mono text-xs">{t("text")}</p>
      <DraftExitForm label={t("exit")} />
    </section>
  );
}
