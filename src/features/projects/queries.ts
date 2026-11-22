// Public reads of projects. Cores take explicit arguments (and are the Plan B
// seam); the cached wrappers never read the locale (GHSA-vc7v surface), the
// page applies localized() afterwards.
import { and, asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { draftMode } from "next/headers";
import { db } from "@/db";
import type { Db } from "@/db/client";
import { projectSkills, projects, skills } from "@/db/schema";
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

// Rows the sitemap lists: same published+visible filter and order as the
// slug list. Drafts and hidden projects never appear (SEO-03).
export function sitemapProjectsQuery(handle: Db) {
  return handle
    .select({ slug: projects.slug, updatedAt: projects.updatedAt })
    .from(projects)
    .where(and(eq(projects.status, "published"), eq(projects.visible, true)))
    .orderBy(asc(projects.order));
}

export async function getSitemapProjectsCore() {
  return sitemapProjectsQuery(db);
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

export async function getSitemapProjects() {
  "use cache";
  cacheTag(tags.projects);
  cacheLife("max");
  return getSitemapProjectsCore();
}

export async function getProject(slug: string) {
  "use cache";
  cacheTag(tags.projects, tags.project(slug));
  cacheLife("max");
  const { isEnabled } = await draftMode();
  return getProjectBySlugCore(slug, { includeDrafts: isEnabled });
}

// Skill names per project for the case header. Public reads keep only
// published, visible skills; order follows the admin order of skills.
export function projectStacksQuery(handle: Db, { includeDrafts }: Opts) {
  const base = handle
    .select({ projectId: projectSkills.projectId, name: skills.name })
    .from(projectSkills)
    .innerJoin(skills, eq(projectSkills.skillId, skills.id));
  return (
    includeDrafts
      ? base
      : base.where(
          and(eq(skills.status, "published"), eq(skills.visible, true)),
        )
  ).orderBy(asc(skills.order));
}

export async function getProjectStacksCore(
  opts: Opts,
): Promise<Record<string, string[]>> {
  const rows = await projectStacksQuery(db, opts);
  const byProject: Record<string, string[]> = {};
  for (const row of rows) {
    byProject[row.projectId] = [...(byProject[row.projectId] ?? []), row.name];
  }
  return byProject;
}

export async function getProjectStacks() {
  "use cache";
  cacheTag(tags.projects, tags.skills);
  cacheLife("max");
  const { isEnabled } = await draftMode();
  return getProjectStacksCore({ includeDrafts: isEnabled });
}
