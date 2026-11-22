import type { Locale } from "@/features/site-settings/types";
import { formatMonthYear } from "@/lib/format";

export type ExperienceRow = {
  id: string;
  company: string;
  role: string;
  type: "employment" | "freelance";
  location: string | null;
  startDate: string;
  endDate: string | null;
  bullets: string[];
};

export function ExperienceList({
  rows,
  locale,
  labels,
}: {
  rows: ExperienceRow[];
  locale: Locale;
  labels: {
    present: string;
    type: { employment: string; freelance: string };
  };
}) {
  if (rows.length === 0) return null;
  return (
    <ol className="space-y-8">
      {rows.map((row) => {
        const end = row.endDate
          ? formatMonthYear(row.endDate, locale)
          : labels.present;
        const meta = [labels.type[row.type], row.location]
          .filter(Boolean)
          .join(" · ");
        const bullets = row.bullets.filter((b) => b.trim());
        return (
          <li
            key={row.id}
            className="border-t border-border pt-6 first:border-t-0 first:pt-0"
          >
            <p className="font-mono text-sm text-muted-foreground">
              {formatMonthYear(row.startDate, locale)} – {end}
            </p>
            <h3 className="mt-2 font-heading text-2xl font-semibold tracking-display">
              {row.company}
            </h3>
            <p className="mt-1">{row.role}</p>
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              {meta}
            </p>
            {bullets.length > 0 ? (
              <ul className="mt-4 list-disc space-y-2 ps-4">
                {bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
