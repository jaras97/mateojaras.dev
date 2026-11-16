import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { fontVariables } from "@/app/fonts";
import "@/app/globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: "es", namespace: "Admin.meta" });
  return { title: t("title"), robots: { index: false, follow: false } };
}

// Root layout #2. The admin UI is always Spanish (D-08) and reads no session.
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="es" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
