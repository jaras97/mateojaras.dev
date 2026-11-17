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
const { skillsQuery, getSkillsCore } = await import("./queries");
const db = createDb(URL);

describe("skillsQuery", () => {
  it("filters to published and visible rows, ordered by category then order", () => {
    const { sql, params } = skillsQuery(db, { includeDrafts: false }).toSQL();
    expect(sql).toContain('"skills"."status" = $1');
    expect(sql).toContain('"skills"."visible" = $2');
    expect(sql).toContain('order by "skills"."category" asc, "skills"."order" asc');
    expect(params).toEqual(["published", true]);
  });

  it("does not filter when drafts are included", () => {
    const { sql } = skillsQuery(db, { includeDrafts: true }).toSQL();
    expect(sql).not.toContain('"skills"."status" =');
  });
});

describe("getSkillsCore", () => {
  const row = {
    id: "s1",
    name: "Publicada",
    status: "published",
    draft: { name: "Pendiente" },
  };

  it("never returns the draft key and keeps the column value publicly", async () => {
    rows.splice(0, rows.length, { ...row });
    const [out] = await getSkillsCore({ includeDrafts: false });
    expect(out).not.toHaveProperty("draft");
    expect(out.name).toBe("Publicada");
  });

  it("overlays the draft when drafts are included", async () => {
    rows.splice(0, rows.length, { ...row });
    const [out] = await getSkillsCore({ includeDrafts: true });
    expect(out).not.toHaveProperty("draft");
    expect(out.name).toBe("Pendiente");
  });
});
