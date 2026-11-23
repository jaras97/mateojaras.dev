import type { Locale } from "@/features/site-settings/types";

// Deterministic formatting: the output never depends on the machine's timezone
// (RESEARCH Pitfalls 3 and 4) and never reads the clock.

// 'YYYY-MM-DD' (a date column) to "Nov 2026" / "nov 2026". The day is read and
// formatted in UTC, so Bogotá and Vercel print the same month.
export function formatMonthYear(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

// 'YYYY-MM' or 'YYYY-MM-DD' to a real calendar day 'YYYY-MM-DD', or null when
// the month or day does not exist (Date.UTC alone rolls 2025-02-31 over to
// March, so the parts are round-tripped).
export function toCalendarDay(value: string): string | null {
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = match[3] === undefined ? 1 : Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  const two = (n: number) => String(n).padStart(2, "0");
  return `${match[1]}-${two(month)}-${two(day)}`;
}

// "America/Bogota" to "UTC-5" at the given instant; a zero offset is "UTC".
export function formatUtcOffset(timeZone: string, at: Date): string {
  const name =
    new Intl.DateTimeFormat("en", { timeZone, timeZoneName: "shortOffset" })
      .formatToParts(at)
      .find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  // ICU prints a zero offset as "GMT" or "GMT+0" depending on the zone.
  return name.replace(/^GMT(?:[+-]0)?$/, "UTC").replace(/^GMT/, "UTC");
}

// The 'YYYY-MM-DD' day of an instant in the given zone, not the UTC day.
export function formatEntryDate(at: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}
