// Loads approved content (docs/copy.md, docs/content, scripts/content/positioning.ts)
// into the database in DATABASE_URL, through the admin publish schemas.
// Usage: pnpm tsx scripts/load-content.ts --target=dev|main [--only=settings,...] [--apply] [--allow-production]
//   --target=dev|main      required; must match the DATABASE_URL host (main = ep-billowing-union)
//   --only=a,b             limit to entities (default: all)
//   --apply                write; without it the run is a dry-run that prints the diff
//   --allow-production     required together with --target=main
// Dry-run by default. Main steps are run by Teo with DATABASE_URL inline.
// Everything is planned and linted before the first write; each entity group is
// then written in one db.batch (neon-http has no interactive transactions). New rows get
// their ids up front so later groups can reference them in the same run.
// Never prints the database URL and never touches auth tables. Never writes a
// project's media or cover image, and never touches experiences that
// positioning.ts does not list.
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { eq } from "drizzle-orm";
import { createDb, type Db } from "@/db/client";
import {
  education,
  experienceProjects,
  experienceSkills,
  experiences,
  projectSkills,
  projects,
  SITE_SETTINGS_ID,
  siteSettings,
  skills,
} from "@/db/schema";
import { educationColumns } from "@/features/education/columns";
import {
  educationFormValues,
  educationPublishSchema,
} from "@/features/education/validation";
import { experienceColumns } from "@/features/experience/columns";
import {
  experienceFormValues,
  experiencePublishSchema,
} from "@/features/experience/validation";
import { projectColumns } from "@/features/projects/columns";
import { loadContentDir } from "@/features/projects/content-file";
import { validateProjectContent } from "@/features/projects/content-schema";
import { projectRowFromContent } from "@/features/projects/seed-map";
import {
  projectDraftSchema,
  projectFormValues,
  projectPublishSchema,
} from "@/features/projects/validation";
import { settingsColumns } from "@/features/site-settings/columns";
import {
  readAbout,
  readFreelanceBullets,
  readHeadline,
  readNow,
} from "@/features/site-settings/copy-doc";
import {
  settingsFormValues,
  settingsPublishSchema,
} from "@/features/site-settings/validation";
import { skillColumns } from "@/features/skills/columns";
import {
  skillFormValues,
  skillPublishSchema,
} from "@/features/skills/validation";
import { type LintIssue, lintPair, lintStrings } from "@/lib/content-lint";
import { diffFields, formatChange } from "@/lib/content-load/diff";
import {
  isManagedExperience,
  naturalKey,
  planRenames,
  planRetire,
  projectUpdateSet,
} from "@/lib/content-load/plan";
import { assertTargetMatches, parseLoadArgs } from "@/lib/content-load/target";
import { describeDbTarget } from "@/lib/db-target";
import { requireEnv } from "@/lib/env";
import { textParagraphsToDoc } from "@/lib/rich-text-doc";
import { assertNotProduction } from "@/lib/seed-guard";
import { positioning } from "./content/positioning";
import { loadLocalEnv } from "./lib/env";

type BatchItem = Parameters<Db["batch"]>[0][number];

type Group = {
  entity: string;
  lines: string[];
  count: number;
  statements: BatchItem[];
};

const newGroup = (entity: string): Group => ({
  entity,
  lines: [],
  count: 0,
  statements: [],
});

export const EDUCATION_LOAD_FIELDS = [
  "institution",
  "programEn",
  "programEs",
  "startDate",
  "endDate",
  "statusEn",
  "statusEs",
  "order",
  "status",
] as const;

const SKILL_LOAD_FIELDS = [
  "name",
  "category",
  "icon",
  "yearsUsed",
  "featured",
  "order",
  "status",
] as const;

const EXPERIENCE_LOAD_FIELDS = [
  "company",
  "roleEn",
  "roleEs",
  "type",
  "location",
  "startDate",
  "endDate",
  "bulletsEn",
  "bulletsEs",
  "order",
  "status",
] as const;

export const SETTINGS_LOAD_FIELDS = [
  "headlineEn",
  "headlineEs",
  "bioEn",
  "bioEs",
  "nowEn",
  "nowEs",
] as const;

const SEO_LOAD_FIELDS = [
  "seoTitleEn",
  "seoTitleEs",
  "seoDescriptionEn",
  "seoDescriptionEs",
] as const;

const NO_LINT_PROJECT_KEYS = new Set([
  "slug",
  "liveUrl",
  "repoUrl",
  "media",
  "coverImage",
  "startedAt",
  "finishedAt",
]);

