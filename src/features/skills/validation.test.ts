import { describe, expect, it } from "vitest";
import { skillDraftSchema, skillPublishSchema } from "./validation";

const base = {
  name: "React",
  category: "frontend",
  icon: null,
  yearsUsed: 5,
  featured: false,
};

describe("skill validation", () => {
  it("accepts a null year count and the bounds 0 and 50", () => {
    for (const yearsUsed of [null, 0, 50]) {
      expect(skillDraftSchema.safeParse({ ...base, yearsUsed }).success).toBe(
        true,
      );
    }
  });

  it("refuses negative, fractional and over-range years", () => {
    for (const yearsUsed of [-1, 2.5, 51]) {
      expect(skillDraftSchema.safeParse({ ...base, yearsUsed }).success).toBe(
        false,
      );
    }
  });

  it("refuses a blank name on publish and an unknown category", () => {
    expect(skillPublishSchema.safeParse({ ...base, name: "  " }).success).toBe(
      false,
    );
    expect(
      skillPublishSchema.safeParse({ ...base, category: "cooking" }).success,
    ).toBe(false);
  });
});
