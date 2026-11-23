import { describe, expect, it } from "vitest";
import {
  formatEntryDate,
  formatMonthYear,
  formatUtcOffset,
  toCalendarDay,
} from "@/lib/format";

// pnpm check runs these under the machine's zone; Task 3 also runs them under
// TZ=America/Bogota and TZ=UTC, so the output must not depend on either.

describe("formatMonthYear", () => {
  it("prints the month of a date column in English", () => {
    expect(formatMonthYear("2026-11-01", "en")).toBe("Nov 2026");
  });

  it("prints the month of a date column in Spanish", () => {
    expect(formatMonthYear("2026-11-01", "es")).toBe("nov 2026");
  });

  it("keeps the first day of the month in its own month", () => {
    expect(formatMonthYear("2027-01-01", "en")).toBe("Jan 2027");
  });
});

describe("formatUtcOffset", () => {
  it("prints Bogotá as UTC-5 in any month of 2026", () => {
    expect(
      formatUtcOffset("America/Bogota", new Date("2026-01-15T12:00:00Z")),
    ).toBe("UTC-5");
    expect(
      formatUtcOffset("America/Bogota", new Date("2026-07-15T12:00:00Z")),
    ).toBe("UTC-5");
  });

  it("prints a zero offset as bare UTC", () => {
    expect(formatUtcOffset("UTC", new Date("2026-10-30T12:00:00Z"))).toBe(
      "UTC",
    );
  });
});

describe("formatEntryDate", () => {
  it("returns the day in the given zone, not the UTC day", () => {
    expect(
      formatEntryDate(new Date("2026-10-31T01:00:00Z"), "America/Bogota"),
    ).toBe("2026-10-30");
  });

  it("returns the UTC day for the UTC zone", () => {
    expect(formatEntryDate(new Date("2026-10-31T01:00:00Z"), "UTC")).toBe(
      "2026-10-31",
    );
  });
});

describe("toCalendarDay", () => {
  it("expands a month and keeps real days", () => {
    expect(toCalendarDay("2026-03")).toBe("2026-03-01");
    expect(toCalendarDay("2026-03-15")).toBe("2026-03-15");
    expect(toCalendarDay("2024-02-29")).toBe("2024-02-29");
  });

  it("rejects impossible or malformed values", () => {
    for (const bad of [
      "2025-13",
      "2025-00",
      "2025-02-29",
      "2025-02-31",
      "2025-04-31",
      "2026-3",
      "March",
      "2026-03-15T00:00",
      "",
    ]) {
      expect(toCalendarDay(bad)).toBeNull();
    }
  });
});
