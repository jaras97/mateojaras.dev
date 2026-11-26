// Imported by src/proxy.ts: keep it free of guarded server modules and cache APIs.
import { and, asc, eq } from "drizzle-orm";
import { createDb, type Db } from "@/db/client";
import { projects } from "@/db/schema";
import { requireEnv } from "@/lib/env";

export function publishedSlugsQuery(handle: Db) {
  return handle
    .select({ slug: projects.slug })
    .from(projects)
    .where(and(eq(projects.status, "published"), eq(projects.visible, true)))
    .orderBy(asc(projects.order));
}

let handle: Db | undefined;

export async function loadPublishedSlugs(): Promise<string[]> {
  handle ??= createDb(requireEnv("DATABASE_URL"));
  const rows = await publishedSlugsQuery(handle);
  return rows.map((r) => r.slug);
}
