import "server-only";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { resumeVersions } from "@/db/schema";
import { getEducationCore } from "@/features/education/queries";
import { getExperiencesCore } from "@/features/experience/queries";
import { getProjectsCore } from "@/features/projects/queries";
import { getSiteSettingsCore } from "@/features/site-settings/queries";
import { isEmptyText } from "@/lib/bilingual";
import { requireSession } from "@/lib/dal";

// Uncached admin reads; each loader checks the session itself.
export async function listResumeVersionsForAdmin() {
  await requireSession();
  const rows = await db
    .select()
    .from(resumeVersions)
    .orderBy(desc(resumeVersions.generatedAt), desc(resumeVersions.version));
  const latest = new Map<string, number>();
  for (const row of rows) {
    latest.set(row.locale, Math.max(latest.get(row.locale) ?? 0, row.version));
  }
  return rows.map((row) => ({
    id: row.id,
    locale: row.locale,
    version: row.version,
    generatedAt: row.generatedAt.toISOString(),
    pdfUrl: row.pdfUrl,
    isCurrent: latest.get(row.locale) === row.version,
  }));
}

export type PreflightKey =
  | "headline"
  | "bio"
  | "role"
  | "bullets"
  | "title"
  | "tagline"
  | "program"
  | "noFeatured";

export type PreflightProblem = {
  key: PreflightKey;
  nombre?: string;
  locale?: "en" | "es";
  href: string;
};

// Problems that would show up in the PDF, from the same published + visible
// rows the CV is built from.
export async function getCvPreflight(): Promise<PreflightProblem[]> {
  await requireSession();
  const [settings, experiences, projects, education] = await Promise.all([
    getSiteSettingsCore({ includeDrafts: false }),
    getExperiencesCore({ includeDrafts: false }),
    getProjectsCore({ includeDrafts: false }),
    getEducationCore({ includeDrafts: false }),
  ]);
  const problems: PreflightProblem[] = [];
  const both = ["en", "es"] as const;

  if (settings) {
    for (const locale of both) {
      const suffix = locale === "en" ? "En" : "Es";
      if (isEmptyText(settings[`headline${suffix}`])) {
        problems.push({ key: "headline", locale, href: "/admin/ajustes" });
      }
      if (isEmptyText(settings[`bio${suffix}`])) {
        problems.push({ key: "bio", locale, href: "/admin/ajustes" });
      }
    }
  }

  for (const row of experiences) {
    const href = `/admin/experiencia/${row.id}`;
    for (const locale of both) {
      const role = locale === "en" ? row.roleEn : row.roleEs;
      if (isEmptyText(role)) {
        problems.push({ key: "role", nombre: row.company, locale, href });
      }
    }
    if (row.bulletsEn.length !== row.bulletsEs.length) {
      problems.push({ key: "bullets", nombre: row.company, href });
    }
  }

  const featured = projects.filter((row) => row.featured);
  if (featured.length === 0) {
    problems.push({ key: "noFeatured", href: "/admin/proyectos" });
  }
  for (const row of featured) {
    const href = `/admin/proyectos/${row.id}`;
    const nombre = row.titleEn || row.titleEs;
    for (const locale of both) {
      if (isEmptyText(locale === "en" ? row.titleEn : row.titleEs)) {
        problems.push({ key: "title", nombre, locale, href });
      }
    }
    const taglineEmpty = both.filter((locale) =>
      isEmptyText(locale === "en" ? row.taglineEn : row.taglineEs),
    );
    if (taglineEmpty.length === 1) {
      problems.push({ key: "tagline", nombre, locale: taglineEmpty[0], href });
    }
  }

  for (const row of education) {
    const href = `/admin/educacion/${row.id}`;
    for (const locale of both) {
      if (isEmptyText(locale === "en" ? row.programEn : row.programEs)) {
        problems.push({
          key: "program",
          nombre: row.institution,
          locale,
          href,
        });
      }
    }
  }
  return problems;
}
