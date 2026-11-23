import { type CSSProperties, Fragment } from "react";
import { Reveal } from "@/components/motion/reveal";
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

  // P4 (MOTN-02 Plan B): words are split on the server and animated with CSS
  // only, so the H1 is in the HTML at first paint and needs no JS to appear.
  // Total stays within 0.7 s: 0.5 s keyframe plus at most 0.2 s of stagger.
  const words = headline.trim().split(/\s+/);
  const step = words.length > 1 ? Math.min(40, 200 / (words.length - 1)) : 0;

  return (
    <section aria-labelledby="hero-title" className={heroSectionClass}>
      <div className="lg:col-span-8 lg:col-start-2">
        <h1
          id="hero-title"
          className={heroTitleClass}
          style={{ "--split-step": `${step}ms` } as CSSProperties}
        >
          {words.map((word, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static server-rendered split, never reordered
            <Fragment key={i}>
              {i > 0 && " "}
              <span
                className="split-word"
                style={{ "--w": i } as CSSProperties}
              >
                {word}
              </span>
            </Fragment>
          ))}
        </h1>
      </div>
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
