import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { requireSession } from "@/lib/dal";
import { applyDraft } from "@/lib/draft";
import { SITE_SETTINGS_ID } from "./schema";

// Uncached admin read. The row comes back with the pending draft applied; the
// draft body itself never leaves the server, only a flag.
export async function getSettingsForAdmin() {
  await requireSession();
  const rows = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, SITE_SETTINGS_ID))
    .limit(1);
  const stored = rows[0];
  if (!stored) return null;
  return {
    row: applyDraft(stored),
    hasPendingDraft: stored.status === "published" && stored.draft !== null,
  };
}
