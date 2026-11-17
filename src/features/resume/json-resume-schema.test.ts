import { describe, expect, it } from "vitest";
import { cvFixture } from "./cv-fixture";
import { toJsonResume } from "./json-resume";
import { jsonResumeSchema } from "./json-resume-schema";

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
