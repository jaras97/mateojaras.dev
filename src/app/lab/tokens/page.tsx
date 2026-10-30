import type { ReactNode } from "react";
import { SectionNumber } from "@/components/site/section-number";
import { Button } from "@/components/ui/button";
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
    </main>
  );
}
