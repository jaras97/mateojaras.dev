"use server";

import { and, eq, max, ne } from "drizzle-orm";
import { updateTag } from "next/cache";
import { after } from "next/server";
import type { z } from "zod";
import { db } from "@/db";
import { projectSkills, projects } from "@/db/schema";
import type { ActionResult } from "@/lib/action-result";
import { tags } from "@/lib/cache-tags";
import { exportContent } from "@/lib/content-export";
import { requireActionSession } from "@/lib/dal";
import {
  createProjectSchema,
  projectDraftSchema,
  projectPublishSchema,
  SLUG_LOCKED_MESSAGE,
  SLUG_TAKEN_MESSAGE,
} from "./validation";

// Draft/publish rules: docs/data-model.md "Reglas". Saving never touches a
// public tag; only publishing does, and only tags.projects + tags.project(slug).

type Parsed = z.output<typeof projectDraftSchema>;
type BatchItem = Parameters<typeof db.batch>[0][number];

const blank = (value: string | null) =>
  value === null || value.trim() === "" ? null : value;

// Form values -> column values: empty strings become null for nullable columns.
function toColumns(input: Parsed) {
  const { skillIds: _skillIds, ...columns } = input;
  return {
    ...columns,
    taglineEn: blank(input.taglineEn),
    taglineEs: blank(input.taglineEs),
    problemEn: blank(input.problemEn),
    problemEs: blank(input.problemEs),
    roleEn: blank(input.roleEn),
    roleEs: blank(input.roleEs),
    solutionEn: blank(input.solutionEn),
    solutionEs: blank(input.solutionEs),
    liveUrl: blank(input.liveUrl),
    repoUrl: blank(input.repoUrl),
    coverImage: blank(input.coverImage),
    startedAt: blank(input.startedAt),
    finishedAt: blank(input.finishedAt),
  };
}

function replaceSkills(id: string, skillIds: string[]): BatchItem[] {
  const items: BatchItem[] = [
    db.delete(projectSkills).where(eq(projectSkills.projectId, id)),
  ];
  if (skillIds.length > 0) {
    items.push(
      db
        .insert(projectSkills)
        .values(skillIds.map((skillId) => ({ projectId: id, skillId }))),
    );
  }
  return items;
}

function runBatch(items: BatchItem[]) {
  return db.batch(items as [BatchItem, ...BatchItem[]]);
}

type Failure = Extract<ActionResult, { ok: false }>;

function validationError(error: z.ZodError): Failure {
  const flat = error.flatten((issue) => issue.message);
  return { ok: false, error: "validation", fieldErrors: flat.fieldErrors };
}

function backup() {
  after(() =>
    exportContent({ db, tables: ["projects", "project_skills"] }).catch(
      (error) => console.error("exportContent failed", error),
    ),
  );
}

async function loadRow(id: string) {
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  return rows[0] ?? null;
}

// ADMN-09: a published slug is fixed; any slug must be unused by other rows.
async function checkSlug(
  row: { id: string; slug: string; status: "draft" | "published" },
  slug: string,
): Promise<Failure | null> {
  if (row.status === "published" && slug !== row.slug) {
    return {
      ok: false,
      error: "validation",
      fieldErrors: { slug: [SLUG_LOCKED_MESSAGE] },
    };
  }
  if (slug !== row.slug) {
    const taken = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.slug, slug), ne(projects.id, row.id)))
      .limit(1);
    if (taken.length > 0) {
      return {
        ok: false,
        error: "conflict",
        fieldErrors: { slug: [SLUG_TAKEN_MESSAGE] },
      };
    }
  }
  return null;
}

export async function saveProjectDraft(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  const parsed = projectDraftSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const row = await loadRow(id);
  if (!row) return { ok: false, error: "not_found" };
  const rejected = await checkSlug(row, parsed.data.slug);
  if (rejected) return rejected;
  const columns = toColumns(parsed.data);
  try {
    if (row.status === "published") {
      await db
        .update(projects)
        .set({ draft: { ...columns, skillIds: parsed.data.skillIds } })
        .where(eq(projects.id, id));
    } else {
      await runBatch([
        db.update(projects).set(columns).where(eq(projects.id, id)),
        ...replaceSkills(id, parsed.data.skillIds),
      ]);
    }
  } catch (error) {
    console.error("saveProjectDraft failed", error);
    return { ok: false, error: "server" };
  }
  backup();
  return { ok: true, savedAt: new Date().toISOString() };
}

export async function publishProject(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  const parsed = projectPublishSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const row = await loadRow(id);
  if (!row) return { ok: false, error: "not_found" };
  const rejected = await checkSlug(row, parsed.data.slug);
  if (rejected) return rejected;
  const columns = toColumns(parsed.data);
  try {
    await runBatch([
      db
        .update(projects)
        .set({ ...columns, status: "published", draft: null })
        .where(eq(projects.id, id)),
      ...replaceSkills(id, parsed.data.skillIds),
    ]);
  } catch (error) {
    console.error("publishProject failed", error);
    return { ok: false, error: "server" };
  }
  updateTag(tags.projects);
  updateTag(tags.project(row.slug));
  backup();
  return { ok: true, savedAt: new Date().toISOString() };
}

export async function createProject(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  const parsed = createProjectSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const taken = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.slug, parsed.data.slug))
      .limit(1);
    if (taken.length > 0) {
      return {
        ok: false,
        error: "conflict",
        fieldErrors: { slug: [SLUG_TAKEN_MESSAGE] },
      };
    }
    const [last] = await db
      .select({ value: max(projects.order) })
      .from(projects);
    const created = await db
      .insert(projects)
      .values({
        ...parsed.data,
        status: "draft",
        order: (last?.value ?? -1) + 1,
      })
      .returning({ id: projects.id });
    backup();
    return { ok: true, savedAt: new Date().toISOString(), id: created[0].id };
  } catch (error) {
    console.error("createProject failed", error);
    return { ok: false, error: "server" };
  }
}

export async function discardProjectDraft(id: string): Promise<ActionResult> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  const row = await loadRow(id);
  if (!row) return { ok: false, error: "not_found" };
  try {
    await db.update(projects).set({ draft: null }).where(eq(projects.id, id));
  } catch (error) {
    console.error("discardProjectDraft failed", error);
    return { ok: false, error: "server" };
  }
  backup();
  return { ok: true, savedAt: new Date().toISOString() };
}
