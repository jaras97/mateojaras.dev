// Public reads of projects. Cores take explicit arguments (and are the Plan B
// seam); the cached wrappers never read the locale (GHSA-vc7v surface), the
// page applies localized() afterwards.
import { and, asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { draftMode } from "next/headers";
import { db } from "@/db";
import type { Db } from "@/db/client";
import { projects } from "@/db/schema";
import { tags } from "@/lib/cache-tags";
import { applyDraft, stripDraft } from "@/lib/draft";

type Opts = { includeDrafts: boolean };

export function projectsQuery(handle: Db, { includeDrafts }: Opts) {
  const base = handle.select().from(projects);
  return (
    includeDrafts
      ? base
      : base.where(
          and(eq(projects.status, "published"), eq(projects.visible, true)),
        )
  ).orderBy(asc(projects.order));
}

// Public reads never carry `draft`; Draft Mode overlays it on the columns.
function mapRow<T extends { draft?: unknown }>(row: T, opts: Opts) {
  return opts.includeDrafts ? applyDraft(row) : stripDraft(row);
}

export async function getProjectsCore(opts: Opts) {
  const rows = await projectsQuery(db, opts);
  return rows.map((row) => mapRow(row, opts));
}

export async function getPublishedSlugsCore() {
  const rows = await db
    .select({ slug: projects.slug })
    .from(projects)
    .where(and(eq(projects.status, "published"), eq(projects.visible, true)))
    .orderBy(asc(projects.order));
  return rows.map((r) => r.slug);
}

export async function getProjectBySlugCore(slug: string, opts: Opts) {
  const rows = await db
    .select()
    .from(projects)
    .where(
      opts.includeDrafts
        ? eq(projects.slug, slug)
        : and(
            eq(projects.slug, slug),
            eq(projects.status, "published"),
            eq(projects.visible, true),
          ),
    )
    .limit(1);
  return rows[0] ? mapRow(rows[0], opts) : null;
}

export async function getProjects() {
  "use cache";
  cacheTag(tags.projects);
  cacheLife("max");
  const { isEnabled } = await draftMode();
  return getProjectsCore({ includeDrafts: isEnabled });
}

export async function getProject(slug: string) {
  "use cache";
  cacheTag(tags.projects, tags.project(slug));
  cacheLife("max");
  const { isEnabled } = await draftMode();
  return getProjectBySlugCore(slug, { includeDrafts: isEnabled });
}
