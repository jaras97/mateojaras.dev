import { StatusLine } from "@/components/site/status-line";
import { Button } from "@/components/ui/button";
import type { HeroSettings, Locale } from "@/features/site-settings/types";
import { localized } from "@/lib/i18n-fields";

export type HeroProps = {
  settings: HeroSettings;
  locale: Locale;
  cta: { label: string; href: string };
};

// Variant A (D-01): the headline leads, the status line sits 32px below it and
// the CTA 48px below that, all in columns 2-9 at lg. Static Server Component.
export function HeroA({ settings, locale, cta }: HeroProps) {
  const headline = localized(settings, "headline", locale) as string;
  if (headline.trim() === "") {
    return null;
  }

  return (
    <section
      aria-labelledby="hero-title"
      className="mx-auto grid max-w-page grid-cols-1 gap-x-6 px-6 py-12 md:px-12 lg:grid-cols-12 lg:py-16"
    >
      <h1
        id="hero-title"
        className="font-heading text-4xl font-semibold tracking-display text-balance hyphens-manual text-foreground lg:col-span-8 lg:col-start-2"
      >
        {headline}
      </h1>
      <StatusLine
        settings={settings}
        locale={locale}
        className="mt-8 lg:col-span-8 lg:col-start-2"
      />
      <div className="mt-12 lg:col-span-8 lg:col-start-2">
        <Button
          size="lg"
          nativeButton={false}
          // biome-ignore lint/a11y/useAnchorContent: Base UI renders cta.label (the Button children) inside this anchor
          render={<a href={cta.href} />}
        >
          {cta.label}
        </Button>
      </div>
    </section>
  );
}
