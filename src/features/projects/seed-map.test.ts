import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadContentDir } from "./content-file";
import type { ProjectFrontMatter } from "./content-schema";
import { projectRowFromContent } from "./seed-map";

const dir = fileURLToPath(new URL("../../../docs/content", import.meta.url));
const files = loadContentDir(dir);
const rows = files.map(({ content }, i) => ({
  fm: content.frontMatter as ProjectFrontMatter,
  row: projectRowFromContent(content, i),
}));

describe("projectRowFromContent on docs/content", () => {
  it("publishes only projects with clientPermission true", () => {
    expect(rows.length).toBeGreaterThanOrEqual(4);
    for (const { fm, row } of rows) {
      expect(row.status).toBe(
        fm.clientPermission === true ? "published" : "draft",
      );
    }
    expect(rows.filter((r) => r.row.status === "published")).toHaveLength(2);
  });

  it("maps every pending field to null", () => {
    for (const { fm, row } of rows) {
      for (const field of fm.pendingFields ?? []) {
        if (field === "clientPermission") continue;
        expect((row as Record<string, unknown>)[field] ?? null).toBeNull();
      }
    }
  });

  it("never seeds the cover image or media", () => {
    for (const { row } of rows) {
      expect(row.coverImage).toBeUndefined();
      expect(row.media).toBeUndefined();
    }
  });

  it("keeps titles byte for byte", () => {
    for (const { fm, row } of rows) {
      expect(row.titleEs).toBe(fm.titleEs);
      expect(row.titleEn).toBe(fm.titleEn);
    }
  });

  it("does not carry provenance fields into the row", () => {
    for (const { row } of rows) {
      for (const key of ["stack", "sampleData", "enStatus", "altStatus"]) {
        expect(key in row).toBe(false);
      }
    }
  });
});
