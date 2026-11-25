"use server";

import { eq, max } from "drizzle-orm";
import { updateTag } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { education } from "@/db/schema";
import type { ActionResult } from "@/lib/action-result";
import { tags } from "@/lib/cache-tags";
import { exportContent } from "@/lib/content-export";
import { requireActionSession } from "@/lib/dal";
import { educationColumns } from "./columns";
import {
  createEducationSchema,
  educationDraftSchema,
  educationPublishSchema,
} from "./validation";

// Draft/publish rules: docs/data-model.md "Reglas". Saving a draft never
// touches a public tag; publish, visible, order and delete do (tags.education).

const idSchema = z.uuid();
const idsSchema = z.array(z.uuid()).min(1);

type BatchItem = Parameters<typeof db.batch>[0][number];
type Failure = Extract<ActionResult, { ok: false }>;

function validationError(error: z.ZodError): Failure {
  const flat = error.flatten((issue) => issue.message);
  return { ok: false, error: "validation", fieldErrors: flat.fieldErrors };
}

function backup() {
  after(() =>
    exportContent({ db, tables: ["education"] }).catch((error) =>
      console.error("exportContent failed", error),
    ),
  );
}

async function loadRow(id: string) {
  const rows = await db
    .select()
    .from(education)
    .where(eq(education.id, id))
    .limit(1);
  return rows[0] ?? null;
}

const ok = (): ActionResult => ({
  ok: true,
  savedAt: new Date().toISOString(),
});

export async function createEducation(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  const parsed = createEducationSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const [last] = await db
      .select({ value: max(education.order) })
      .from(education);
    const created = await db
      .insert(education)
      .values({
        ...parsed.data,
        status: "draft",
        order: (last?.value ?? -1) + 1,
      })
      .returning({ id: education.id });
    backup();
    return { ok: true, savedAt: new Date().toISOString(), id: created[0].id };
  } catch (error) {
    console.error("createEducation failed", error);
    return { ok: false, error: "server" };
  }
}

export async function saveEducationDraft(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  const parsed = educationDraftSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const row = await loadRow(id);
    if (!row) return { ok: false, error: "not_found" };
    const columns = educationColumns(parsed.data);
    await db
      .update(education)
      .set(row.status === "published" ? { draft: columns } : columns)
      .where(eq(education.id, id));
  } catch (error) {
    console.error("saveEducationDraft failed", error);
    return { ok: false, error: "server" };
  }
  backup();
  return ok();
}

export async function publishEducation(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  const parsed = educationPublishSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const row = await loadRow(id);
    if (!row) return { ok: false, error: "not_found" };
    await db
      .update(education)
      .set({
        ...educationColumns(parsed.data),
        status: "published",
        draft: null,
      })
      .where(eq(education.id, id));
  } catch (error) {
    console.error("publishEducation failed", error);
    return { ok: false, error: "server" };
  }
  updateTag(tags.education);
  backup();
  return ok();
}

export async function discardEducationDraft(id: string): Promise<ActionResult> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  try {
    const row = await loadRow(id);
    if (!row) return { ok: false, error: "not_found" };
    await db.update(education).set({ draft: null }).where(eq(education.id, id));
  } catch (error) {
    console.error("discardEducationDraft failed", error);
    return { ok: false, error: "server" };
  }
  backup();
  return ok();
}

// Structural changes write their column immediately and never use the draft.
export async function reorderEducation(ids: string[]): Promise<ActionResult> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  const parsed = idsSchema.safeParse(ids);
  if (!parsed.success) return { ok: false, error: "validation" };
  try {
    const existing = await db.select({ id: education.id }).from(education);
    const sent = new Set(parsed.data);
    const sameSet =
      sent.size === parsed.data.length &&
      existing.length === sent.size &&
      existing.every((row) => sent.has(row.id));
    if (!sameSet) return { ok: false, error: "validation" };
    const items: BatchItem[] = parsed.data.map((id, order) =>
      db.update(education).set({ order }).where(eq(education.id, id)),
    );
    await db.batch(items as [BatchItem, ...BatchItem[]]);
  } catch (error) {
    console.error("reorderEducation failed", error);
    return { ok: false, error: "server" };
  }
  updateTag(tags.education);
  backup();
  return ok();
}

export async function setEducationVisible(
  id: string,
  visible: boolean,
): Promise<ActionResult> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  if (!idSchema.safeParse(id).success || typeof visible !== "boolean") {
    return { ok: false, error: "validation" };
  }
  try {
    const row = await loadRow(id);
    if (!row) return { ok: false, error: "not_found" };
    await db.update(education).set({ visible }).where(eq(education.id, id));
    updateTag(tags.education);
  } catch (error) {
    console.error("setEducationVisible failed", error);
    return { ok: false, error: "server" };
  }
  backup();
  return ok();
}

export async function deleteEducation(
  id: string,
  confirmName: string,
): Promise<ActionResult> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  if (!idSchema.safeParse(id).success || typeof confirmName !== "string") {
    return { ok: false, error: "validation" };
  }
  try {
    const row = await loadRow(id);
    if (!row) return { ok: false, error: "not_found" };
    if (confirmName.trim() !== row.institution) {
      return { ok: false, error: "validation" };
    }
    await db.delete(education).where(eq(education.id, id));
    if (row.status === "published") updateTag(tags.education);
  } catch (error) {
    console.error("deleteEducation failed", error);
    return { ok: false, error: "server" };
  }
  backup();
  return ok();
}
