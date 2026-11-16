// Seeds docs/content into the database in DATABASE_URL.
// Usage: pnpm seed                         (refuses when a content table already has rows)
//        pnpm seed --force                 (upserts by slug; idempotent)
//        pnpm seed --from-content --force  (restores content/*.json, replacing the content tables)
// Never touches auth tables, never runs in the build.
import { readFileSync } from "node:fs";
import { count, eq, sql } from "drizzle-orm";
import { createDb, type Db } from "@/db/client";
import {
  education,
  experiences,
  projects,
  SITE_SETTINGS_ID,
  siteSettings,
} from "@/db/schema";
import { loadContentDir } from "@/features/projects/content-file";
import { validateProjectContent } from "@/features/projects/content-schema";
import { projectRowFromContent } from "@/features/projects/seed-map";
import { heroFixture } from "@/features/site-settings/fixture";
import { CONTENT_TABLES, restoreContent } from "@/lib/content-export";
import { describeDbTarget } from "@/lib/db-target";
import { requireEnv } from "@/lib/env";
import { assertSeedable } from "@/lib/seed-guard";
import { loadLocalEnv } from "./lib/env";
import {
  copyFacts,
  educationFacts,
  experienceFacts,
  siteFacts,
} from "./lib/seed-facts";

async function seedFromContent(db: Db) {
  const filesByName: Record<string, string> = {};
  for (const { name } of CONTENT_TABLES) {
    const path = `content/${name}.json`;
    try {
      filesByName[name] = readFileSync(path, "utf8");
    } catch (error) {
      throw new Error(`${path}: file is missing or unreadable`, {
        cause: error,
      });
    }
  }
  const [{ n }] = await db.select({ n: count() }).from(projects);
  assertSeedable({
    nonEmptyTables: n > 0 ? ["projects"] : [],
    force: process.argv.includes("--force"),
  });
  await restoreContent(db, filesByName);
  console.log(`restored ${CONTENT_TABLES.length} tables from content/`);
}

async function main() {
  loadLocalEnv();
  const url = requireEnv("DATABASE_URL");
  console.log(`seed target: ${describeDbTarget(url)}`);
  const db = createDb(url);

  if (process.argv.includes("--from-content")) {
    await seedFromContent(db);
    return;
  }

  const files = loadContentDir("docs/content");
  const rows = files.map(({ file, content }, index) => {
    const { issues } = validateProjectContent(content);
    if (issues.length > 0) throw new Error(`${file}: ${issues.join("; ")}`);
    return projectRowFromContent(content, index);
  });
  if (!rows.some((r) => r.status === "published")) {
    throw new Error(
      "Ningún proyecto publicado: generateStaticParams lo necesita",
    );
  }

  const [{ n }] = await db.select({ n: count() }).from(projects);
  assertSeedable({
    nonEmptyTables: n > 0 ? ["projects"] : [],
    force: process.argv.includes("--force"),
  });

  const { about, freelance } = copyFacts();
  const settingsRow = {
    id: SITE_SETTINGS_ID,
    ...siteFacts,
    headlineEn: heroFixture.headlineEn,
    headlineEs: heroFixture.headlineEs,
    bioEn: about.en,
    bioEs: about.es,
    availabilityStatus: heroFixture.availabilityStatus,
    availableFrom: heroFixture.availableFrom,
    timezone: heroFixture.timezone,
    location: heroFixture.location,
  };

  // No unique index on experiences or education: match the natural key.
  const existingExperiences = await db.select().from(experiences);
  const existingEducation = await db.select().from(education);
  const experienceStatements = experienceFacts(freelance).map((fact) => {
    const match = existingExperiences.find(
      (e) => e.company === fact.company && e.startDate === fact.startDate,
    );
    return match
      ? db
          .update(experiences)
          .set({ ...fact, updatedAt: sql`now()` })
          .where(eq(experiences.id, match.id))
      : db.insert(experiences).values({ ...fact, status: "published" });
  });
  const educationStatements = educationFacts.map((fact) => {
    const match = existingEducation.find(
      (e) => e.institution === fact.institution,
    );
    return match
      ? db
          .update(education)
          .set({ ...fact, updatedAt: sql`now()` })
          .where(eq(education.id, match.id))
      : db.insert(education).values({ ...fact, status: "published" });
  });

  const [first, ...rest] = [
    db
      .insert(siteSettings)
      .values(settingsRow)
      .onConflictDoUpdate({
        target: siteSettings.id,
        set: { ...settingsRow, updatedAt: sql`now()` },
      }),
    ...rows.map((row) =>
      db
        .insert(projects)
        .values(row)
        .onConflictDoUpdate({
          target: projects.slug,
          set: { ...row, updatedAt: sql`now()` },
        }),
    ),
    ...experienceStatements,
    ...educationStatements,
  ];
  await db.batch([first, ...rest] as never);

  const [{ published }] = await db
    .select({ published: count() })
    .from(projects)
    .where(eq(projects.status, "published"));
  if (published === 0)
    throw new Error("La siembra dejó cero proyectos publicados");
  console.log(`seeded projects: ${rows.length} (${published} published)`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "seed failed");
  process.exitCode = 1;
});
