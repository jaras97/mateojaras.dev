import { describe, expect, it } from "vitest";
import { overlapHours } from "@/lib/overlap";

// 09:00-18:00 workday in Bogotá (UTC-5, no DST) against Toronto and Madrid.
const vectors: [string, { toronto: number; madrid: number }][] = [
  ["2026-01-15T17:00:00Z", { toronto: 9, madrid: 3 }],
  ["2026-03-09T17:00:00Z", { toronto: 8, madrid: 3 }],
  ["2026-03-30T17:00:00Z", { toronto: 8, madrid: 2 }],
  ["2026-07-15T17:00:00Z", { toronto: 8, madrid: 2 }],
  ["2026-10-26T17:00:00Z", { toronto: 8, madrid: 3 }],
  ["2026-11-02T17:00:00Z", { toronto: 9, madrid: 3 }],
  ["2026-11-22T17:00:00Z", { toronto: 9, madrid: 3 }],
];

describe("overlapHours", () => {
  it.each(vectors)("%s", (iso, expected) => {
    expect(overlapHours(new Date(iso))).toEqual(expected);
  });

  it("maps the instant to the Bogotá calendar date", () => {
    // 02:00 UTC on Mar 9 is still Mar 8 in Bogotá: Toronto already on DST (8),
    // Madrid not yet (3), same as the vector for Mar 9.
    expect(overlapHours(new Date("2026-03-09T02:00:00Z"))).toEqual({
      toronto: 8,
      madrid: 3,
    });
  });

  it("survives being stringified into an inline script (self-contained)", () => {
    const rebuilt = new Function(
      `return ${String(overlapHours)}`,
    )() as typeof overlapHours;
    for (const [iso, expected] of vectors) {
      expect(rebuilt(new Date(iso))).toEqual(expected);
    }
  });
});
