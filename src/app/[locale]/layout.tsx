import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { fontVariables } from "@/app/fonts";
import { DraftBanner } from "@/components/site/draft-banner";
import { getSiteSettings } from "@/features/site-settings/queries";
import { isLocale, locales } from "@/lib/locale";
import "@/app/globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return settings ? { title: settings.name } : {};
}

export function generateStaticParams() {
  return locales.map((l) => ({ locale: l }));
}

export default async function RootLayout({
  children,
}: LayoutProps<"/[locale]">) {
  const param = await locale();
  if (!isLocale(param)) notFound();
  const t = await getTranslations({ locale: param, namespace: "Site.header" });
  return (
    <html lang={param} className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Client Links need the locale; UI strings stay server-side. */}
        <a
          href="#main"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:z-50 focus-visible:rounded-sm focus-visible:bg-background focus-visible:px-3 focus-visible:py-2 focus-visible:font-mono focus-visible:text-sm focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t("skip")}
        </a>
        <NextIntlClientProvider locale={param} messages={null}>
          <DraftBanner locale={param} />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
