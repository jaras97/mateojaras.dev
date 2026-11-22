import { heroCopy } from "@/components/site/hero-copy";
import { type Segment, SegmentLine } from "@/components/site/segment-line";
import type { HeroSettings, Locale } from "@/features/site-settings/types";
import {
  formatEntryDate,
  formatMonthYear,
  formatUtcOffset,
} from "@/lib/format";
import { cn } from "@/lib/utils";

// The live status line shared by the three hero variants. Server Component:
// no clock read (the offset is taken at updatedAt), no animation.
export function StatusLine({
  settings,
  locale,
  showEntryDate = false,
  className,
}: {
  settings: HeroSettings;
  locale: Locale;
  showEntryDate?: boolean;
  className?: string;
}) {
  const copy = heroCopy[locale];
  const segments: Segment[] = [];

  if (showEntryDate) {
    const day = formatEntryDate(settings.updatedAt, settings.timezone);
    segments.push({
      key: "date",
      content: <time dateTime={day}>{day}</time>,
      className: "text-muted-foreground",
    });
  }

  const availability = availabilityText(settings, locale, copy.availability);
  if (availability !== null) {
    segments.push({
      key: "availability",
      content: (
        <span className="inline-flex items-center gap-1 text-foreground">
          <span
            aria-hidden="true"
            className={cn(
              "size-2 shrink-0 rounded-full",
              settings.availabilityStatus === "closed"
                ? "bg-ink-2"
                : "bg-signal",
            )}
          />
          {availability}
        </span>
      ),
    });
  }

  if (settings.location.trim() !== "") {
    segments.push({
      key: "location",
      content: settings.location,
      className: "text-muted-foreground",
    });
  }

  segments.push({
    key: "offset",
    content: (
      <time data-status-time suppressHydrationWarning>
        {formatUtcOffset(settings.timezone, settings.updatedAt)}
      </time>
    ),
    className: "text-muted-foreground",
  });
  segments.push({
    key: "overlap",
    content: (
      <span data-status-overlap suppressHydrationWarning>
        {copy.overlap}
      </span>
    ),
    className: "text-muted-foreground",
  });

  return <SegmentLine segments={segments} className={className} />;
}

function availabilityText(
  settings: HeroSettings,
  locale: Locale,
  copy: (typeof heroCopy)[Locale]["availability"],
): string | null {
  switch (settings.availabilityStatus) {
    case "open":
      return copy.open;
    case "closed":
      return copy.closed;
    case "from_date":
      return settings.availableFrom === null
        ? null
        : copy.fromDate(formatMonthYear(settings.availableFrom, locale));
  }
}
