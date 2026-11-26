import type { Locale, SiteSettings } from "@/features/site-settings/types";
import { type Segment, SegmentLine } from "./segment-line";

// Configuration, not content.
export const SOURCE_URL = "https://github.com/jaras97/mateojaras.dev";

// py-[3px] makes the 18px line a 24px target (WCAG 2.5.8, K-29).
const linkClass = "inline-block py-[3px] hover:text-foreground hover:underline";

export type FooterLabels = {
  cv: string;
  source: string;
  github: string;
  linkedin: string;
};

export function FooterLine({
  settings,
  locale,
  labels,
}: {
  settings: Pick<
    SiteSettings,
    "name" | "location" | "githubUrl" | "linkedinUrl"
  >;
  locale: Locale;
  labels: FooterLabels;
}) {
  const segments: Segment[] = [
    { key: "name", content: settings.name },
    { key: "location", content: settings.location },
    {
      key: "github",
      content: settings.githubUrl ? (
        <a href={settings.githubUrl} className={linkClass}>
          {labels.github}
        </a>
      ) : null,
    },
    {
      key: "linkedin",
      content: settings.linkedinUrl ? (
        <a href={settings.linkedinUrl} className={linkClass}>
          {labels.linkedin}
        </a>
      ) : null,
    },
    {
      key: "cv",
      content: (
        <a href={`/cv/${locale}.pdf`} className={linkClass}>
          {labels.cv}
        </a>
      ),
    },
    {
      key: "source",
      content: (
        <a href={SOURCE_URL} className={linkClass}>
          {labels.source}
        </a>
      ),
    },
  ];
  return (
    <SegmentLine
      segments={segments}
      className="font-sans text-muted-foreground"
    />
  );
}
