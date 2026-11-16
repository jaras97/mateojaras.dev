import { describe, expect, it, vi } from "vitest";

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
vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost/test");
const { getSiteSettingsCore } = await import("./queries");

function setRow(row: Record<string, unknown>) {
  rows.length = 0;
  rows.push(row);
}

describe("getSiteSettingsCore", () => {
  it("returns the published columns without a draft key when drafts are off", async () => {
    setRow({ id: 1, headlineEs: "publicado", draft: { headlineEs: "x" } });
    const result = await getSiteSettingsCore({ includeDrafts: false });
    expect(result?.headlineEs).toBe("publicado");
    expect(result).not.toHaveProperty("draft");
  });

  it("applies the pending draft when drafts are on", async () => {
    setRow({ id: 1, headlineEs: "publicado", draft: { headlineEs: "x" } });
    const result = await getSiteSettingsCore({ includeDrafts: true });
    expect(result?.headlineEs).toBe("x");
    expect(result).not.toHaveProperty("draft");
  });

  it("returns the columns in both modes when there is no draft", async () => {
    setRow({ id: 1, headlineEs: "publicado", draft: null });
    for (const includeDrafts of [false, true]) {
      const result = await getSiteSettingsCore({ includeDrafts });
      expect(result?.headlineEs).toBe("publicado");
      expect(result).not.toHaveProperty("draft");
    }
  });

  it("returns null when the row is missing", async () => {
    rows.length = 0;
    expect(await getSiteSettingsCore({ includeDrafts: true })).toBeNull();
  });
});
