import type { Locale } from "@/features/site-settings/types";
import { formatMonthYear } from "@/lib/format";

export type EducationRow = {
  id: string;
  institution: string;
  program: string;
  startDate: string | null;
  endDate: string | null;
  status: string | null;
};

export function EducationList({
  rows,
  locale,
  presentLabel,
}: {
  rows: EducationRow[];
  locale: Locale;
  presentLabel: string;
}) {
  if (rows.length === 0) return null;
  return (
    <ol className="space-y-6">
      {rows.map((row) => {
        const period = row.startDate
          ? `${formatMonthYear(row.startDate, locale)} – ${
              row.endDate ? formatMonthYear(row.endDate, locale) : presentLabel
            }`
          : row.endDate
            ? formatMonthYear(row.endDate, locale)
            : null;
        return (
          <li key={row.id}>
            {period ? (
              <p className="font-mono text-sm text-muted-foreground">
                {period}
              </p>
            ) : null}
            <p className="mt-1 font-semibold">{row.institution}</p>
            <p>{row.program}</p>
            {row.status?.trim() ? (
              <p className="text-muted-foreground">{row.status}</p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
