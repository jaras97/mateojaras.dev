import { buttonVariants } from "@/components/ui/button";
import type { HeroSettings, Locale } from "@/features/site-settings/types";

// Shared by the three hero variants (D-01): same props, container, headline
// style and CTA. Static Server Components, no client directive, no animation.

export type HeroProps = {
  settings: HeroSettings;
  locale: Locale;
  cta: { label: string; href: string };
};

// 12-column grid from lg, 1200px max, 24/48px side margins (DESIGN.md §4).
export const pageGridClass =
  "mx-auto grid max-w-page grid-cols-1 gap-x-6 px-6 py-12 md:px-12 lg:grid-cols-12 lg:py-16";

export const heroSectionClass = pageGridClass;

// The display headline (h1#hero-title): never truncated, never below 44.8px.
export const heroTitleClass =
  "font-heading text-4xl font-semibold tracking-display text-balance hyphens-manual text-foreground";

// The 44px CTA, rendered as a link to the contact route of the locale.
export function HeroCta({
  cta,
  className,
}: {
  cta: HeroProps["cta"];
  className?: string;
}) {
  return (
    <div className={className}>
      <a href={cta.href} className={buttonVariants({ size: "lg" })}>
        {cta.label}
      </a>
    </div>
  );
}
