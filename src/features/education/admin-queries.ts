import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { education } from "@/db/schema";
import { requireSession } from "@/lib/dal";
import { applyDraft } from "@/lib/draft";

// Uncached admin reads. Each loader checks the session itself: the layout gate
// alone does not protect a loader called from elsewhere.
export async function getEducationForAdmin(id: string) {
  await requireSession();
  const rows = await db
    .select()
    .from(education)
    .where(eq(education.id, id))
    .limit(1);
  const stored = rows[0];
  if (!stored) return null;
  return {
    row: applyDraft(stored),
    hasPendingDraft: stored.status === "published" && stored.draft !== null,
  };
}

// Rows for the list. The draft body never leaves the server: only a flag.
export async function listEducationForAdmin() {
  await requireSession();
  const rows = await db
    .select({
      id: education.id,
      institution: education.institution,
      programEs: education.programEs,
      programEn: education.programEn,
      startDate: education.startDate,
      endDate: education.endDate,
      status: education.status,
      visible: education.visible,
      draft: education.draft,
    })
    .from(education)
    .orderBy(asc(education.order));
  return rows.map(({ draft, ...row }) => ({
    ...row,
    hasPendingDraft: row.status === "published" && draft !== null,
  }));
}
