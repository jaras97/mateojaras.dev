import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import {
  HeroCta,
  type HeroProps,
  heroSectionClass,
  heroTitleClass,
} from "@/components/site/hero/hero-parts";
import { heroCopy } from "@/components/site/hero-copy";
import { LocalTime } from "@/components/site/local-time";
import { StatusClockScript } from "@/components/site/status-clock-script";
import { StatusLine } from "@/components/site/status-line";
import { localized } from "@/lib/i18n-fields";
import { cn } from "@/lib/utils";

// Variant A (D-01): the headline leads, the status line sits 32px below it and
// the CTA 48px below that, all in columns 2-9 at lg.
export function HeroA({ settings, locale, cta }: HeroProps) {
  // An empty headline means the hero is not rendered (localized() keeps "").
  const copy = heroCopy[locale];
  const headline = localized(settings, "headline", locale) as string;
  if (headline.trim() === "") {
    return null;
  }

  return (
    <section aria-labelledby="hero-title" className={heroSectionClass}>
      <SplitHeading className="lg:col-span-8 lg:col-start-2">
        <h1 id="hero-title" className={heroTitleClass}>
          {headline}
        </h1>
      </SplitHeading>
      <Reveal index={0} className="lg:col-span-8 lg:col-start-2">
        <StatusLine settings={settings} locale={locale} className="mt-8" />
        <StatusClockScript
          template={copy.overlapTemplate}
          timeZone={settings.timezone}
        />
        <LocalTime
          template={copy.overlapTemplate}
          timeZone={settings.timezone}
        />
        <HeroCta cta={cta} className="mt-12" />
      </Reveal>
    </section>
  );
}
