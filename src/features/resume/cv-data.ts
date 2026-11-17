import "server-only";
import { getTranslations } from "next-intl/server";
import { getEducationCore } from "@/features/education/queries";
import { getExperiencesCore } from "@/features/experience/queries";
import { getProjectsCore } from "@/features/projects/queries";
import { getSiteSettingsCore } from "@/features/site-settings/queries";
import type { Locale } from "@/features/site-settings/types";
import { getSkillsCore } from "@/features/skills/queries";
import { formatMonthYear, formatUtcOffset } from "@/lib/format";
import { localized } from "@/lib/i18n-fields";

// One builder for the PDF (and later JSON Resume). It reads only published and
// visible rows through the cores with includeDrafts false and never touches
// draftMode() or next/headers: Teo's preview cookie must not reach the CV.

export type CvData = {
  locale: Locale;
  name: string;
  headline: string;
  summary: string;
  contact: {
    email: string;
    location: string;
    utcOffset: string;
    githubUrl: string | null;
    linkedinUrl: string | null;
    siteUrl: string | null;
  };
  experience: {
    company: string;
    role: string;
    location: string | null;
    dates: string;
    bullets: string[];
  }[];
  projects: {
    title: string;
    tagline: string | null;
    liveUrl: string | null;
  }[];
  skills: { category: string; names: string[] }[];
  education: {
    institution: string;
    program: string;
    dates: string;
    status: string | null;
  }[];
  languages: { name: string; level: string }[];
  labels: {
    summary: string;
    experience: string;
    projects: string;
    skills: string;
    education: string;
    languages: string;
  };
};

const SKILL_CATEGORY_ORDER = [
  "frontend",
  "state",
  "testing",
  "backend",
  "ai",
  "tools",
] as const;

// The localized value, or the English one when the locale's text is blank.
function text(row: Record<string, unknown>, field: string, locale: Locale) {
  const value = localized(row, field, locale);
  if (typeof value === "string" && value.trim() !== "") return value;
  const en = localized(row, field, "en");
  return typeof en === "string" ? en : "";
}

function list(row: Record<string, unknown>, field: string, locale: Locale) {
  const value = localized(row, field, locale);
  const picked = Array.isArray(value) && value.length > 0 ? value : null;
  const fallback = localized(row, field, "en");
  const out = picked ?? (Array.isArray(fallback) ? fallback : []);
  return out.filter(
    (item): item is string => typeof item === "string" && item.trim() !== "",
  );
}

function range(
  start: string | null,
  end: string | null,
  locale: Locale,
  present: string,
) {
  if (!start && !end) return "";
  const from = start ? formatMonthYear(start, locale) : "";
  const to = end ? formatMonthYear(end, locale) : present;
  return from ? `${from} – ${to}` : to;
}

function cleanUrl(url: string | null) {
  return url?.trim() ? url.trim() : null;
}

export async function buildCvData(locale: Locale): Promise<CvData> {
  const [settings, experiences, projects, skills, education, cv] =
    await Promise.all([
      getSiteSettingsCore({ includeDrafts: false }),
      getExperiencesCore({ includeDrafts: false }),
      getProjectsCore({ includeDrafts: false }),
      getSkillsCore({ includeDrafts: false }),
      getEducationCore({ includeDrafts: false }),
      getTranslations({ locale, namespace: "Cv" }),
    ]);
  if (!settings) throw new Error("Faltan los ajustes del sitio");

  const present = cv("present");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || null;

  const categories = new Map<string, { name: string; featured: boolean }[]>();
  for (const skill of skills) {
    const bucket = categories.get(skill.category) ?? [];
    bucket.push({ name: skill.name, featured: skill.featured });
    categories.set(skill.category, bucket);
  }
  const skillGroups = SKILL_CATEGORY_ORDER.filter((c) => categories.has(c)).map(
    (category) => ({
      category: cv(`skillCategories.${category}`),
      names: [...(categories.get(category) ?? [])]
        .sort((a, b) => Number(b.featured) - Number(a.featured))
        .map((s) => s.name),
    }),
  );

  const displayNames = new Intl.DisplayNames(locale, { type: "language" });

  return {
    locale,
    name: settings.name,
    headline: text(settings, "headline", locale),
    summary: text(settings, "bio", locale),
    contact: {
      email: settings.email,
      location: settings.location,
      utcOffset: formatUtcOffset(settings.timezone, new Date()),
      githubUrl: cleanUrl(settings.githubUrl),
      linkedinUrl: cleanUrl(settings.linkedinUrl),
      siteUrl,
    },
    experience: experiences.map((row) => ({
      company: row.company,
      role: text(row, "role", locale),
      location: row.location,
      dates: range(row.startDate, row.endDate, locale, present),
      bullets: list(row, "bullets", locale),
    })),
    projects: projects
      .filter((row) => row.featured)
      .map((row) => ({
        title: text(row, "title", locale),
        tagline: text(row, "tagline", locale) || null,
        liveUrl: cleanUrl(row.liveUrl),
      })),
    skills: skillGroups,
    education: education.map((row) => ({
      institution: row.institution,
      program: text(row, "program", locale),
      dates: range(row.startDate, row.endDate, locale, present),
      status: text(row, "status", locale) || null,
    })),
    languages: settings.languages.map((entry) => {
      const label = displayNames.of(entry.code) ?? entry.code;
      return {
        name: label.charAt(0).toLocaleUpperCase(locale) + label.slice(1),
        level: cv(`levels.${entry.level}`),
      };
    }),
    labels: {
      summary: cv("summary"),
      experience: cv("experience"),
      projects: cv("projects"),
      skills: cv("skills"),
      education: cv("education"),
      languages: cv("languages"),
    },
  };
}
