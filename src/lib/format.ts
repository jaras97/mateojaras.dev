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

// "America/Bogota" to "UTC-5" at the given instant; a zero offset is "UTC".
export function formatUtcOffset(timeZone: string, at: Date): string {
  const name =
    new Intl.DateTimeFormat("en", { timeZone, timeZoneName: "shortOffset" })
      .formatToParts(at)
      .find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  return name.replace(/^GMT/, "UTC");
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