function reportLint(issues: LintIssue[]) {
  if (issues.length === 0) return;
  for (const i of issues)
    console.error(`lint: ${i.path} ${i.kind} ${i.detail}`);
  throw new Error(`lint: ${issues.length} issues, nothing written`);
}

// Lints every string and every En/Es pair of a flat payload.
function lintBilingual(payload: Record<string, unknown>, path: string) {
  const issues = lintStrings(payload, path);
  for (const key of Object.keys(payload)) {
    if (!key.endsWith("En")) continue;
    const base = key.slice(0, -2);
    const es = payload[`${base}Es`];
    if (es !== undefined) {
      issues.push(...lintPair(payload[key], es, `${path}.${base}`));
    }
  }
  return issues;
}

function noteDraft(group: Group, key: string, row: { draft: unknown }) {
  if (row.draft === null || row.draft === undefined) return false;
  group.lines.push(
    `! ${group.entity}[${key}] has a pending draft (will be cleared)`,
  );
  group.lines.push(`~ ${group.entity}[${key}].draft: "pending" -> "cleared"`);
  group.count += 1;
  return true;
}

function noteChanges(
  group: Group,
  changes: ReturnType<typeof diffFields>,
): void {
  for (const change of changes) group.lines.push(formatChange(change));
  group.count += changes.length;
}

function sameSet(a: string[], b: string[]) {
  return (
    a.length === b.length && [...a].sort().join("|") === [...b].sort().join("|")
  );
}

function noteRelation(
  group: Group,
  key: string,
  field: string,
  before: string[],
  after: string[],
): boolean {
  if (sameSet(before, after)) return false;
  group.lines.push(
    `~ ${group.entity}[${key}].${field}: ${JSON.stringify([...before].sort())} -> ${JSON.stringify([...after].sort())}`,
  );
  group.count += 1;
  return true;
}

