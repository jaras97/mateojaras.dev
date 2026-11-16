// Seeds docs/content into the database in DATABASE_URL.
// Usage: pnpm seed                         (refuses when a content table already has rows)
//        pnpm seed --force                 (inserts only missing rows, never updates; idempotent)
//        pnpm seed --from-content --force  (full restore of the 9 content tables from content/*.json)
//        --allow-production                (required when the target is Neon main or VERCEL_ENV=production)
// Every mode ends by creating or re-hashing the single admin (ADMIN_EMAIL/ADMIN_PASSWORD).
// Never deletes or exports auth tables, never runs in the build.
import { readFileSync } from "node:fs";
import { betterAuth } from "better-auth";
import { count, eq } from "drizzle-orm";
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
import { assertNotProduction, assertSeedable } from "@/lib/seed-guard";
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
  const target = describeDbTarget(url);
  console.log(`seed target: ${target}`);
  assertNotProduction({
    target,
    vercelEnv: process.env.VERCEL_ENV,
    allow: process.argv.includes("--allow-production"),
  });
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

  // No unique index on experiences or education: when the table has any row
  // (possibly edited in the admin) its facts are not seeded at all.
  const [{ n: experienceCount }] = await db
    .select({ n: count() })
    .from(experiences);
  const [{ n: educationCount }] = await db
    .select({ n: count() })
    .from(education);
  const experienceStatements =
    experienceCount > 0
      ? []
      : experienceFacts(freelance).map((fact) =>
          db.insert(experiences).values({ ...fact, status: "published" }),
        );
  const educationStatements =
    educationCount > 0
      ? []
      : educationFacts.map((fact) =>
          db.insert(education).values({ ...fact, status: "published" }),
        );
  if (experienceCount > 0)
    console.log(
      `experiences: ${experienceCount} filas existentes, no se siembran hechos`,
    );
  if (educationCount > 0)
    console.log(
      `education: ${educationCount} filas existentes, no se siembran hechos`,
    );

  const [first, ...rest] = [
    db
      .insert(siteSettings)
      .values(settingsRow)
      .onConflictDoNothing({ target: siteSettings.id }),
    ...rows.map((row) =>
      db
        .insert(projects)
        .values(row)
        .onConflictDoNothing({ target: projects.slug }),
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
  const [{ total }] = await db.select({ total: count() }).from(projects);
  const inserted = total - n;
  console.log(
    `seeded projects: ${inserted} inserted, ${rows.length - inserted} kept (${published} published)`,
  );
  await seedAdmin(db);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "seed failed");
  process.exitCode = 1;
});
