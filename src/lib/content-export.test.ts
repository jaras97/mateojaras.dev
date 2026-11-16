import { mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Db } from "@/db/client";

const put = vi.fn(async () => ({ url: "https://blob.invalid/x" }));
vi.mock("@vercel/blob", () => ({ put }));

const { CONTENT_TABLES, deserializeTable, exportContent, serializeTable } =
  await import("./content-export");

const project = (id: string, n: number) => ({
  id,
  status: "published",
  visible: true,
  order: n,
  createdAt: new Date("2026-11-01T10:00:00.000Z"),
  updatedAt: new Date("2026-11-02T10:00:00.000Z"),
  slug: `p-${n}`,
  titleEn: "T",
  titleEs: "T",
  resultsEn: ["a", "b"],
  metricsEn: [{ label: "x", value: "1" }],
  startedAt: "2024-03-01",
});

// A db whose select().from() yields the same rows for any table.
function fakeDb(rows: Record<string, unknown>[]): Db {
  return { select: () => ({ from: async () => rows }) } as unknown as Db;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  put.mockClear();
});

describe("CONTENT_TABLES", () => {
  it("lists the allowlist in restore order and no private table", () => {
    expect(CONTENT_TABLES.map((t) => t.name)).toEqual([
      "site_settings",
      "skills",
      "projects",
      "experiences",
      "education",
      "resume_versions",
      "project_skills",
      "experience_skills",
      "experience_projects",
    ]);
    const names = CONTENT_TABLES.map((t) => t.name).join(" ");
    expect(names).not.toMatch(/user|session|account|verification|rate|contact/);
  });
});

describe("serializeTable / deserializeTable", () => {
  it("round-trips dates, date strings, jsonb and arrays", () => {
    const row = project("b", 1);
    const back = deserializeTable(
      "projects.json",
      serializeTable("projects", [row]),
    );
    expect(back.name).toBe("projects");
    const r = back.rows[0];
    expect(r.createdAt).toBeInstanceOf(Date);
    expect((r.createdAt as Date).getTime()).toBe(row.createdAt.getTime());
    expect(r.startedAt).toBe("2024-03-01");
    expect(r.metricsEn).toEqual(row.metricsEn);
    expect(r.resultsEn).toEqual(row.resultsEn);
  });

  it("sorts rows by primary key regardless of input order", () => {
    const a = project("a", 1);
    const b = project("b", 2);
    expect(serializeTable("projects", [b, a])).toBe(
      serializeTable("projects", [a, b]),
    );
  });

  it("sorts join rows by their composite key", () => {
    const rows = [
      { projectId: "2", skillId: "1" },
      { projectId: "1", skillId: "2" },
      { projectId: "1", skillId: "1" },
    ];
    const out = JSON.parse(serializeTable("project_skills", rows));
    expect(
      out.rows.map((r: (typeof rows)[number]) => r.projectId + r.skillId),
    ).toEqual(["11", "12", "21"]);
  });

  it("throws naming the file when the table is not allowlisted", () => {
    expect(() =>
      deserializeTable("session.json", '{"table":"session","rows":[]}'),
    ).toThrow(/session\.json/);
  });
});

describe("exportContent", () => {
  it("skips every table on Vercel without a token and warns once", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const results = await exportContent({ db: fakeDb([]) });
    expect(results).toHaveLength(CONTENT_TABLES.length);
    for (const r of results) {
      expect(r).toMatchObject({
        status: "skipped",
        reason: "missing BLOB_READ_WRITE_TOKEN",
      });
    }
    expect(warn).toHaveBeenCalledTimes(1);
    expect(put).not.toHaveBeenCalled();
  });

  it("puts a timestamped backup to Blob with the token", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "test-token");
    await exportContent({
      db: fakeDb([project("a", 1)]),
      tables: ["projects"],
    });
    expect(put).toHaveBeenCalledTimes(1);
    const [path, , options] = put.mock.calls[0] as unknown as [
      string,
      string,
      Record<string, unknown>,
    ];
    expect(path).toMatch(/^backup\/\d{4}-\d{2}-\d{2}T[\d-]+Z\/projects\.json$/);
    expect(options).toMatchObject({
      access: "public",
      contentType: "application/json",
      addRandomSuffix: true,
    });
  });

  it("writes content/<table>.json locally when not on Vercel", async () => {
    vi.stubEnv("VERCEL", "");
    const dir = mkdtempSync(join(tmpdir(), "content-export-"));
    await exportContent({
      db: fakeDb([]),
      tables: ["projects", "skills"],
      dir,
    });
    expect(readdirSync(dir).sort()).toEqual(["projects.json", "skills.json"]);
    expect(put).not.toHaveBeenCalled();
  });

  it("writes to CONTENT_EXPORT_DIR when no dir is given", async () => {
    vi.stubEnv("VERCEL", "");
    const dir = mkdtempSync(join(tmpdir(), "content-export-env-"));
    vi.stubEnv("CONTENT_EXPORT_DIR", dir);
    await exportContent({ db: fakeDb([]), tables: ["skills"] });
    expect(readdirSync(dir)).toEqual(["skills.json"]);
  });
});
