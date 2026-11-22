import type { Locale } from "@/features/site-settings/types";
import { docHasText, RichText } from "@/lib/rich-text";

// The date comes from the stored timestamp in the settings timezone; the
// clock is never read, so the shell stays static.
export function NowSection({
  doc,
  updatedAt,
  timeZone,
  locale,
  updatedLabel,
}: {
  doc: unknown;
  updatedAt: Date;
  timeZone: string;
  locale: Locale;
  updatedLabel: (date: string) => string;
}) {
  if (!docHasText(doc)) return null;
  const parts = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone,
  }).formatToParts(updatedAt);
  const part = (type: string) =>
    parts.find((p) => p.type === type)?.value.replace(/\./g, "") ?? "";
  // Day, month, year in both locales ("22 Nov 2026", "22 nov 2026").
  const date = `${part("day")} ${part("month")} ${part("year")}`;
  return (
    <div>
      <p className="font-mono text-sm text-muted-foreground">
        {updatedLabel(date)}
      </p>
      <div className="prose-site mt-4">
        <RichText doc={doc} />
      </div>
    </div>
  );
}
