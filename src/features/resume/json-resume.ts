import { cacheLife, cacheTag } from "next/cache";
import type { Locale } from "@/features/site-settings/types";
import { tags } from "@/lib/cache-tags";
import { buildCvData, type CvData } from "./cv-data";
import type { JsonResume } from "./json-resume-schema";

// Maps the same CvData the PDF uses to JSON Resume. Fields with no stored value
// are left out; nothing is inferred (no inferred extras).

const month = (iso: string) => iso.slice(0, 7);

function nonEmpty<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => {
      if (v == null || v === "") return false;
      if (Array.isArray(v)) return v.length > 0;
      return true;
    }),
  ) as T;
}

export function toJsonResume(data: CvData, siteUrl: string): JsonResume {
  const isEs = data.locale === "es";
  const city = data.contact.location.split(",")[0]?.trim();
  // No configured site URL: omit url and canonical rather than emit a broken one.
  const base = (data.contact.siteUrl ?? siteUrl).trim().replace(/\/$/, "");
  const profiles = [
    data.contact.githubUrl && {
      network: "GitHub",
      url: data.contact.githubUrl,
    },
    data.contact.linkedinUrl && {
      network: "LinkedIn",
      url: data.contact.linkedinUrl,
    },
  ].filter((p): p is { network: string; url: string } => Boolean(p));

  return {
    basics: nonEmpty({
      name: data.name,
      label: data.headline,
      email: data.contact.email,
      url: base ? `${base}${isEs ? "/es" : ""}` : undefined,
      summary: data.summary,
      location: city ? { city } : undefined,
      profiles,
    }),
    work: data.experience.map((e) =>
      nonEmpty({
        name: e.company,
        position: e.role,
        location: e.location ?? undefined,
        startDate: month(e.startDate),
        endDate: e.endDate ? month(e.endDate) : undefined,
        highlights: e.bullets,
      }),
    ),
    education: data.education.map((e) =>
      nonEmpty({
        institution: e.institution,
        area: e.program,
        startDate: e.startDate ? month(e.startDate) : undefined,
        endDate: e.endDate ? month(e.endDate) : undefined,
      }),
    ),
    skills: data.skills.map((s) => ({ name: s.category, keywords: s.names })),
    languages: data.languages.map((l) => ({
      language: l.name,
      fluency: l.level,
    })),
    projects: data.projects.map((p) =>
      nonEmpty({
        name: p.title,
        description: p.tagline ?? undefined,
        url: p.liveUrl ?? undefined,
      }),
    ),
    meta: nonEmpty({
      canonical: base ? `${base}/resume${isEs ? ".es" : ""}.json` : undefined,
      version: "v1.0.0",
      lastModified: data.lastModified ?? undefined,
    }),
  };
}

// Cache lives here, not on the route handler (a GET cannot be 'use cache').
export async function getJsonResume(locale: Locale): Promise<JsonResume> {
  "use cache";
  cacheTag(
    tags.settings,
    tags.projects,
    tags.experience,
    tags.skills,
    tags.education,
  );
  cacheLife("max");
  return toJsonResume(
    await buildCvData(locale),
    process.env.NEXT_PUBLIC_SITE_URL ?? "",
  );
}
