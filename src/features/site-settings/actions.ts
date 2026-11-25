"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { after } from "next/server";
import type { z } from "zod";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import type { ActionResult } from "@/lib/action-result";
import { tags } from "@/lib/cache-tags";
import { exportContent } from "@/lib/content-export";
import { requireActionSession } from "@/lib/dal";
import { settingsColumns } from "./columns";
import { SITE_SETTINGS_ID } from "./schema";
import { settingsDraftSchema, settingsPublishSchema } from "./validation";

// Draft/publish rules: docs/data-model.md "Reglas". SiteSettings is one row.
// Saving a draft or discarding never touches a public tag; publish is the only
// action that calls updateTag(tags.settings).

type Failure = Extract<ActionResult, { ok: false }>;

function validationError(error: z.ZodError): Failure {
  const flat = error.flatten((issue) => issue.message);
  return { ok: false, error: "validation", fieldErrors: flat.fieldErrors };
}

function backup() {
  after(() =>
    exportContent({ db, tables: ["site_settings"] }).catch((error) =>
      console.error("exportContent failed", error),
    ),
  );
}

async function loadRow() {
  const rows = await db
    .select({ status: siteSettings.status })
    .from(siteSettings)
    .where(eq(siteSettings.id, SITE_SETTINGS_ID))
    .limit(1);
  return rows[0] ?? null;
}

export async function saveSettingsDraft(input: unknown): Promise<ActionResult> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  const parsed = settingsDraftSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const row = await loadRow();
    if (!row) return { ok: false, error: "not_found" };
    const columns = settingsColumns(parsed.data);
    await db
      .update(siteSettings)
      .set(row.status === "published" ? { draft: columns } : columns)
      .where(eq(siteSettings.id, SITE_SETTINGS_ID));
  } catch (error) {
    console.error("saveSettingsDraft failed", error);
    return { ok: false, error: "server" };
  }
  backup();
  return { ok: true, savedAt: new Date().toISOString() };
}

export async function publishSettings(input: unknown): Promise<ActionResult> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  const parsed = settingsPublishSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const row = await loadRow();
    if (!row) return { ok: false, error: "not_found" };
    await db
      .update(siteSettings)
      .set({
        ...settingsColumns(parsed.data),
        status: "published",
        draft: null,
      })
      .where(eq(siteSettings.id, SITE_SETTINGS_ID));
  } catch (error) {
    console.error("publishSettings failed", error);
    return { ok: false, error: "server" };
  }
  updateTag(tags.settings);
  backup();
  return { ok: true, savedAt: new Date().toISOString() };
}

export async function discardSettingsDraft(): Promise<ActionResult> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  try {
    const row = await loadRow();
    if (!row) return { ok: false, error: "not_found" };
    await db
      .update(siteSettings)
      .set({ draft: null })
      .where(eq(siteSettings.id, SITE_SETTINGS_ID));
  } catch (error) {
    console.error("discardSettingsDraft failed", error);
    return { ok: false, error: "server" };
  }
  backup();
  return { ok: true, savedAt: new Date().toISOString() };
}
