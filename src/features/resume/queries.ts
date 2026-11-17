// Latest stored CV per locale. The core takes explicit arguments (Plan B seam);
// the cached wrapper receives the locale as an argument and never reads
// draftMode(): the CV is a public snapshot.
import { desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { resumeVersions } from "@/db/schema";
import { tags } from "@/lib/cache-tags";

export type ResumeLocale = "en" | "es";

export async function getLatestResumeCore(locale: ResumeLocale) {
  const rows = await db
    .select()
    .from(resumeVersions)
    .where(eq(resumeVersions.locale, locale))
    .orderBy(desc(resumeVersions.version))
    .limit(1);
  return rows[0] ?? null;
}

export async function getLatestResume(locale: ResumeLocale) {
  "use cache";
  cacheTag(tags.resume);
  cacheLife("max");
  return getLatestResumeCore(locale);
}
