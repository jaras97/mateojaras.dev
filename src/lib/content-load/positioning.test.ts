import { describe, expect, it } from "vitest";
import { educationPublishSchema } from "@/features/education/validation";
import {
  SEO_DESCRIPTION_MAX,
  SEO_TITLE_MAX,
} from "@/features/site-settings/validation";
import { skillPublishSchema } from "@/features/skills/validation";
import { lintPair, lintStrings } from "@/lib/content-lint";
import { positioning } from "../../../scripts/content/positioning";

describe("positioning", () => {
  it("education entries pass the admin publish schema", () => {
    for (const { order: _o, source: _s, ...entry } of positioning.education) {
      expect(educationPublishSchema.safeParse(entry).success).toBe(true);
    }
  });

  it("skills pass the admin publish schema", () => {
    for (const { order: _o, source: _s, ...entry } of positioning.skills) {
      expect(
        skillPublishSchema.safeParse({ ...entry, icon: null }).success,
      ).toBe(true);
    }
  });

  it("SEO fits the length limits", () => {
    const seo = positioning.seo;
    if (!seo) return;
    expect(seo.titleEn.length).toBeLessThanOrEqual(SEO_TITLE_MAX);
    expect(seo.titleEs.length).toBeLessThanOrEqual(SEO_TITLE_MAX);
    expect(seo.descriptionEn.length).toBeLessThanOrEqual(SEO_DESCRIPTION_MAX);
    expect(seo.descriptionEs.length).toBeLessThanOrEqual(SEO_DESCRIPTION_MAX);
  });

  it("project slugs are unique", () => {
    const slugs = positioning.projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("no text trips the content lint", () => {
    expect(lintStrings(positioning)).toEqual([]);
    for (const e of positioning.education) {
      expect(lintPair(e.programEn, e.programEs)).toEqual([]);
    }
  });
});
