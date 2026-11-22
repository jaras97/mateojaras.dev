// Hours of the 09:00-18:00 workday that Bogotá (UTC-5, no DST) shares with
// Toronto and Madrid on the Bogotá calendar date of `at`. Deterministic: it
// reads no clock. It is stringified into an inline script (String(overlapHours)),
// so it must stay self-contained: no imports, no references outside its body.
export function overlapHours(at: Date): { toronto: number; madrid: number } {
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
  const [y, m, d] = day.split("-").map(Number);
  const base = Date.UTC(y, m - 1, d);
  const hour = 3600000;
  // Bogotá is fixed UTC-5, so 09:00-18:00 local is 14:00-23:00 UTC.
  const bogotaStart = base + 14 * hour;
  const bogotaEnd = base + 23 * hour;

  function hoursWith(timeZone: string): number {
    const name =
      new Intl.DateTimeFormat("en", { timeZone, timeZoneName: "longOffset" })
        .formatToParts(new Date(base + 12 * hour))
        .find((part) => part.type === "timeZoneName")?.value ?? "GMT";
    const match = name.match(/^GMT(?:([+-])(\d{2}):(\d{2}))?$/);
    const sign = match?.[1] === "-" ? -1 : 1;
    const offset = match?.[2]
      ? sign * (Number(match[2]) * 60 + Number(match[3])) * 60000
      : 0;
    const start = base + 9 * hour - offset;
    const end = base + 18 * hour - offset;
    return Math.max(
      0,
      Math.round(
        (Math.min(end, bogotaEnd) - Math.max(start, bogotaStart)) / hour,
      ),
    );
  }

  return {
    toronto: hoursWith("America/Toronto"),
    madrid: hoursWith("Europe/Madrid"),
  };
}
