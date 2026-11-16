"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { projects } from "@/db/schema";
import type { ActionResult } from "@/lib/action-result";
import { tags } from "@/lib/cache-tags";
import { exportContent } from "@/lib/content-export";
import { requireActionSession } from "@/lib/dal";

// Structural changes of the projects list (03-01 Lectura C): order, visible,
// featured and delete write their column immediately and never go through the
// draft. Each action checks the session first.

const idSchema = z.uuid();
const idsSchema = z.array(z.uuid()).min(1);

const ok = (): ActionResult => ({
  ok: true,
  savedAt: new Date().toISOString(),
});

function backup(tables: string[]) {
  after(() =>
    exportContent({ db, tables }).catch((error) =>
      console.error("exportContent failed", error),
    ),
  );
}

type BatchItem = Parameters<typeof db.batch>[0][number];

export async function reorderProjects(ids: string[]): Promise<ActionResult> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  const parsed = idsSchema.safeParse(ids);
  if (!parsed.success) return { ok: false, error: "validation" };
  try {
    const existing = await db.select({ id: projects.id }).from(projects);
    const sent = new Set(parsed.data);
    const sameSet =
      sent.size === parsed.data.length &&
      existing.length === sent.size &&
      existing.every((row) => sent.has(row.id));
    if (!sameSet) return { ok: false, error: "validation" };
    const items: BatchItem[] = parsed.data.map((id, order) =>
      db.update(projects).set({ order }).where(eq(projects.id, id)),
    );
    await db.batch(items as [BatchItem, ...BatchItem[]]);
  } catch (error) {
    console.error("reorderProjects failed", error);
    return { ok: false, error: "server" };
  }
  updateTag(tags.projects);
  backup(["projects"]);
  return ok();
}

async function setFlag(
  id: string,
  change: { visible: boolean } | { featured: boolean },
): Promise<ActionResult> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  if (!idSchema.safeParse(id).success)
    return { ok: false, error: "validation" };
  try {
    const rows = await db
      .select({ slug: projects.slug })
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);
    const row = rows[0];
    if (!row) return { ok: false, error: "not_found" };
    await db.update(projects).set(change).where(eq(projects.id, id));
    updateTag(tags.projects);
    updateTag(tags.project(row.slug));
  } catch (error) {
    console.error("setProjectFlag failed", error);
    return { ok: false, error: "server" };
  }
  backup(["projects"]);
  return ok();
}

export async function setProjectVisible(
  id: string,
  visible: boolean,
): Promise<ActionResult> {
  if (typeof visible !== "boolean") return { ok: false, error: "validation" };
  return setFlag(id, { visible });
}

export async function setProjectFeatured(
  id: string,
  featured: boolean,
): Promise<ActionResult> {
  if (typeof featured !== "boolean") return { ok: false, error: "validation" };
  return setFlag(id, { featured });
}

export async function deleteProject(
  id: string,
  confirmName: string,
): Promise<ActionResult> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  if (!idSchema.safeParse(id).success || typeof confirmName !== "string") {
    return { ok: false, error: "validation" };
  }
  try {
    const rows = await db
      .select({
        slug: projects.slug,
        titleEs: projects.titleEs,
        status: projects.status,
      })
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);
    const row = rows[0];
    if (!row) return { ok: false, error: "not_found" };
    if (confirmName.trim() !== row.titleEs) {
      return { ok: false, error: "validation" };
    }
    // project_skills and experience_projects cascade from the projects row.
    await db.delete(projects).where(eq(projects.id, id));
    if (row.status === "published") {
      updateTag(tags.projects);
      updateTag(tags.project(row.slug));
    }
  } catch (error) {
    console.error("deleteProject failed", error);
    return { ok: false, error: "server" };
  }
  backup(["projects", "project_skills", "experience_projects"]);
  return ok();
}
