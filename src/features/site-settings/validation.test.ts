import { describe, expect, it } from "vitest";
import { settingsDraftSchema, settingsPublishSchema } from "./validation";

const valid = {
  name: "Nombre",
  headlineEn: "Headline",
  headlineEs: "Titular",
  bioEn: "Bio",
  bioEs: "Biografía",
  nowEn: null,
  nowEs: null,
  availabilityStatus: "open",
  availableFrom: "",
  timezone: "America/Bogota",
  location: "Medellín, Colombia",
  languages: [{ code: "es", level: "native" }],
  email: "hola@example.com",
  calendarUrl: "",
  githubUrl: "https://github.com/x",
  linkedinUrl: "https://linkedin.com/in/x",
  seoTitleEn: "",
  seoTitleEs: "",
  seoDescriptionEn: "",
  seoDescriptionEs: "",
};

describe("settingsPublishSchema", () => {
  it("accepts a complete payload", () => {
    expect(settingsPublishSchema.safeParse(valid).success).toBe(true);
  });

  it("requires availableFrom when the status is from_date", () => {
    const result = settingsPublishSchema.safeParse({
      ...valid,
      availabilityStatus: "from_date",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path[0])).toContain(
        "availableFrom",
      );
    }
  });

  it("rejects a time zone Intl does not know", () => {
    const result = settingsPublishSchema.safeParse({
      ...valid,
      timezone: "Mars/Phobos",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a CEFR level outside native, A1..C2", () => {
    const result = settingsPublishSchema.safeParse({
      ...valid,
      languages: [{ code: "en", level: "B3" }],
    });
    expect(result.success).toBe(false);
  });

  it("requires headline, bio, name and a valid email", () => {
    const result = settingsPublishSchema.safeParse({
      ...valid,
      name: " ",
      headlineEs: "",
      bioEn: "",
      email: "no-es-correo",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toEqual(
        expect.arrayContaining(["name", "headlineEs", "bioEn", "email"]),
      );
    }
  });

  it("accepts only https URLs for the links", () => {
    for (const githubUrl of [
      "http://github.com/x",
      "javascript:alert(1)",
      "github.com/x",
    ]) {
      expect(
        settingsPublishSchema.safeParse({ ...valid, githubUrl }).success,
      ).toBe(false);
    }
  });
});

describe("settingsDraftSchema", () => {
  it("lets incomplete text through but still enforces shapes", () => {
    expect(
      settingsDraftSchema.safeParse({ ...valid, headlineEn: "", email: "" })
        .success,
    ).toBe(true);
    expect(
      settingsDraftSchema.safeParse({ ...valid, calendarUrl: "http://x.com" })
        .success,
    ).toBe(false);
  });

  it("rejects unknown keys", () => {
    expect(
      settingsDraftSchema.safeParse({ ...valid, status: "draft" }).success,
    ).toBe(false);
  });

  it("caps the SEO title at 60 and the description at 160", () => {
    expect(
      settingsDraftSchema.safeParse({ ...valid, seoTitleEn: "x".repeat(61) })
        .success,
    ).toBe(false);
    expect(
      settingsDraftSchema.safeParse({
        ...valid,
        seoDescriptionEs: "x".repeat(161),
      }).success,
    ).toBe(false);
  });
});
