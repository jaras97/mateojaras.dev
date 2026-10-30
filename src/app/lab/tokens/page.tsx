import type { ReactNode } from "react";
import { SectionNumber } from "@/components/site/section-number";
import { StatusLine } from "@/components/site/status-line";
import { Button } from "@/components/ui/button";
import { heroFixture, heroFixtureMeta } from "@/features/site-settings/fixture";
import type { HeroSettings, Locale } from "@/features/site-settings/types";
import { labMessages } from "@/lib/messages";
import {
  ContrastTable,
  RadiusSamples,
  SpacingScale,
  TokenSwatchColumn,
  TypeSpecimen,
} from "../_components/specimens";

const t = labMessages.tokens;

// Section 04 data: every variant in every text size (labels are the variant
// names), plus one disabled example.
const BUTTON_VARIANTS = [
  "default",
  "outline",
  "secondary",
  "ghost",
  "link",
] as const;
const BUTTON_SIZES = ["sm", "default", "lg"] as const;

// Section 05: format samples of every StatusLine state, each derived from the
// fixture with an override. None of them is Teo's availability; the
// from_date date is the docs/copy.md format example.
const rows = t.statusLine.rows;
const STATUS_ROWS: {
  label: string;
  locale: Locale;
  settings: HeroSettings;
  showEntryDate?: boolean;
}[] = [
  {
    label: rows.openEn,
    locale: "en",
    settings: { ...heroFixture, availabilityStatus: "open" },
  },
  {
    label: rows.openEs,
    locale: "es",
    settings: { ...heroFixture, availabilityStatus: "open" },
  },
  {
    label: rows.fromDateEn,
    locale: "en",
    settings: {
      ...heroFixture,
      availabilityStatus: "from_date",
      availableFrom: "2026-11-01",
    },
  },
  {
    label: rows.fromDateEs,
    locale: "es",
    settings: {
      ...heroFixture,
      availabilityStatus: "from_date",
      availableFrom: "2026-11-01",
    },
  },
  {
    label: rows.fromDateNoDate,
    locale: "en",
    settings: {
      ...heroFixture,
      availabilityStatus: "from_date",
      availableFrom: null,
    },
  },
  {
    label: rows.closedEn,
    locale: "en",
    settings: { ...heroFixture, availabilityStatus: "closed" },
  },
  {
    label: rows.closedEs,
    locale: "es",
    settings: { ...heroFixture, availabilityStatus: "closed" },
  },
  {
    label: rows.openEnEntryDate,
    locale: "en",
    settings: { ...heroFixture, availabilityStatus: "open" },
    showEntryDate: true,
  },
];

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-12 border-t border-border pt-6">
      <div className="flex items-baseline gap-4">
        <SectionNumber number={number} />
        <h2 className="font-heading text-xl font-semibold">{title}</h2>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function LabTokensPage() {
  return (
    <main className="mx-auto max-w-page px-6 py-12 md:px-12 lg:py-16">
      <h1 className="font-heading text-4xl font-semibold tracking-display text-balance">
        {t.title}
      </h1>

      <Section number="01" title={t.sections.color}>
        <div className="grid gap-6 md:grid-cols-2">
          <TokenSwatchColumn theme="light" />
          <TokenSwatchColumn theme="dark" />
        </div>
        <div className="mt-8">
          <ContrastTable />
        </div>
      </Section>

      <Section number="02" title={t.sections.typography}>
        <TypeSpecimen />
        <div className="mt-12 border-b border-border pb-4">
          <p className="font-mono text-sm text-muted-foreground">
            {t.typography.fixtureHeadline} · {heroFixtureMeta.headlineSource}
          </p>
          <p
            lang="en"
            className="mt-1 font-heading text-4xl font-semibold tracking-display text-balance"
          >
            {heroFixture.headlineEn}
          </p>
        </div>
      </Section>

      <Section number="03" title={t.sections.spacing}>
        <SpacingScale />
        <div className="mt-8">
          <RadiusSamples />
        </div>
      </Section>

      <Section number="04" title={t.sections.components}>
        <ul className="flex flex-col gap-6">
          {BUTTON_VARIANTS.map((variant) => (
            <li key={variant} className="flex flex-wrap items-center gap-4">
              {BUTTON_SIZES.map((size) => (
                <Button key={size} variant={variant} size={size}>
                  {variant}
                </Button>
              ))}
            </li>
          ))}
          <li className="flex flex-wrap items-center gap-4">
            <Button disabled>disabled</Button>
          </li>
        </ul>
      </Section>

      <Section number="05" title={t.sections.statusLine}>
        <p className="font-mono text-sm text-muted-foreground">
          {t.statusLine.note}
        </p>
        <ul className="mt-6 flex flex-col gap-6">
          {STATUS_ROWS.map((row) => (
            <li key={row.label} className="border-b border-border pb-4">
              <p className="font-mono text-sm text-muted-foreground">
                {row.label}
              </p>
              <div lang={row.locale} className="mt-2">
                <StatusLine
                  settings={row.settings}
                  locale={row.locale}
                  showEntryDate={row.showEntryDate}
                />
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
