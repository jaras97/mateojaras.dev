// Seeds docs/content into the database in DATABASE_URL.
// Usage: pnpm seed                         (refuses when a content table already has rows)
//        pnpm seed --force                 (upserts by slug; idempotent)
//        pnpm seed --from-content --force  (restores content/*.json, replacing the content tables)
// Every mode ends by creating or re-hashing the single admin (ADMIN_EMAIL/ADMIN_PASSWORD).
// Never deletes or exports auth tables, never runs in the build.
import { readFileSync } from "node:fs";
import { betterAuth } from "better-auth";
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
import { authOptions } from "@/lib/auth-options";
import { CONTENT_TABLES, restoreContent } from "@/lib/content-export";
import { describeDbTarget } from "@/lib/db-target";
import { requireEnv } from "@/lib/env";
import { assertSeedable } from "@/lib/seed-guard";
import { ensureAdmin } from "./lib/admin";
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

async function seedAdmin(db: Db) {
  const email = requireEnv("ADMIN_EMAIL");
  const password = requireEnv("ADMIN_PASSWORD");
  if (password.length < 12) {
    console.error("ADMIN_PASSWORD debe tener al menos 12 caracteres");
    process.exit(1);
  }
  const result = await ensureAdmin(betterAuth(authOptions(db)), {
    email,
    password,
    name: siteFacts.name,
  });
  console.log(`admin ${result}`);
}

async function main() {
  loadLocalEnv();
  const url = requireEnv("DATABASE_URL");
  console.log(`seed target: ${describeDbTarget(url)}`);
  const db = createDb(url);

  if (process.argv.includes("--from-content")) {
    await seedFromContent(db);
    await seedAdmin(db);
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
  await seedAdmin(db);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "seed failed");
  process.exitCode = 1;
});
