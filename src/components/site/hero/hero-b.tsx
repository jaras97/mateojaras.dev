import {
  HeroCta,
  type HeroProps,
  heroSectionClass,
  heroTitleClass,
} from "@/components/site/hero/hero-parts";
import { StatusLine } from "@/components/site/status-line";
import { localized } from "@/lib/i18n-fields";
import { cn } from "@/lib/utils";

// Variant B (D-01): the logbook opens with the status entry. The status line
// carries the entry date (updatedAt, not a live clock), a 1px rule sits 16px
// below it, then the headline and the CTA 48px apart. Columns 2-9 at lg.
export function HeroB({ settings, locale, cta }: HeroProps) {
  // An empty headline means the hero is not rendered (localized() keeps "").
  const headline = localized(settings, "headline", locale) as string;
  if (headline.trim() === "") {
    return null;
  }

  return (
    <section aria-labelledby="hero-title" className={heroSectionClass}>
      <StatusLine
        settings={settings}
        locale={locale}
        showEntryDate
        className="lg:col-span-8 lg:col-start-2"
      />
      <hr className="mt-4 border-border lg:col-span-8 lg:col-start-2" />
      <h1
        id="hero-title"
        className={cn(heroTitleClass, "mt-12 lg:col-span-8 lg:col-start-2")}
      >
        {headline}
      </h1>
      <HeroCta cta={cta} className="mt-12 lg:col-span-8 lg:col-start-2" />
    </section>
  );
}
