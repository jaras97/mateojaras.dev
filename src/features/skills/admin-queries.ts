import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { skills } from "@/db/schema";
import { requireSession } from "@/lib/dal";
import { applyDraft } from "@/lib/draft";

// Uncached admin reads. Each loader checks the session itself.
export async function getSkillForAdmin(id: string) {
  await requireSession();
  const rows = await db.select().from(skills).where(eq(skills.id, id)).limit(1);
  const stored = rows[0];
  if (!stored) return null;
  const hasPendingDraft =
    stored.status === "published" && stored.draft !== null;
  return { row: applyDraft(stored), hasPendingDraft };
}

// Rows for the list, ordered by category then order (the table groups them).
// The draft body never leaves the server: only a flag.
export async function listSkillsForAdmin() {
  await requireSession();
  const rows = await db
    .select({
      id: skills.id,
      name: skills.name,
      category: skills.category,
      yearsUsed: skills.yearsUsed,
      featured: skills.featured,
      status: skills.status,
      visible: skills.visible,
      draft: skills.draft,
    })
    .from(skills)
    .orderBy(asc(skills.category), asc(skills.order));
  return rows.map(({ draft, ...row }) => ({
    ...row,
    hasPendingDraft: row.status === "published" && draft !== null,
  }));
}