async function main() {
  loadLocalEnv();
  const url = requireEnv("DATABASE_URL");
  const described = describeDbTarget(url);
  console.log(`target: ${described}`);
  const args = parseLoadArgs(process.argv.slice(2));
  assertTargetMatches(args.target, described);
  assertNotProduction({
    target: described,
    vercelEnv: process.env.VERCEL_ENV,
    allow: args.allowProduction,
  });
  const db = createDb(url);
  const copy = readFileSync("docs/copy.md", "utf8");
  const issues: LintIssue[] = [];
  const groups: Group[] = [];

  const skillRows = await db.select().from(skills);
  const projectRows = await db.select().from(projects);
  const projectSkillRows = await db.select().from(projectSkills);
  const experienceRows = await db.select().from(experiences);
  const experienceSkillRows = await db.select().from(experienceSkills);
  const experienceProjectRows = await db.select().from(experienceProjects);

  // name/slug -> id, including rows this run is about to insert.
  const skillIds = new Map(skillRows.map((r) => [r.name, r.id]));
  const skillNames = new Map(skillRows.map((r) => [r.id, r.name]));
  const projectIds = new Map(projectRows.map((r) => [r.slug, r.id]));

  // 1. retire
  if (args.only.has("retire")) {
    const group = newGroup("retire");
    const slugs = planRetire(
      positioning.retiredSlugs,
      projectRows.map((r) => r.slug),
    );
    for (const slug of slugs) {
      group.lines.push(`- projects[${slug}] retire`);
      group.count += 1;
      group.statements.push(db.delete(projects).where(eq(projects.slug, slug)));
      projectIds.delete(slug);
    }
    groups.push(group);
  }

  // 2. skills
  if (args.only.has("skills")) {
    const group = newGroup("skills");
    const byName = new Map(skillRows.map((r) => [r.name, r]));
    for (const { source: _source, order, ...entry } of positioning.skills) {
      const key = naturalKey("skills", entry);
      issues.push(...lintStrings(entry, `skills[${key}]`));
      const row = byName.get(key);
      const parsed = skillPublishSchema.parse({
        ...(row ? skillFormValues(row) : { icon: "" }),
        ...entry,
      });
      const columns = {
        ...skillColumns(parsed),
        order,
        status: "published" as const,
      };
      if (row) {
        const cleared = noteDraft(group, key, row);
        const found = diffFields(
          "skills",
          key,
          row,
          columns,
          SKILL_LOAD_FIELDS,
        );
        noteChanges(group, found);
        if (found.length > 0 || cleared) {
          group.statements.push(
            db
              .update(skills)
              .set({ ...columns, draft: null })
              .where(eq(skills.id, row.id)),
          );
        }
      } else {
        const id = randomUUID();
        skillIds.set(key, id);
        skillNames.set(id, key);
        group.lines.push(`+ skills[${key}] new`);
        group.count += 1;
        group.statements.push(db.insert(skills).values({ id, ...columns }));
      }
    }
    groups.push(group);
  }

  // 3. projects
  if (args.only.has("projects")) {
    const group = newGroup("projects");
    const renames = planRenames(
      positioning.slugRenames,
      projectRows.map((r) => r.slug),
    );
    const rowsBySlug = new Map(projectRows.map((r) => [r.slug, r]));
    for (const { from, to } of renames) {
      const row = rowsBySlug.get(from);
      if (!row) continue;
      group.lines.push(`~ projects[${from}].slug: "${from}" -> "${to}"`);
      group.count += 1;
      group.statements.push(
        db.update(projects).set({ slug: to }).where(eq(projects.id, row.id)),
      );
      rowsBySlug.delete(from);
      rowsBySlug.set(to, { ...row, slug: to });
      projectIds.delete(from);
      projectIds.set(to, row.id);
    }
    const currentSkills = new Map<string, string[]>();
    for (const r of projectSkillRows) {
      const list = currentSkills.get(r.projectId) ?? [];
      list.push(r.skillId);
      currentSkills.set(r.projectId, list);
    }

    const files = loadContentDir("docs/content");
    for (const [index, { file, content }] of files.entries()) {
      const { issues: contentIssues } = validateProjectContent(content);
      if (contentIssues.length > 0)
        throw new Error(`${file}: ${contentIssues.join("; ")}`);
      const base = projectRowFromContent(content, index);
      const slug = base.slug;
      const placement = positioning.projects.find((p) => p.slug === slug);
      if (!placement) {
        group.lines.push(
          `  projects[${slug}] has no placement in positioning.ts (skipped)`,
        );
        continue;
      }
      const row = rowsBySlug.get(slug);
      const ids = placement.skillNames.map((name) => {
        const id = skillIds.get(name);
        if (!id) throw new Error(`projects[${slug}]: unknown skill "${name}"`);
        return id;
      });
      const publish = placement.publish && base.status === "published";
      // caseStudy is authored in the admin editor; docs/content has none.
      const {
        caseStudyEn: _ce,
        caseStudyEs: _cs,
        status: _status,
        visible: _visible,
        order: _order,
        ...contentFields
      } = base;
      const payload = {
        ...(row ? projectFormValues(row, currentSkills.get(row.id) ?? []) : {}),
        ...contentFields,
        skillIds: ids,
        media: row?.media ?? null,
        coverImage: row?.coverImage ?? null,
      };
      const parsed = publish
        ? projectPublishSchema.parse(payload)
        : projectDraftSchema.parse(payload);
      const columns = projectColumns(parsed);
      const lintable = Object.fromEntries(
        Object.entries(columns).filter(([k]) => !NO_LINT_PROJECT_KEYS.has(k)),
      );
      issues.push(...lintBilingual(lintable, `projects[${slug}]`));
      const set = {
        ...projectUpdateSet(columns),
        status: publish ? ("published" as const) : ("draft" as const),
        order: placement.order,
        featured: placement.featured,
        visible: placement.visible,
      };
      const relationItems = (id: string): BatchItem[] => {
        const items: BatchItem[] = [
          db.delete(projectSkills).where(eq(projectSkills.projectId, id)),
        ];
        if (ids.length > 0)
          items.push(
            db
              .insert(projectSkills)
              .values(ids.map((skillId) => ({ projectId: id, skillId }))),
          );
        return items;
      };
      if (row) {
        const cleared = noteDraft(group, slug, row);
        const found = diffFields("projects", slug, row, set, Object.keys(set));
        noteChanges(group, found);
        const relChanged = noteRelation(
          group,
          slug,
          "skills",
          (currentSkills.get(row.id) ?? []).map(
            (id) => skillNames.get(id) ?? id,
          ),
          placement.skillNames,
        );
        if (found.length > 0 || cleared || relChanged) {
          group.statements.push(
            db
              .update(projects)
              .set({ ...set, draft: null })
              .where(eq(projects.id, row.id)),
            ...relationItems(row.id),
          );
        }
      } else {
        const id = randomUUID();
        projectIds.set(slug, id);
        group.lines.push(`+ projects[${slug}] new`);
        group.count += 1;
        group.statements.push(
          db.insert(projects).values({ id, ...columns, ...set }),
          ...relationItems(id),
        );
      }
    }
    groups.push(group);
  }

  // 4. experiences (only the ones positioning.ts lists)
  if (args.only.has("experiences")) {
    const group = newGroup("experiences");
    const freelance = readFreelanceBullets(copy);
    const managed = experienceRows.filter((r) =>
      isManagedExperience(r, positioning.experiences),
    );
    const byKey = new Map(
      managed.map((r) => [naturalKey("experiences", r), r]),
    );
    for (const entry of positioning.experiences) {
      const key = naturalKey("experiences", entry);
      const bullets =
        entry.bullets === "copy:freelance" ? freelance : entry.bullets;
      const skillIdList = entry.skillNames.map((name) => {
        const id = skillIds.get(name);
        if (!id)
          throw new Error(`experiences[${key}]: unknown skill "${name}"`);
        return id;
      });
      const projectIdList = entry.projectSlugs.map((slug) => {
        const id = projectIds.get(slug);
        if (!id)
          throw new Error(`experiences[${key}]: unknown project "${slug}"`);
        return id;
      });
      const row = byKey.get(key);
      const curSkills = experienceSkillRows
        .filter((r) => r.experienceId === row?.id)
        .map((r) => r.skillId);
      const curProjects = experienceProjectRows
        .filter((r) => r.experienceId === row?.id)
        .map((r) => r.projectId);
      const payload = {
        ...(row ? experienceFormValues(row, curSkills, curProjects) : {}),
        company: entry.company,
        roleEn: entry.roleEn,
        roleEs: entry.roleEs,
        type: entry.type,
        location: entry.location,
        startDate: entry.startDate,
        endDate: entry.endDate,
        bulletsEn: bullets.en,
        bulletsEs: bullets.es,
        skillIds: skillIdList,
        projectIds: projectIdList,
      };
      const parsed = experiencePublishSchema.parse(payload);
      const columns = {
        ...experienceColumns(parsed),
        order: entry.order,
        status: "published" as const,
      };
      issues.push(
        ...lintBilingual(
          {
            roleEn: columns.roleEn,
            roleEs: columns.roleEs,
            bulletsEn: columns.bulletsEn,
            bulletsEs: columns.bulletsEs,
          },
          `experiences[${key}]`,
        ),
      );
      const relationItems = (id: string): BatchItem[] => {
        const items: BatchItem[] = [
          db
            .delete(experienceSkills)
            .where(eq(experienceSkills.experienceId, id)),
          db
            .delete(experienceProjects)
            .where(eq(experienceProjects.experienceId, id)),
        ];
        if (skillIdList.length > 0)
          items.push(
            db
              .insert(experienceSkills)
              .values(
                skillIdList.map((skillId) => ({ experienceId: id, skillId })),
              ),
          );
        if (projectIdList.length > 0)
          items.push(
            db.insert(experienceProjects).values(
              projectIdList.map((projectId) => ({
                experienceId: id,
                projectId,
              })),
            ),
          );
        return items;
      };
      if (row) {
        const cleared = noteDraft(group, key, row);
        const found = diffFields(
          "experiences",
          key,
          row,
          columns,
          EXPERIENCE_LOAD_FIELDS,
        );
        noteChanges(group, found);
        const skillChanged = noteRelation(
          group,
          key,
          "skills",
          curSkills.map((id) => skillNames.get(id) ?? id),
          entry.skillNames,
        );
        const projectChanged = noteRelation(
          group,
          key,
          "projects",
          curProjects.map(
            (id) => [...projectIds].find(([, v]) => v === id)?.[0] ?? id,
          ),
          entry.projectSlugs,
        );
        if (found.length > 0 || cleared || skillChanged || projectChanged) {
          group.statements.push(
            db
              .update(experiences)
              .set({ ...columns, draft: null })
              .where(eq(experiences.id, row.id)),
            ...relationItems(row.id),
          );
        }
      } else {
        const id = randomUUID();
        group.lines.push(`+ experiences[${key}] new`);
        group.count += 1;
        group.statements.push(
          db.insert(experiences).values({ id, ...columns }),
          ...relationItems(id),
        );
      }
    }
    groups.push(group);
  }

  // 5. education
  if (args.only.has("education")) {
    const group = newGroup("education");
    const rows = await db.select().from(education);
    const byKey = new Map(rows.map((r) => [naturalKey("education", r), r]));
    for (const { source: _source, order, ...entry } of positioning.education) {
      const key = naturalKey("education", entry);
      issues.push(
        ...lintStrings(entry, `education[${key}]`),
        ...lintPair(entry.programEn, entry.programEs, `education[${key}]`),
      );
      const row = byKey.get(key);
      const parsed = educationPublishSchema.parse({
        ...(row ? educationFormValues(row) : {}),
        ...entry,
      });
      const columns = {
        ...educationColumns(parsed),
        order,
        status: "published" as const,
      };
      if (row) {
        const cleared = noteDraft(group, key, row);
        const found = diffFields(
          "education",
          key,
          row,
          columns,
          EDUCATION_LOAD_FIELDS,
        );
        noteChanges(group, found);
        if (found.length > 0 || cleared) {
          group.statements.push(
            db
              .update(education)
              .set({ ...columns, draft: null })
              .where(eq(education.id, row.id)),
          );
        }
      } else {
        group.lines.push(`+ education[${key}] new`);
        group.count += 1;
        group.statements.push(db.insert(education).values(columns));
      }
    }
    groups.push(group);
  }

  // 6. settings
  if (args.only.has("settings")) {
    const group = newGroup("settings");
    const [row] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, SITE_SETTINGS_ID))
      .limit(1);
    if (!row)
      throw new Error("site_settings: la fila no existe. Corre pnpm seed.");
    const headline = readHeadline(copy);
    const about = readAbout(copy);
    const now = readNow(copy);
    const texts = {
      headline: [headline.en, headline.es],
      bio: [about.en, about.es],
    } as const;
    for (const [name, [en, es]] of Object.entries(texts)) {
      issues.push(
        ...lintStrings(en, `${name}_en`),
        ...lintStrings(es, `${name}_es`),
        ...lintPair(en, es, name),
      );
    }
    issues.push(
      ...lintStrings(now.en, "now_en", { scope: "now" }),
      ...lintStrings(now.es, "now_es", { scope: "now" }),
      ...lintPair(now.en, now.es, "now"),
    );
    const seo = positioning.seo;
    if (seo) {
      issues.push(
        ...lintBilingual(
          {
            seoTitleEn: seo.titleEn,
            seoTitleEs: seo.titleEs,
            seoDescriptionEn: seo.descriptionEn,
            seoDescriptionEs: seo.descriptionEs,
          },
          "seo",
        ),
      );
    }
    const next = settingsPublishSchema.parse({
      ...settingsFormValues(row),
      headlineEn: headline.en,
      headlineEs: headline.es,
      bioEn: about.en,
      bioEs: about.es,
      nowEn: textParagraphsToDoc(now.en),
      nowEs: textParagraphsToDoc(now.es),
      ...(seo
        ? {
            seoTitleEn: seo.titleEn,
            seoTitleEs: seo.titleEs,
            seoDescriptionEn: seo.descriptionEn,
            seoDescriptionEs: seo.descriptionEs,
          }
        : {}),
    });
    const columns = settingsColumns(next);
    const fields: readonly (
      | (typeof SETTINGS_LOAD_FIELDS)[number]
      | (typeof SEO_LOAD_FIELDS)[number]
    )[] = seo
      ? [...SETTINGS_LOAD_FIELDS, ...SEO_LOAD_FIELDS]
      : SETTINGS_LOAD_FIELDS;
    const found = diffFields("settings", "site", row, columns, fields);
    noteChanges(group, found);
    if (found.length > 0) {
      const picked = Object.fromEntries(fields.map((f) => [f, columns[f]]));
      group.statements.push(
        db
          .update(siteSettings)
          .set({ ...picked, draft: null })
          .where(eq(siteSettings.id, SITE_SETTINGS_ID)),
      );
    }
    groups.push(group);
  }

  // Lint everything before the first write.
  reportLint(issues);

  let total = 0;
  for (const group of groups) {
    for (const line of group.lines) console.log(line);
    console.log(`${group.entity}: ${group.count} changes`);
    total += group.count;
  }
  console.log(`total: ${total} changes`);

  if (args.apply) {
    for (const group of groups) {
      if (group.statements.length === 0) continue;
      await db.batch(group.statements as [BatchItem, ...BatchItem[]]);
    }
    console.log("applied");
  } else {
    console.log("dry-run: nothing written");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "load-content failed");
  process.exitCode = 1;
});
