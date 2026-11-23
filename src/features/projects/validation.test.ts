import { describe, expect, it } from "vitest";
import es from "../../../messages/es.json";
import {
  type ProjectDraftInput,
  projectDraftSchema,
  projectPublishSchema,
  SLUG_FORMAT_MESSAGE,
  SLUG_LOCKED_MESSAGE,
  SLUG_TAKEN_MESSAGE,
} from "./validation";

const complete: ProjectDraftInput = {
  slug: "centro-estetico-manuj",
  titleEn: "Title",
  titleEs: "Titulo",
  taglineEn: "tagline",
  taglineEs: "frase",
  problemEn: "problem",
  problemEs: "problema",
  roleEn: "role",
  roleEs: "papel",
  solutionEn: "solution",
  solutionEs: "solucion",
  caseStudyEn: null,
  caseStudyEs: null,
  resultsEn: [],
  resultsEs: [],
  metricsEn: [],
  metricsEs: [],
  techDecisionsEn: null,
  techDecisionsEs: null,
  liveUrl: "",
  repoUrl: null,
  coverImage: null,
  media: [],
  startedAt: "",
  finishedAt: "",
  skillIds: [],
};

const slugOf = (slug: string) =>
  projectDraftSchema.safeParse({ ...complete, slug });

describe("projectDraftSchema slug", () => {
  it.each(["", "Hola", "a--b", "proyecto-\u00e9"])("rejects %j", (slug) => {
    const result = slugOf(slug);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0].message).toBe(
      "Usa solo min\u00fasculas, n\u00fameros y guiones.",
    );
  });

  it("accepts a kebab-case slug", () => {
    expect(slugOf("centro-estetico-manuj").success).toBe(true);
  });
});

describe("projectDraftSchema urls", () => {
  it("rejects a non-https live url and accepts empty or https", () => {
    const parse = (liveUrl: string | null) =>
      projectDraftSchema.safeParse({ ...complete, liveUrl }).success;
    expect(parse("http://x.dev")).toBe(false);
    expect(parse("javascript:alert(1)")).toBe(false);
    expect(parse("https://x.dev")).toBe(true);
    expect(parse("")).toBe(true);
    expect(parse(null)).toBe(true);
  });
});

describe("projectPublishSchema", () => {
  it("accepts a complete payload", () => {
    expect(projectPublishSchema.safeParse(complete).success).toBe(true);
  });

  it("rejects a media item with empty altEs", () => {
    const result = projectPublishSchema.safeParse({
      ...complete,
      media: [
        { url: "https://x.dev/a.png", altEn: "a", altEs: "", type: "image" },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a coverImage that is not one of media[].url", () => {
    const media = [
      {
        url: "https://x.dev/a.png",
        altEn: "a",
        altEs: "a",
        type: "image" as const,
      },
    ];
    const bad = projectPublishSchema.safeParse({
      ...complete,
      media,
      coverImage: "https://x.dev/other.png",
    });
    const good = projectPublishSchema.safeParse({
      ...complete,
      media,
      coverImage: "https://x.dev/a.png",
    });
    expect(bad.success).toBe(false);
    expect(good.success).toBe(true);
  });
});

describe("media captions", () => {
  const base = {
    url: "https://x.dev/a.png",
    altEn: "a",
    altEs: "a",
    type: "image" as const,
  };
  it("accepts optional captions and capturedAt", () => {
    const result = projectDraftSchema.safeParse({
      ...complete,
      media: [
        {
          ...base,
          captionEn: "Home",
          captionEs: "Inicio",
          capturedAt: "2026-03",
        },
      ],
    });
    expect(result.success).toBe(true);
  });
  it("accepts real calendar capturedAt values", () => {
    for (const capturedAt of ["2026-03", "2024-02-29", "2026-03-15"]) {
      expect(
        projectDraftSchema.safeParse({
          ...complete,
          media: [{ ...base, capturedAt }],
        }).success,
      ).toBe(true);
    }
  });
  it("rejects a bad capturedAt, a long caption and unknown keys", () => {
    for (const extra of [
      { capturedAt: "March" },
      { capturedAt: "2025-13" },
      { capturedAt: "2025-00" },
      { capturedAt: "2025-02-30" },
      { captionEn: "x".repeat(121) },
      { notes: "x" },
    ]) {
      expect(
        projectDraftSchema.safeParse({
          ...complete,
          media: [{ ...base, ...extra }],
        }).success,
      ).toBe(false);
    }
  });
});

describe("slug messages", () => {
  it("match messages/es.json", () => {
    expect(SLUG_FORMAT_MESSAGE).toBe(es.Admin.form.slugFormat);
    expect(SLUG_LOCKED_MESSAGE).toBe(es.Admin.form.slugLocked);
    expect(SLUG_TAKEN_MESSAGE).toBe(es.Admin.form.slugTaken);
  });
});
