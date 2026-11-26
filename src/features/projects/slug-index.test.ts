import { describe, expect, it } from "vitest";
import { createDb } from "@/db/client";
import { publishedSlugsQuery } from "./slug-index";

const db = createDb("postgresql://test:test@localhost/test");

describe("publishedSlugsQuery", () => {
  it("filters to published and visible rows ordered by order", () => {
    const { sql, params } = publishedSlugsQuery(db).toSQL();
    expect(sql).toContain('"projects"."status" = $1');
    expect(sql).toContain('"projects"."visible" = $2');
    expect(sql).toContain('order by "projects"."order"');
    expect(params).toEqual(["published", true]);
  });
});
