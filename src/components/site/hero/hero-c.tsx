import {
  HeroCta,
  type HeroProps,
  heroSectionClass,
  heroTitleClass,
} from "@/components/site/hero/hero-parts";
import { heroCopy } from "@/components/site/hero-copy";
import { SectionNumber } from "@/components/site/section-number";
import { StatusLine } from "@/components/site/status-line";
import { localized } from "@/lib/i18n-fields";
import { cn } from "@/lib/utils";

// Variant C (D-01): an editorial index. At lg the headline block takes
// columns 1-8 and the numbered list sits in columns 10-12 behind a 1px rule,
// aligned to the top of the headline. Below lg the list follows the CTA.
// The items are plain text: the sections they name arrive in phase 4.
export function HeroC({ settings, locale, cta }: HeroProps) {
  // An empty headline means the hero is not rendered (localized() keeps "").
  const headline = localized(settings, "headline", locale) as string;
  if (headline.trim() === "") {
    return null;
  }

  return (
    <section aria-labelledby="hero-title" className={heroSectionClass}>
      <h1
        id="hero-title"
        className={cn(
          heroTitleClass,
          "lg:col-span-8 lg:col-start-1 lg:row-start-1",
        )}
      >
        {headline}
      </h1>
      <StatusLine
        settings={settings}
        locale={locale}
        className="mt-8 lg:col-span-8 lg:col-start-1"
      />
      <HeroCta cta={cta} className="mt-12 lg:col-span-8 lg:col-start-1" />
      <ol className="mt-12 flex flex-col gap-4 border-t border-border pt-6 lg:col-span-3 lg:col-start-10 lg:row-start-1 lg:mt-0 lg:self-start lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
        {heroCopy[locale].index.map((item) => (
          <li key={item.number} className="flex items-baseline gap-4">
            <SectionNumber number={item.number} />
            <span className="text-base text-foreground">{item.label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
