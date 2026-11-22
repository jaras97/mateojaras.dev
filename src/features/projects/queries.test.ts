import { describe, expect, it, vi } from "vitest";
import { createDb } from "@/db/client";

// Fake handle: resolves to whatever `rows` holds, whatever the chain.
const rows: Record<string, unknown>[] = [];
function chain(): unknown {
  const handler: ProxyHandler<object> = {
    get: (_t, prop) =>
      prop === "then"
        ? (resolve: (v: unknown) => void) => resolve(rows)
        : () => new Proxy({}, handler),
  };
  return new Proxy({}, handler);
}
vi.mock("@/db", () => ({ db: { select: () => chain() } }));

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

describe("project cores and drafts", () => {
  const published = {
    id: "p1",
    slug: "a",
    titleEs: "Publicado",
    status: "published",
    draft: { titleEs: "Pendiente", skillIds: [] },
  };

  it("never returns a draft key to public reads and keeps the column title", async () => {
    rows.splice(0, rows.length, { ...published });
    const { getProjectBySlugCore, getProjectsCore } = await import("./queries");
    const one = await getProjectBySlugCore("a", { includeDrafts: false });
    expect(one?.titleEs).toBe("Publicado");
    expect(one && "draft" in one).toBe(false);
    const all = await getProjectsCore({ includeDrafts: false });
    expect(all[0].titleEs).toBe("Publicado");
    expect("draft" in all[0]).toBe(false);
  });

  it("overlays the draft in Draft Mode and still drops the draft key", async () => {
    rows.splice(0, rows.length, { ...published });
    const { getProjectBySlugCore } = await import("./queries");
    const one = await getProjectBySlugCore("a", { includeDrafts: true });
    expect(one?.titleEs).toBe("Pendiente");
    expect(one && "draft" in one).toBe(false);
    expect(one && "skillIds" in one).toBe(false);
  });
});

describe("projectStacksQuery", () => {
  it("joins skills, keeps published visible skills and orders by skills.order", async () => {
    const { projectStacksQuery } = await import("./queries");
    const { sql, params } = projectStacksQuery(db, {
      includeDrafts: false,
    }).toSQL();
    expect(sql).toContain('"project_skills"');
    expect(sql).toContain("inner join");
    expect(sql).toContain('"skills"."status" = $1');
    expect(sql).toContain('"skills"."visible" = $2');
    expect(sql).toContain('order by "skills"."order"');
    expect(params).toEqual(["published", true]);
  });

  it("does not filter when drafts are included", async () => {
    const { projectStacksQuery } = await import("./queries");
    const { sql } = projectStacksQuery(db, { includeDrafts: true }).toSQL();
    expect(sql).not.toContain('"skills"."status" =');
  });
});
