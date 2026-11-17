import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  experienceProjects,
  experienceSkills,
  experiences,
  projects,
} from "@/db/schema";
import { requireSession } from "@/lib/dal";
import { applyDraft } from "@/lib/draft";

// Uncached admin reads. Each loader checks the session itself: the layout gate
// alone does not protect a loader called from elsewhere.
export async function getExperienceForAdmin(id: string) {
  await requireSession();
  const rows = await db
    .select()
    .from(experiences)
    .where(eq(experiences.id, id))
    .limit(1);
  const stored = rows[0];
  if (!stored) return null;
  const [skillLinks, projectLinks] = await Promise.all([
    db
      .select({ skillId: experienceSkills.skillId })
      .from(experienceSkills)
      .where(eq(experienceSkills.experienceId, id)),
    db
      .select({ projectId: experienceProjects.projectId })
      .from(experienceProjects)
      .where(eq(experienceProjects.experienceId, id)),
  ]);
  const hasPendingDraft =
    stored.status === "published" && stored.draft !== null;
  const draft = stored.draft as {
    skillIds?: unknown;
    projectIds?: unknown;
  } | null;
  const skillIds =
    hasPendingDraft && Array.isArray(draft?.skillIds)
      ? (draft.skillIds as string[])
      : skillLinks.map((l) => l.skillId);
  const projectIds =
    hasPendingDraft && Array.isArray(draft?.projectIds)
      ? (draft.projectIds as string[])
      : projectLinks.map((l) => l.projectId);
  return { row: applyDraft(stored), skillIds, projectIds, hasPendingDraft };
}

// Rows for the list. The draft body never leaves the server: only a flag.
export async function listExperiencesForAdmin() {
  await requireSession();
  const rows = await db
    .select({
      id: experiences.id,
      company: experiences.company,
      roleEs: experiences.roleEs,
      roleEn: experiences.roleEn,
      type: experiences.type,
      startDate: experiences.startDate,
      endDate: experiences.endDate,
      status: experiences.status,
      visible: experiences.visible,
      updatedAt: experiences.updatedAt,
      draft: experiences.draft,
    })
    .from(experiences)
    .orderBy(asc(experiences.order));
  return rows.map(({ draft, ...row }) => ({
    ...row,
    hasPendingDraft: row.status === "published" && draft !== null,
  }));
}

// Project checkboxes of the experience form.
export async function listProjectOptionsForAdmin() {
  await requireSession();
  return db
    .select({ id: projects.id, titleEs: projects.titleEs })
    .from(projects)
    .orderBy(asc(projects.order));
}
