import { describe, expect, it, vi } from "vitest";
import { createDb } from "@/db/client";

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

const URL = "postgresql://test:test@localhost/test";
vi.stubEnv("DATABASE_URL", URL);
const { experiencesQuery, getExperiencesCore } = await import("./queries");
const db = createDb(URL);

describe("experiencesQuery", () => {
  it("filters to published and visible rows, ordered", () => {
    const { sql, params } = experiencesQuery(db, {
      includeDrafts: false,
    }).toSQL();
    expect(sql).toContain('"experiences"."status" = $1');
    expect(sql).toContain('"experiences"."visible" = $2');
    expect(sql).toContain('order by "experiences"."order"');
    expect(params).toEqual(["published", true]);
  });

  it("does not filter when drafts are included", () => {
    const { sql } = experiencesQuery(db, { includeDrafts: true }).toSQL();
    expect(sql).not.toContain('"experiences"."status" =');
  });
});

describe("getExperiencesCore", () => {
  const row = {
    id: "e1",
    company: "Publicada",
    status: "published",
    draft: { company: "Pendiente", skillIds: [] },
  };

  it("never returns the draft key and keeps the column value publicly", async () => {
    rows.splice(0, rows.length, { ...row });
    const [out] = await getExperiencesCore({ includeDrafts: false });
    expect(out).not.toHaveProperty("draft");
    expect(out.company).toBe("Publicada");
  });

  it("overlays the draft for Draft Mode without exposing it", async () => {
    rows.splice(0, rows.length, { ...row });
    const [out] = await getExperiencesCore({ includeDrafts: true });
    expect(out).not.toHaveProperty("draft");
    expect(out.company).toBe("Pendiente");
  });
});
