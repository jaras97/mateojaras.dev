// Core + cached wrapper. Neither reads the locale; pages apply localized().
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { tags } from "@/lib/cache-tags";
import { SITE_SETTINGS_ID } from "./schema";

export async function getSiteSettingsCore() {
  const rows = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, SITE_SETTINGS_ID))
    .limit(1);
  return rows[0] ?? null;
}

export async function getSiteSettings() {
  "use cache";
  cacheTag(tags.settings);
  cacheLife("max");
  return getSiteSettingsCore();
}
