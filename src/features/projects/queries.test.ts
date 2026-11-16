import { describe, expect, it, vi } from "vitest";
import { createDb } from "@/db/client";

// Synthetic URL: .toSQL() never opens a connection. queries.ts imports @/db,
// which reads DATABASE_URL at import time, so it is stubbed before the import.
const URL = "postgresql://test:test@localhost/test";
vi.stubEnv("DATABASE_URL", URL);
const { projectsQuery } = await import("./queries");
const db = createDb(URL);

describe("projectsQuery", () => {
  it("filters to published and visible rows without drafts", () => {
    const { sql, params } = projectsQuery(db, { includeDrafts: false }).toSQL();
    expect(sql).toContain('"projects"."status" = $1');
    expect(sql).toContain('"projects"."visible" = $2');
    expect(params).toEqual(["published", true]);
  });

  it("does not filter status when drafts are included", () => {
    const { sql } = projectsQuery(db, { includeDrafts: true }).toSQL();
    expect(sql).not.toContain('"projects"."status" =');
    expect(sql).not.toContain("where");
  });
});
