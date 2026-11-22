import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { heroTitleClass } from "@/components/site/hero/hero-parts";
import { type Segment, SegmentLine } from "@/components/site/segment-line";
import type { Locale } from "@/features/site-settings/types";
import { formatMonthYear } from "@/lib/format";

export type CaseHeaderLabels = {
  backHome: string;
  present: string;
  source: string;
  internalTool: string;
  demoText: string;
  demoLink: string;
};

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const linkClass =
  "text-foreground underline-offset-4 hover:underline focus-visible:underline";

export function CaseHeader({
  title,
  tagline,
  locale,
  stack,
  startedAt,
  finishedAt,
  liveUrl,
  repoUrl,
  backHref,
  contactHref,
  labels,
}: {
  title: string;
  tagline: string | null;
  locale: Locale;
  stack: string[];
  startedAt: string | null;
  finishedAt: string | null;
  liveUrl: string | null;
  repoUrl: string | null;
  backHref: string;
  contactHref: string;
  labels: CaseHeaderLabels;
}) {
  const hasLive = Boolean(liveUrl?.trim());
  const segments: Segment[] = [];
  if (startedAt) {
    const end = finishedAt
      ? formatMonthYear(finishedAt, locale)
      : labels.present;
    segments.push({
      key: "period",
      content: `${formatMonthYear(startedAt, locale)} – ${end}`,
    });
  }
  if (stack.length > 0) {
    segments.push({ key: "stack", content: stack.join(" · ") });
  }
  if (hasLive && liveUrl) {
    segments.push({
      key: "live",
      content: (
        <a
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {hostname(liveUrl)}
          <ArrowUpRight aria-hidden="true" className="ms-1 inline size-4" />
        </a>
      ),
    });
  } else {
    segments.push({ key: "internal", content: labels.internalTool });
  }
  if (repoUrl?.trim()) {
    segments.push({
      key: "repo",
      content: (
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {labels.source}
          <ArrowUpRight aria-hidden="true" className="ms-1 inline size-4" />
        </a>
      ),
    });
  }

  return (
    <header className="lg:col-span-12 lg:grid lg:grid-cols-12 lg:gap-x-6">
      <a
        href={backHref}
        className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:underline lg:col-span-12"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {labels.backHome}
      </a>
      <h1 className={`${heroTitleClass} mt-8 lg:col-span-10 lg:col-start-3`}>
        {title}
      </h1>
      {tagline?.trim() ? (
        <p className="mt-4 text-[25px] leading-snug text-muted-foreground lg:col-span-7 lg:col-start-3">
          {tagline}
        </p>
      ) : null}
      <div className="mt-6 lg:col-span-10 lg:col-start-3">
        <SegmentLine segments={segments} as="div" />
        {hasLive ? null : (
          <p className="mt-4">
            {labels.demoText}{" "}
            <a href={contactHref} className={`${linkClass} underline`}>
              {labels.demoLink}
            </a>
          </p>
        )}
      </div>
    </header>
  );
}
