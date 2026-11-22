import { SegmentLine } from "@/components/site/segment-line";
import type { Locale } from "@/features/site-settings/types";
import { getPathname } from "@/i18n/navigation";
import { formatMonthYear } from "@/lib/format";
import { localized } from "@/lib/i18n-fields";

export type Entry = {
  id: string;
  slug: string;
  titleEn: string;
  titleEs: string;
  taglineEn: string | null;
  taglineEs: string | null;
  liveUrl: string | null;
  startedAt: string | null;
  finishedAt: string | null;
};

// The home list (D-14): every published, visible project in admin order as a
// dated entry. No cards, no shadows; each entry is a single link.
export function EntryList({
  rows,
  stacks,
  locale,
  labels,
}: {
  rows: Entry[];
  stacks: Record<string, string[]>;
  locale: Locale;
  labels: { internalTool: string };
}) {
  if (rows.length === 0) return null;
  return (
    <ol>
      {rows.map((row) => {
        const date = row.finishedAt ?? row.startedAt;
        const title = localized(row, "title", locale) as string;
        const tagline = (
          (localized(row, "tagline", locale) as string | null) ?? ""
        ).trim();
        const stack = stacks[row.id] ?? [];
        const segments = [
          ...(stack.length > 0
            ? [{ key: "stack", content: stack.join(" · ") }]
            : []),
          ...(row.liveUrl === null
            ? [{ key: "internal", content: labels.internalTool }]
            : []),
        ];
        return (
          <li key={row.id} className="border-b border-border">
            <a
              href={getPathname({
                locale,
                href: {
                  pathname: "/projects/[slug]",
                  params: { slug: row.slug },
                },
              })}
              className="group block py-6"
            >
              <div className="transition-transform duration-[160ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-safe:group-hover:translate-x-1 motion-safe:group-focus-visible:translate-x-1 lg:grid lg:grid-cols-12 lg:gap-x-6">
                {date ? (
                  <time
                    dateTime={date}
                    className="block font-mono text-sm text-muted-foreground lg:col-span-2"
                  >
                    {formatMonthYear(date, locale)}
                  </time>
                ) : null}
                <div className="mt-2 lg:col-span-7 lg:col-start-3 lg:mt-0">
                  <h3 className="font-heading text-xl font-semibold tracking-display transition-colors duration-[160ms] group-hover:text-signal group-focus-visible:text-signal">
                    {title}
                  </h3>
                  {tagline !== "" ? (
                    <p className="mt-2 text-muted-foreground">{tagline}</p>
                  ) : null}
                  {segments.length > 0 ? (
                    <SegmentLine
                      as="div"
                      segments={segments}
                      className="mt-2 text-muted-foreground"
                    />
                  ) : null}
                </div>
              </div>
            </a>
          </li>
        );
      })}
    </ol>
  );
}
