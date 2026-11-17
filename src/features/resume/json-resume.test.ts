import { describe, expect, it } from "vitest";
import { cvFixture } from "./cv-fixture";
import { toJsonResume } from "./json-resume";

const SITE = "https://mateojaras.dev";

type Out = {
  basics: Record<string, unknown> & { location?: Record<string, unknown> };
  work: Record<string, unknown>[];
  meta: Record<string, string>;
};
const build = (locale: "en" | "es") =>
  toJsonResume(cvFixture(locale), SITE) as Out;

describe("toJsonResume", () => {
  it("emits YYYY-MM and omits endDate for an open range", () => {
    const work = build("en").work.find((w) => w.name === "Freelance");
    expect(work?.startDate).toBe("2025-09");
    expect(work).not.toHaveProperty("endDate");
  });

  it("emits endDate as YYYY-MM for a closed range", () => {
    const work = build("en").work.find((w) => w.name === "Sofka Technologies");
    expect(work?.endDate).toBe("2025-08");
  });

  it("omits countryCode and phone", () => {
    const { basics } = build("en");
    expect(basics).not.toHaveProperty("phone");
    expect(basics.location).not.toHaveProperty("countryCode");
    expect(basics.location?.city).toBe("Medellín");
  });

  it("uses the Spanish labels for es", () => {
    const json = toJsonResume(cvFixture("es"), SITE) as Out & {
      languages: { fluency: string }[];
    };
    expect(json.languages.map((l) => l.fluency)).toContain("Nativo");
    expect(json.basics.url).toBe(`${SITE}/es`);
    expect(json.meta.canonical).toBe(`${SITE}/resume.es.json`);
  });
});
