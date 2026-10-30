import type { ReactNode } from "react";
import { SectionNumber } from "@/components/site/section-number";
import { labMessages } from "@/lib/messages";
import {
  ContrastTable,
  RadiusSamples,
  SpacingScale,
  TokenSwatchColumn,
  TypeSpecimen,
} from "../_components/specimens";

const t = labMessages.tokens;

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
    </main>
  );
}
