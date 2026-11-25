import { describe, expect, it } from "vitest";
import {
  diffEntity,
  isManagedExperience,
  naturalKey,
  PROJECT_PROTECTED_FIELDS,
  planRenames,
  planRetire,
  projectUpdateSet,
} from "./plan";

describe("naturalKey", () => {
  it("joins institution and programEn for education", () => {
    expect(
      naturalKey("education", { institution: "Udemy", programEn: "FastAPI" }),
    ).toBe("Udemy|FastAPI");
  });

  it("joins company, type and startDate for experiences", () => {
    expect(
      naturalKey("experiences", {
        company: "Freelance",
        type: "freelance",
        startDate: "2025-09-01",
      }),
    ).toBe("Freelance|freelance|2025-09-01");
  });

  it("uses the slug for projects and the name for skills", () => {
    expect(naturalKey("projects", { slug: "prendo" })).toBe("prendo");
    expect(naturalKey("skills", { name: "React" })).toBe("React");
  });
});

describe("projectUpdateSet", () => {
  it("never carries media or coverImage", () => {
    const set = projectUpdateSet({
      slug: "a",
      titleEn: "A",
      media: [{ url: "x" }],
      coverImage: "x",
    });
    expect(set).toEqual({ slug: "a", titleEn: "A" });
    for (const f of PROJECT_PROTECTED_FIELDS) expect(f in set).toBe(false);
  });
});

describe("planRetire", () => {
  it("returns only slugs that exist", () => {
    expect(
      planRetire(["e2e-stale-probe", "gone"], ["e2e-stale-probe", "x"]),
    ).toEqual(["e2e-stale-probe"]);
  });

  it("returns nothing for an empty list", () => {
    expect(planRetire([], ["a"])).toEqual([]);
  });
});

describe("planRenames", () => {
  it("renames when from exists and to does not", () => {
    expect(planRenames([{ from: "old", to: "new" }], ["old", "other"])).toEqual(
      [{ from: "old", to: "new" }],
    );
  });

  it("skips a rename already done", () => {
    expect(planRenames([{ from: "old", to: "new" }], ["new"])).toEqual([]);
  });

  it("throws naming both slugs when to already exists", () => {
    expect(() =>
      planRenames([{ from: "old", to: "new" }], ["old", "new"]),
    ).toThrow(/old.*new/);
  });
});

describe("diffEntity", () => {
  const row = { slug: "a", titleEn: "A", order: 1 };

  it("is empty when current already equals the payload", () => {
    expect(
      diffEntity("projects", row, { ...row }, ["slug", "titleEn", "order"]),
    ).toEqual([]);
  });

  it("reports changed fields under the natural key", () => {
    const out = diffEntity("projects", row, { ...row, order: 2 }, ["order"]);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      entity: "projects",
      key: "a",
      field: "order",
    });
  });
});

describe("isManagedExperience", () => {
  const entries = [
    { company: "Freelance", type: "freelance", startDate: "2025-09-01" },
  ];

  it("manages only listed experiences (Sofka guard, D-04)", () => {
    expect(
      isManagedExperience(
        { company: "Freelance", type: "freelance", startDate: "2025-09-01" },
        entries,
      ),
    ).toBe(true);
    expect(
      isManagedExperience(
        {
          company: "Sofka Technologies",
          type: "employment",
          startDate: "2021-08-01",
        },
        entries,
      ),
    ).toBe(false);
  });
});
