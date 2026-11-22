import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { getSiteSettings } from "@/features/site-settings/queries";
import type { Locale } from "@/features/site-settings/types";
import { getPathname } from "@/i18n/navigation";
import { LangSwitch } from "./lang-switch";
import { NavLinks, StaticNav } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export async function SiteHeader({ locale }: { locale: Locale }) {
  const [t, tIndex, settings] = await Promise.all([
    getTranslations({ locale, namespace: "Site.header" }),
    getTranslations({ locale, namespace: "Hero.index" }),
    getSiteSettings(),
  ]);
  const name = settings?.name ?? "";
  const labels = {
    work: tIndex("work"),
    about: tIndex("about"),
    contact: tIndex("contact"),
  };
  const other: Locale = locale === "en" ? "es" : "en";
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-4 px-6 md:px-12">
        <a
          href={getPathname({ locale, href: "/" })}
          aria-label={t("home")}
          className="inline-flex h-8 items-center text-sm font-semibold text-foreground"
        >
          <span className="hidden sm:inline">{name}</span>
          <span aria-hidden="true" className="sm:hidden">
            {initials(name)}
          </span>
        </a>
        <div className="flex items-center gap-4">
          <nav aria-label={t("nav")}>
            <Suspense fallback={<StaticNav locale={locale} labels={labels} />}>
              <NavLinks locale={locale} labels={labels} />
            </Suspense>
          </nav>
          <Suspense
            fallback={
              <a
                href={getPathname({ locale: other, href: "/" })}
                hrefLang={other}
                lang={other}
                aria-label={t("toOtherLocale")}
                className="inline-flex h-8 items-center font-mono text-sm text-muted-foreground"
              >
                {other.toUpperCase()}
              </a>
            }
          >
            <LangSwitch locale={locale} toOther={t("toOtherLocale")} />
          </Suspense>
          <ThemeToggle
            labels={{ toDark: t("themeToDark"), toLight: t("themeToLight") }}
          />
        </div>
      </div>
    </header>
  );
}
