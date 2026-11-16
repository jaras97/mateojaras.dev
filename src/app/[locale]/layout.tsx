import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { NextIntlClientProvider } from "next-intl";
import { fontVariables } from "@/app/fonts";
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
  return (
    <html lang={param} className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Client Links need the locale; UI strings stay server-side. */}
        <NextIntlClientProvider locale={param} messages={null}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
