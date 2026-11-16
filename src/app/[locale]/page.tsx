import { notFound } from "next/navigation";
import { locale } from "next/root-params";
import { getProjects } from "@/features/projects/queries";
import { localized } from "@/lib/i18n-fields";
import { isLocale } from "@/lib/locale";

export default async function Home() {
  const param = await locale();
  if (!isLocale(param)) notFound();
  const rows = await getProjects();
  return (
    <main className="mx-auto max-w-page px-6 py-12 md:px-12 lg:py-16">
      <h1 className="font-heading text-4xl font-semibold tracking-display text-balance">
        Mateo Jaramillo
      </h1>
      {rows.length > 0 && (
        <ul className="mt-8 flex flex-col gap-2">
          {rows.map((row) => (
            <li key={row.slug}>{localized(row, "title", param) as string}</li>
          ))}
        </ul>
      )}
    </main>
  );
}
