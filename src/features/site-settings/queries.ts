// Core + cached wrapper. Neither reads the locale; pages apply localized().
// Public reads never carry `draft`; Draft Mode overlays it on the columns.
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { draftMode } from "next/headers";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { tags } from "@/lib/cache-tags";
import { applyDraft, stripDraft } from "@/lib/draft";
import { SITE_SETTINGS_ID } from "./schema";

export async function getSiteSettingsCore({
  includeDrafts,
}: {
  includeDrafts: boolean;
}) {
  const rows = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, SITE_SETTINGS_ID))
    .limit(1);
  if (!rows[0]) return null;
  return includeDrafts ? applyDraft(rows[0]) : stripDraft(rows[0]);
}

export async function getSiteSettings() {
  "use cache";
  cacheTag(tags.settings);
  cacheLife("max");
  const { isEnabled } = await draftMode();
  return getSiteSettingsCore({ includeDrafts: isEnabled });
}
