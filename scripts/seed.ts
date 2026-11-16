// Seeds docs/content into the database in DATABASE_URL.
// Usage: pnpm seed            (refuses when a content table already has rows)
//        pnpm seed --force    (upserts by slug; idempotent)
// Projects only for now. Never touches auth tables, never runs in the build.
import { count, eq, sql } from "drizzle-orm";
import { createDb } from "@/db/client";
import { projects } from "@/db/schema";
import { loadContentDir } from "@/features/projects/content-file";
import { validateProjectContent } from "@/features/projects/content-schema";
import { projectRowFromContent } from "@/features/projects/seed-map";
import { describeDbTarget } from "@/lib/db-target";
import { requireEnv } from "@/lib/env";
import { loadLocalEnv } from "./lib/env";

async function main() {
  loadLocalEnv();
  const url = requireEnv("DATABASE_URL");
  console.log(`seed target: ${describeDbTarget(url)}`);
  const db = createDb(url);

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

  const [first, ...rest] = rows.map((row) =>
    db
      .insert(projects)
      .values(row)
      .onConflictDoUpdate({
        target: projects.slug,
        set: { ...row, updatedAt: sql`now()` },
      }),
  );
  await db.batch([first, ...rest]);

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
