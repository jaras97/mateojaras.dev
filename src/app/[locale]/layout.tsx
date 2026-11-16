import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { fontVariables } from "@/app/fonts";
import { isLocale, locales } from "@/lib/locale";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Mateo Jaramillo",
};

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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
