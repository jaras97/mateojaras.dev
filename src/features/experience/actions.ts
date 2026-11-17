"use server";

import { eq, max } from "drizzle-orm";
import { updateTag } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { experienceProjects, experienceSkills, experiences } from "@/db/schema";
import type { ActionResult } from "@/lib/action-result";
import { tags } from "@/lib/cache-tags";
import { exportContent } from "@/lib/content-export";
import { requireActionSession } from "@/lib/dal";
import {
  createExperienceSchema,
  experienceDraftSchema,
  experiencePublishSchema,
} from "./validation";

// Draft/publish rules: docs/data-model.md "Reglas". Saving a draft never
// touches a public tag; publish, visible, order and delete do (tags.experience).
// A published row keeps pending column AND relation changes in `draft`; the
// relation tables are only written for a never-published row and on publish.

const idSchema = z.uuid();
const idsSchema = z.array(z.uuid()).min(1);

type Parsed = z.output<typeof experienceDraftSchema>;
type BatchItem = Parameters<typeof db.batch>[0][number];
type Failure = Extract<ActionResult, { ok: false }>;

const TABLES = ["experiences", "experience_skills", "experience_projects"];

const blank = (value: string | null) =>
  value === null || value.trim() === "" ? null : value;

function toColumns(input: Parsed) {
  const { skillIds: _skills, projectIds: _projects, ...columns } = input;
  return {
    ...columns,
    location: blank(input.location),
    endDate: blank(input.endDate),
  };
}

function replaceRelations(
  id: string,
  skillIds: string[],
  projectIds: string[],
): BatchItem[] {
  const items: BatchItem[] = [
    db.delete(experienceSkills).where(eq(experienceSkills.experienceId, id)),
    db
      .delete(experienceProjects)
      .where(eq(experienceProjects.experienceId, id)),
  ];
  if (skillIds.length > 0) {
    items.push(
      db
        .insert(experienceSkills)
        .values(skillIds.map((skillId) => ({ experienceId: id, skillId }))),
    );
  }
  if (projectIds.length > 0) {
    items.push(
      db
        .insert(experienceProjects)
        .values(
          projectIds.map((projectId) => ({ experienceId: id, projectId })),
        ),
    );
  }
  return items;
}

function runBatch(items: BatchItem[]) {
  return db.batch(items as [BatchItem, ...BatchItem[]]);
}

function validationError(error: z.ZodError): Failure {
  const flat = error.flatten((issue) => issue.message);
  return { ok: false, error: "validation", fieldErrors: flat.fieldErrors };
}

function backup() {
  after(() =>
    exportContent({ db, tables: TABLES }).catch((error) =>
      console.error("exportContent failed", error),
    ),
  );
}

async function loadRow(id: string) {
  const rows = await db
    .select()
    .from(experiences)
    .where(eq(experiences.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function createExperience(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  const parsed = createExperienceSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const [last] = await db
      .select({ value: max(experiences.order) })
      .from(experiences);
    const created = await db
      .insert(experiences)
      .values({
        ...parsed.data,
        status: "draft",
        order: (last?.value ?? -1) + 1,
      })
      .returning({ id: experiences.id });
    backup();
    return { ok: true, savedAt: new Date().toISOString(), id: created[0].id };
  } catch (error) {
    console.error("createExperience failed", error);
    return { ok: false, error: "server" };
  }
}

export async function saveExperienceDraft(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  const parsed = experienceDraftSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const row = await loadRow(id);
    if (!row) return { ok: false, error: "not_found" };
    const columns = toColumns(parsed.data);
    if (row.status === "published") {
      await db
        .update(experiences)
        .set({
          draft: {
            ...columns,
            skillIds: parsed.data.skillIds,
            projectIds: parsed.data.projectIds,
          },
        })
        .where(eq(experiences.id, id));
    } else {
      await runBatch([
        db.update(experiences).set(columns).where(eq(experiences.id, id)),
        ...replaceRelations(id, parsed.data.skillIds, parsed.data.projectIds),
      ]);
    }
  } catch (error) {
    console.error("saveExperienceDraft failed", error);
    return { ok: false, error: "server" };
  }
  backup();
  return { ok: true, savedAt: new Date().toISOString() };
}

export async function publishExperience(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  const parsed = experiencePublishSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const row = await loadRow(id);
    if (!row) return { ok: false, error: "not_found" };
    await runBatch([
      db
        .update(experiences)
        .set({ ...toColumns(parsed.data), status: "published", draft: null })
        .where(eq(experiences.id, id)),
      ...replaceRelations(id, parsed.data.skillIds, parsed.data.projectIds),
    ]);
  } catch (error) {
    console.error("publishExperience failed", error);
    return { ok: false, error: "server" };
  }
  updateTag(tags.experience);
  backup();
  return { ok: true, savedAt: new Date().toISOString() };
}

export async function discardExperienceDraft(
  id: string,
): Promise<ActionResult> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  try {
    const row = await loadRow(id);
    if (!row) return { ok: false, error: "not_found" };
    await db
      .update(experiences)
      .set({ draft: null })
      .where(eq(experiences.id, id));
  } catch (error) {
    console.error("discardExperienceDraft failed", error);
    return { ok: false, error: "server" };
  }
  backup();
  return { ok: true, savedAt: new Date().toISOString() };
}

// Structural changes write their column immediately and never use the draft.
const ok = (): ActionResult => ({
  ok: true,
  savedAt: new Date().toISOString(),
});

export async function reorderExperiences(ids: string[]): Promise<ActionResult> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  const parsed = idsSchema.safeParse(ids);
  if (!parsed.success) return { ok: false, error: "validation" };
  try {
    const existing = await db.select({ id: experiences.id }).from(experiences);
    const sent = new Set(parsed.data);
    const sameSet =
      sent.size === parsed.data.length &&
      existing.length === sent.size &&
      existing.every((row) => sent.has(row.id));
    if (!sameSet) return { ok: false, error: "validation" };
    const items: BatchItem[] = parsed.data.map((id, order) =>
      db.update(experiences).set({ order }).where(eq(experiences.id, id)),
    );
    await runBatch(items);
  } catch (error) {
    console.error("reorderExperiences failed", error);
    return { ok: false, error: "server" };
  }
  updateTag(tags.experience);
  after(() =>
    exportContent({ db, tables: ["experiences"] }).catch((error) =>
      console.error("exportContent failed", error),
    ),
  );
  return ok();
}

export async function setExperienceVisible(
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
    await db.update(experiences).set({ visible }).where(eq(experiences.id, id));
    updateTag(tags.experience);
  } catch (error) {
    console.error("setExperienceVisible failed", error);
    return { ok: false, error: "server" };
  }
  after(() =>
    exportContent({ db, tables: ["experiences"] }).catch((error) =>
      console.error("exportContent failed", error),
    ),
  );
  return ok();
}

export async function deleteExperience(
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
    if (confirmName.trim() !== row.company) {
      return { ok: false, error: "validation" };
    }
    // experience_skills and experience_projects cascade from the row.
    await db.delete(experiences).where(eq(experiences.id, id));
    if (row.status === "published") updateTag(tags.experience);
  } catch (error) {
    console.error("deleteExperience failed", error);
    return { ok: false, error: "server" };
  }
  backup();
  return ok();
}
