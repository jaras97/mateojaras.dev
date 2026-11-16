import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projectSkills, projects } from "@/db/schema";
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
