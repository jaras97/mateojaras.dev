import { describe, expect, it } from "vitest";
import { applyDraft, stripDraft } from "@/lib/draft";

const row = { id: "1", titleEs: "Publicado", slug: "a", draft: null };

describe("stripDraft", () => {
  it("removes the draft key and keeps the published columns", () => {
    const out = stripDraft({ ...row, draft: { titleEs: "Pendiente" } });
    expect(out).toEqual({ id: "1", titleEs: "Publicado", slug: "a" });
    expect("draft" in out).toBe(false);
  });
});

describe("applyDraft", () => {
  it("overlays draft values on the columns and removes draft", () => {
    const out = applyDraft({ ...row, draft: { titleEs: "Pendiente" } });
    expect(out.titleEs).toBe("Pendiente");
    expect("draft" in out).toBe(false);
  });

  it("ignores draft keys that are not columns of the row", () => {
    const out = applyDraft({ ...row, draft: { skillIds: ["x"] } });
    expect(out).toEqual({ id: "1", titleEs: "Publicado", slug: "a" });
  });

  it("keeps the row when draft is null", () => {
    expect(applyDraft(row)).toEqual({
      id: "1",
      titleEs: "Publicado",
      slug: "a",
    });
  });

  it("ignores a draft that is not a plain object", () => {
    expect(applyDraft({ ...row, draft: ["titleEs"] })).toEqual({
      id: "1",
      titleEs: "Publicado",
      slug: "a",
    });
  });
});
