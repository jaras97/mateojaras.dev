import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projectSkills, projects, skills } from "@/db/schema";
import { requireSession } from "@/lib/dal";
import { applyDraft } from "@/lib/draft";

// Uncached admin reads. Each loader checks the session itself (WR-01): the
// layout gate alone does not protect a loader called from elsewhere.
export async function getProjectForAdmin(id: string) {
  await requireSession();
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  const stored = rows[0];
  if (!stored) return null;
  const links = await db
    .select({ skillId: projectSkills.skillId })
    .from(projectSkills)
    .where(eq(projectSkills.projectId, id));
  const hasPendingDraft =
    stored.status === "published" && stored.draft !== null;
  const draftSkills = (stored.draft as { skillIds?: unknown } | null)?.skillIds;
  const skillIds =
    hasPendingDraft && Array.isArray(draftSkills)
      ? (draftSkills as string[])
      : links.map((l) => l.skillId);
  return { row: applyDraft(stored), skillIds, hasPendingDraft };
}

// Rows for the 03-04 list. The draft body never leaves the server: only a flag.
export async function listProjectsForAdmin() {
  await requireSession();
  const rows = await db
    .select({
      id: projects.id,
      slug: projects.slug,
      titleEs: projects.titleEs,
      titleEn: projects.titleEn,
      status: projects.status,
      visible: projects.visible,
      featured: projects.featured,
      updatedAt: projects.updatedAt,
      draft: projects.draft,
    })
    .from(projects)
    .orderBy(asc(projects.order));
  return rows.map(({ draft, ...row }) => ({
    ...row,
    hasPendingDraft: row.status === "published" && draft !== null,
  }));
}

// Skill checkboxes of the project form, grouped by category in the UI.
export async function listSkillOptionsForAdmin() {
  await requireSession();
  return db
    .select({ id: skills.id, name: skills.name, category: skills.category })
    .from(skills)
    .orderBy(asc(skills.category), asc(skills.order));
}
