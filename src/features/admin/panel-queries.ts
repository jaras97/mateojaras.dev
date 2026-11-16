import "server-only";
import { count, desc, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  contactMessages,
  education,
  experiences,
  projects,
  resumeVersions,
  siteSettings,
  skills,
} from "@/db/schema";
import { requireSession } from "@/lib/dal";

const SETTINGS_ES_FIELDS = [
  "headlineEs",
  "bioEs",
  "seoTitleEs",
  "seoDescriptionEs",
] as const;

// The sidebar badge. Uncached, session checked here as well as in the gate.
export async function countUnreadMessages(): Promise<number> {
  await requireSession();
  const [row] = await db
    .select({ value: count() })
    .from(contactMessages)
    .where(isNull(contactMessages.readAt));
  return row?.value ?? 0;
}

async function drafts(
  table:
    | typeof projects
    | typeof experiences
    | typeof skills
    | typeof education,
) {
  const [row] = await db
    .select({
      total: count(),
      drafts: sql<number>`count(*) filter (where ${table.status} = 'draft' or ${table.draft} is not null)`,
    })
    .from(table);
  return { total: row?.total ?? 0, drafts: Number(row?.drafts ?? 0) };
}

const blank = (v: string | null) => v === null || v.trim() === "";

export async function getPanelStatus() {
  await requireSession();
  const [
    projectCounts,
    experienceCounts,
    skillCounts,
    educationCounts,
    projectRows,
    settingsRows,
    resumeRows,
    unread,
  ] = await Promise.all([
    drafts(projects),
    drafts(experiences),
    drafts(skills),
    drafts(education),
    db
      .select({
        titleEs: projects.titleEs,
        taglineEs: projects.taglineEs,
        problemEs: projects.problemEs,
        roleEs: projects.roleEs,
        solutionEs: projects.solutionEs,
      })
      .from(projects),
    db.select().from(siteSettings).limit(1),
    db
      .select({
        version: resumeVersions.version,
        generatedAt: resumeVersions.generatedAt,
      })
      .from(resumeVersions)
      .orderBy(desc(resumeVersions.version))
      .limit(1),
    countUnreadMessages(),
  ]);
  const projectsMissingEs = projectRows.reduce(
    (sum, row) => sum + Object.values(row).filter(blank).length,
    0,
  );
  const settings = settingsRows[0];
  const settingsMissingEs = settings
    ? SETTINGS_ES_FIELDS.filter((f) => blank(settings[f])).length
    : 0;
  return {
    projects: { ...projectCounts, missingEs: projectsMissingEs },
    settings: { missingEs: settingsMissingEs },
    experience: experienceCounts,
    skills: skillCounts,
    education: educationCounts,
    cv: resumeRows[0] ?? null,
    unread,
  };
}
