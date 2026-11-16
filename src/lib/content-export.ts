// Content backup: serializes the allowlisted content tables to content/*.json
// locally and to Vercel Blob in production, and restores them for the seed.
// Unguarded (no server-only, no next/*) so scripts and phase 3 actions share it.
// The allowlist is deliberate: auth tables and contact_messages hold password
// hashes, sessions and visitors' messages and must never reach a public repo.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { put } from "@vercel/blob";
import { getTableColumns, type Table } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "@/db/client";
import {
  education,
  experienceProjects,
  experienceSkills,
  experiences,
  projectSkills,
  projects,
  resumeVersions,
  siteSettings,
  skills,
} from "@/db/schema";

type ContentTable = {
  name: string;
  table: Table;
  /** Column property names that form the primary key, in sort order. */
  key: string[];
};

/** Restore order: parents first, join tables last. Allowlist, not denylist. */
export const CONTENT_TABLES: ContentTable[] = [
  { name: "site_settings", table: siteSettings, key: ["id"] },
  { name: "skills", table: skills, key: ["id"] },
  { name: "projects", table: projects, key: ["id"] },
  { name: "experiences", table: experiences, key: ["id"] },
  { name: "education", table: education, key: ["id"] },
  { name: "resume_versions", table: resumeVersions, key: ["id"] },
  {
    name: "project_skills",
    table: projectSkills,
    key: ["projectId", "skillId"],
  },
  {
    name: "experience_skills",
    table: experienceSkills,
    key: ["experienceId", "skillId"],
  },
  {
    name: "experience_projects",
    table: experienceProjects,
    key: ["experienceId", "projectId"],
  },
];

const envelope = z.strictObject({
  table: z.string(),
  rows: z.array(z.record(z.string(), z.unknown())),
});

function find(name: string): ContentTable | undefined {
  return CONTENT_TABLES.find((t) => t.name === name);
}

function sortKey(row: Record<string, unknown>, key: string[]): string {
  return key.map((k) => String(row[k] ?? "")).join("\u0000");
}

/** JSON text for one table: rows sorted by primary key, Dates as ISO strings. */
export function serializeTable(
  name: string,
  rows: Record<string, unknown>[],
): string {
  const entry = find(name);
  if (!entry) throw new Error(`${name}: not a content table`);
  const sorted = [...rows].sort((a, b) => {
    const ka = sortKey(a, entry.key);
    const kb = sortKey(b, entry.key);
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
  return `${JSON.stringify({ table: name, rows: sorted }, null, 2)}\n`;
}

/** Parses a content file: validates the envelope and revives timestamps. */
export function deserializeTable(
  file: string,
  json: string,
): { name: string; rows: Record<string, unknown>[] } {
  try {
    const parsed = envelope.parse(JSON.parse(json));
    const entry = find(parsed.table);
    if (!entry) throw new Error(`unknown table "${parsed.table}"`);
    const columns = getTableColumns(entry.table);
    const timestamps = Object.entries(columns)
      .filter(([, c]) => c.columnType === "PgTimestamp")
      .map(([prop]) => prop);
    const rows = parsed.rows.map((row) => {
      const out = { ...row };
      for (const prop of timestamps) {
        const value = out[prop];
        if (typeof value === "string") out[prop] = new Date(value);
      }
      return out;
    });
    return { name: parsed.table, rows };
  } catch (error) {
    throw new Error(`${file}: ${(error as Error).message}`, { cause: error });
  }
}

export type ExportResult =
  | { table: string; status: "written"; rows: number; target: string }
  | { table: string; status: "skipped"; reason: string };

export async function exportContent({
  db,
  tables = CONTENT_TABLES.map((t) => t.name),
  now = new Date(),
  dir = "content",
}: {
  db: Db;
  tables?: string[];
  now?: Date;
  dir?: string;
}): Promise<ExportResult[]> {
  const onVercel = Boolean(process.env.VERCEL);
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (onVercel && !token) {
    console.warn(
      "exportContent: BLOB_READ_WRITE_TOKEN is missing, no backup was written.",
    );
    return tables.map((table) => ({
      table,
      status: "skipped" as const,
      reason: "missing BLOB_READ_WRITE_TOKEN",
    }));
  }

  const stamp = now.toISOString().replace(/[:.]/g, "-");
  if (!onVercel) mkdirSync(dir, { recursive: true });

  const results: ExportResult[] = [];
  for (const name of tables) {
    const entry = find(name);
    if (!entry) throw new Error(`${name}: not a content table`);
    const rows = (await db.select().from(entry.table as never)) as Record<
      string,
      unknown
    >[];
    const text = serializeTable(name, rows);
    if (onVercel) {
      const path = `backup/${stamp}/${name}.json`;
      await put(path, text, {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: false,
      });
      results.push({
        table: name,
        status: "written",
        rows: rows.length,
        target: path,
      });
    } else {
      const path = join(dir, `${name}.json`);
      writeFileSync(path, text);
      results.push({
        table: name,
        status: "written",
        rows: rows.length,
        target: path,
      });
    }
  }
  return results;
}

/** Replaces every content table with the given files in one db.batch. */
export async function restoreContent(
  db: Db,
  filesByName: Record<string, string>,
): Promise<void> {
  const parsed = CONTENT_TABLES.map((entry) => {
    const json = filesByName[entry.name];
    if (json === undefined) {
      throw new Error(`content/${entry.name}.json: file is missing`);
    }
    const { rows } = deserializeTable(`content/${entry.name}.json`, json);
    return { entry, rows };
  });

  const statements = [
    ...[...parsed].reverse().map(({ entry }) => db.delete(entry.table)),
    ...parsed
      .filter(({ rows }) => rows.length > 0)
      .map(({ entry, rows }) =>
        db.insert(entry.table as never).values(rows as never),
      ),
  ];
  await db.batch(statements as never);
}
