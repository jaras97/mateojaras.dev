// Loads approved copy from docs/copy.md into the database in DATABASE_URL.
// Usage: pnpm tsx scripts/load-content.ts --target=dev|main [--only=settings,...] [--apply] [--allow-production]
//   --target=dev|main      required; must match the DATABASE_URL host (main = ep-billowing-union)
//   --only=a,b             limit to entities (default: all implemented)
//   --apply                write; without it the run is a dry-run that prints the diff
//   --allow-production     required together with --target=main
// Dry-run by default. Main steps are run by Teo with DATABASE_URL inline.
// Never prints the database URL and never touches auth tables.
import { readFileSync } from "node:fs";
import { eq } from "drizzle-orm";
import { createDb, type Db } from "@/db/client";
import { education, SITE_SETTINGS_ID, siteSettings } from "@/db/schema";
import { educationColumns } from "@/features/education/columns";
import {
  educationFormValues,
  educationPublishSchema,
} from "@/features/education/validation";
import { settingsColumns } from "@/features/site-settings/columns";
import {
  readAbout,
  readHeadline,
  readNow,
} from "@/features/site-settings/copy-doc";
import {
  settingsFormValues,
  settingsPublishSchema,
} from "@/features/site-settings/validation";
import { type LintIssue, lintPair, lintStrings } from "@/lib/content-lint";
import {
  diffFields,
  type FieldChange,
  formatChange,
} from "@/lib/content-load/diff";
import { naturalKey } from "@/lib/content-load/plan";
import { assertTargetMatches, parseLoadArgs } from "@/lib/content-load/target";
import { describeDbTarget } from "@/lib/db-target";
import { requireEnv } from "@/lib/env";
import { textParagraphsToDoc } from "@/lib/rich-text-doc";
import { assertNotProduction } from "@/lib/seed-guard";
import { positioning } from "./content/positioning";
import { loadLocalEnv } from "./lib/env";

type BatchItem = Parameters<Db["batch"]>[0][number];

async function runBatch(db: Db, items: BatchItem[]) {
  if (items.length === 0) return;
  await db.batch(items as [BatchItem, ...BatchItem[]]);
}

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

export const SETTINGS_LOAD_FIELDS = [
  "headlineEn",
  "headlineEs",
  "bioEn",
  "bioEs",
  "nowEn",
  "nowEs",
] as const;

function reportLint(issues: LintIssue[]) {
  if (issues.length === 0) return;
  for (const i of issues)
    console.error(`lint: ${i.path} ${i.kind} ${i.detail}`);
  throw new Error(`lint: ${issues.length} issues, nothing written`);
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
  const changes: FieldChange[] = [];

  if (args.only.has("settings")) {
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
    const issues: LintIssue[] = [];
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
    reportLint(issues);
    const next = settingsPublishSchema.parse({
      ...settingsFormValues(row),
      headlineEn: headline.en,
      headlineEs: headline.es,
      bioEn: about.en,
      bioEs: about.es,
      nowEn: textParagraphsToDoc(now.en),
      nowEs: textParagraphsToDoc(now.es),
    });
    const columns = settingsColumns(next);
    const found = diffFields(
      "settings",
      "site",
      row,
      columns,
      SETTINGS_LOAD_FIELDS,
    );
    for (const change of found) console.log(formatChange(change));
    console.log(`settings: ${found.length} changes`);
    changes.push(...found);
    if (args.apply && found.length > 0) {
      const picked = Object.fromEntries(
        SETTINGS_LOAD_FIELDS.map((f) => [f, columns[f]]),
      );
      await db.batch([
        db
          .update(siteSettings)
          .set({ ...picked, draft: null })
          .where(eq(siteSettings.id, SITE_SETTINGS_ID)),
      ]);
    }
  }

  if (args.only.has("education")) {
    const rows = await db.select().from(education);
    const byKey = new Map(rows.map((r) => [naturalKey("education", r), r]));
    const issues: LintIssue[] = [];
    for (const { source: _source, ...entry } of positioning.education) {
      const key = naturalKey("education", entry);
      issues.push(
        ...lintStrings(entry, `education[${key}]`),
        ...lintPair(entry.programEn, entry.programEs, `education[${key}]`),
      );
    }
    reportLint(issues);
    const statements: BatchItem[] = [];
    const found: FieldChange[] = [];
    for (const { source: _source, order, ...entry } of positioning.education) {
      const key = naturalKey("education", entry);
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
        const diff = diffFields(
          "education",
          key,
          row,
          columns,
          EDUCATION_LOAD_FIELDS,
        );
        const pending = row.draft !== null;
        if (pending)
          console.log(
            `! education[${key}] has a pending draft (will be cleared)`,
          );
        if (diff.length > 0 || pending) {
          found.push(...diff);
          statements.push(
            db
              .update(education)
              .set({ ...columns, draft: null })
              .where(eq(education.id, row.id)),
          );
        }
      } else {
        for (const field of EDUCATION_LOAD_FIELDS)
          found.push({
            entity: "education",
            key,
            field,
            before: null,
            after: columns[field],
          });
        statements.push(db.insert(education).values(columns));
      }
    }
    for (const change of found) console.log(formatChange(change));
    console.log(`education: ${found.length} changes`);
    changes.push(...found);
    if (args.apply) await runBatch(db, statements);
  }

  console.log(`total: ${changes.length} changes`);
  console.log(args.apply ? "applied" : "dry-run: nothing written");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "load-content failed");
  process.exitCode = 1;
});
