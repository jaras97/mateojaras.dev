"use server";

import { and, eq, max, ne } from "drizzle-orm";
import { updateTag } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { skills } from "@/db/schema";
import type { ActionResult } from "@/lib/action-result";
import { tags } from "@/lib/cache-tags";
import { exportContent } from "@/lib/content-export";
import { requireActionSession } from "@/lib/dal";
import {
  categorySchema,
  createSkillSchema,
  skillDraftSchema,
  skillPublishSchema,
} from "./validation";

// Draft/publish rules: docs/data-model.md "Reglas". Saving a draft never
// touches a public tag. Publish, visible, order, featured and delete of a
// published row invalidate tags.skills and tags.projects (project pages list
// their skills).

const idSchema = z.uuid();
const idsSchema = z.array(z.uuid()).min(1);

type Parsed = z.output<typeof skillDraftSchema>;
type BatchItem = Parameters<typeof db.batch>[0][number];
type Failure = Extract<ActionResult, { ok: false }>;

const TABLES = ["skills", "project_skills", "experience_skills"];

const blank = (value: string | null) =>
  value === null || value.trim() === "" ? null : value.trim();

function toColumns(input: Parsed) {
  return { ...input, icon: blank(input.icon) };
}

function invalidate() {
  updateTag(tags.skills);
  updateTag(tags.projects);
}

function validationError(error: z.ZodError): Failure {
  const flat = error.flatten((issue) => issue.message);
  return { ok: false, error: "validation", fieldErrors: flat.fieldErrors };
}

const taken = (): Failure => ({
  ok: false,
  error: "conflict",
  fieldErrors: { name: ["taken"] },
});

function isUniqueViolation(error: unknown) {
  let current: unknown = error;
  while (typeof current === "object" && current !== null) {
    if ((current as { code?: unknown }).code === "23505") return true;
    current = (current as { cause?: unknown }).cause;
  }
  return false;
}

function backup() {
  after(() =>
    exportContent({ db, tables: TABLES }).catch((error) =>
      console.error("exportContent failed", error),
    ),
  );
}

const ok = (): ActionResult => ({
  ok: true,
  savedAt: new Date().toISOString(),
});

async function loadRow(id: string) {
  const rows = await db.select().from(skills).where(eq(skills.id, id)).limit(1);
  return rows[0] ?? null;
}

async function nameTaken(name: string, exceptId?: string) {
  const rows = await db
    .select({ id: skills.id })
    .from(skills)
    .where(
      exceptId
        ? and(eq(skills.name, name), ne(skills.id, exceptId))
        : eq(skills.name, name),
    )
    .limit(1);
  return rows.length > 0;
}

export async function createSkill(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  const parsed = createSkillSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    if (await nameTaken(parsed.data.name)) return taken();
    const [last] = await db
      .select({ value: max(skills.order) })
      .from(skills)
      .where(eq(skills.category, parsed.data.category));
    const created = await db
      .insert(skills)
      .values({
        ...parsed.data,
        status: "draft",
        order: (last?.value ?? -1) + 1,
      })
      .returning({ id: skills.id });
    backup();
    return { ok: true, savedAt: new Date().toISOString(), id: created[0].id };
  } catch (error) {
    if (isUniqueViolation(error)) return taken();
    console.error("createSkill failed", error);
    return { ok: false, error: "server" };
  }
}

export async function saveSkillDraft(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  const parsed = skillDraftSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const row = await loadRow(id);
    if (!row) return { ok: false, error: "not_found" };
    if (await nameTaken(parsed.data.name, id)) return taken();
    const columns = toColumns(parsed.data);
    if (row.status === "published") {
      await db.update(skills).set({ draft: columns }).where(eq(skills.id, id));
    } else {
      await db.update(skills).set(columns).where(eq(skills.id, id));
    }
  } catch (error) {
    if (isUniqueViolation(error)) return taken();
    console.error("saveSkillDraft failed", error);
    return { ok: false, error: "server" };
  }
  backup();
  return ok();
}

export async function publishSkill(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  const parsed = skillPublishSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const row = await loadRow(id);
    if (!row) return { ok: false, error: "not_found" };
    if (await nameTaken(parsed.data.name, id)) return taken();
    await db
      .update(skills)
      .set({ ...toColumns(parsed.data), status: "published", draft: null })
      .where(eq(skills.id, id));
  } catch (error) {
    if (isUniqueViolation(error)) return taken();
    console.error("publishSkill failed", error);
    return { ok: false, error: "server" };
  }
  invalidate();
  backup();
  return ok();
}

export async function discardSkillDraft(id: string): Promise<ActionResult> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  try {
    const row = await loadRow(id);
    if (!row) return { ok: false, error: "not_found" };
    await db.update(skills).set({ draft: null }).where(eq(skills.id, id));
  } catch (error) {
    console.error("discardSkillDraft failed", error);
    return { ok: false, error: "server" };
  }
  backup();
  return ok();
}

// Structural changes write their column immediately and never use the draft.
export async function reorderSkills(
  category: string,
  ids: string[],
): Promise<ActionResult> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  const cat = categorySchema.safeParse(category);
  const parsed = idsSchema.safeParse(ids);
  if (!cat.success || !parsed.success)
    return { ok: false, error: "validation" };
  try {
    const existing = await db
      .select({ id: skills.id })
      .from(skills)
      .where(eq(skills.category, cat.data));
    const sent = new Set(parsed.data);
    const sameSet =
      sent.size === parsed.data.length &&
      existing.length === sent.size &&
      existing.every((row) => sent.has(row.id));
    if (!sameSet) return { ok: false, error: "validation" };
    const items: BatchItem[] = parsed.data.map((id, order) =>
      db.update(skills).set({ order }).where(eq(skills.id, id)),
    );
    await db.batch(items as [BatchItem, ...BatchItem[]]);
  } catch (error) {
    console.error("reorderSkills failed", error);
    return { ok: false, error: "server" };
  }
  invalidate();
  backup();
  return ok();
}

export async function setSkillVisible(
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
    await db.update(skills).set({ visible }).where(eq(skills.id, id));
  } catch (error) {
    console.error("setSkillVisible failed", error);
    return { ok: false, error: "server" };
  }
  invalidate();
  backup();
  return ok();
}

export async function setSkillFeatured(
  id: string,
  featured: boolean,
): Promise<ActionResult> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  if (!idSchema.safeParse(id).success || typeof featured !== "boolean") {
    return { ok: false, error: "validation" };
  }
  try {
    const row = await loadRow(id);
    if (!row) return { ok: false, error: "not_found" };
    // A pending draft carries `featured` too; keep it in step so publishing it
    // later does not undo this switch.
    const draft =
      row.draft && typeof row.draft === "object" && "featured" in row.draft
        ? { ...row.draft, featured }
        : undefined;
    await db
      .update(skills)
      .set(draft ? { featured, draft } : { featured })
      .where(eq(skills.id, id));
  } catch (error) {
    console.error("setSkillFeatured failed", error);
    return { ok: false, error: "server" };
  }
  invalidate();
  backup();
  return ok();
}

export async function deleteSkill(
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
    if (confirmName.trim() !== row.name) {
      return { ok: false, error: "validation" };
    }
    // project_skills and experience_skills cascade from the row.
    await db.delete(skills).where(eq(skills.id, id));
    if (row.status === "published") invalidate();
  } catch (error) {
    console.error("deleteSkill failed", error);
    return { ok: false, error: "server" };
  }
  backup();
  return ok();
}
