import { describe, expect, it, vi } from "vitest";
import { cvFixture } from "./cv-fixture";
import { toJsonResume } from "./json-resume";
import { jsonResumeSchema } from "./json-resume-schema";

// The mapping is pure; keep the database and cache runtime out of the unit.
vi.mock("./cv-data", () => ({ buildCvData: vi.fn() }));
vi.mock("next/cache", () => ({ cacheTag: vi.fn(), cacheLife: vi.fn() }));

const SITE = "https://mateojaras.dev";

describe("jsonResumeSchema", () => {
  it.each(["en", "es"] as const)("accepts the mapped %s fixture", (locale) => {
    const result = jsonResumeSchema.safeParse(
      toJsonResume(cvFixture(locale), SITE),
    );
    expect(result.success).toBe(true);
  });

  it.each(["2021/08", "Aug 2021"])("rejects startDate %s", (startDate) => {
    const json = toJsonResume(cvFixture("en"), SITE) as {
      work: Record<string, unknown>[];
    };
    json.work[0] = { ...json.work[0], startDate };
    expect(jsonResumeSchema.safeParse(json).success).toBe(false);
  });
});
