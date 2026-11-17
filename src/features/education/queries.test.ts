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
const { educationQuery, getEducationCore } = await import("./queries");
const db = createDb(URL);

describe("educationQuery", () => {
  it("filters to published and visible rows, ordered", () => {
    const { sql, params } = educationQuery(db, {
      includeDrafts: false,
    }).toSQL();
    expect(sql).toContain('"education"."status" = $1');
    expect(sql).toContain('"education"."visible" = $2');
    expect(sql).toContain('order by "education"."order"');
    expect(params).toEqual(["published", true]);
  });

  it("does not filter when drafts are included", () => {
    const { sql } = educationQuery(db, { includeDrafts: true }).toSQL();
    expect(sql).not.toContain('"education"."status" =');
  });
});

describe("getEducationCore", () => {
  const row = {
    id: "e1",
    institution: "Publicada",
    status: "published",
    draft: { institution: "Pendiente" },
  };

  it("never returns the draft key and keeps the column value publicly", async () => {
    rows.splice(0, rows.length, { ...row });
    const [out] = await getEducationCore({ includeDrafts: false });
    expect(out).not.toHaveProperty("draft");
    expect(out.institution).toBe("Publicada");
  });

  it("overlays the draft for Draft Mode without exposing it", async () => {
    rows.splice(0, rows.length, { ...row });
    const [out] = await getEducationCore({ includeDrafts: true });
    expect(out).not.toHaveProperty("draft");
    expect(out.institution).toBe("Pendiente");
  });
});
