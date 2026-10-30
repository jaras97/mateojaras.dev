import Link from "next/link";
import { type ComponentType, type ReactNode, Suspense } from "react";
import { HeroA } from "@/components/site/hero/hero-a";
import { HeroB } from "@/components/site/hero/hero-b";
import { HeroC } from "@/components/site/hero/hero-c";
import type { HeroProps } from "@/components/site/hero/hero-parts";
import { heroCopy } from "@/components/site/hero-copy";
import { heroFixture, heroFixtureMeta } from "@/features/site-settings/fixture";
import type { Locale } from "@/features/site-settings/types";
import { localized } from "@/lib/i18n-fields";
import { fill, labMessages } from "@/lib/messages";
import { cn } from "@/lib/utils";
import {
  LabBar,
  type LabParams,
  type LabTheme,
  labHeroHref,
} from "../_components/lab-bar";

const t = labMessages.hero;

const VARIANTS: Record<string, ComponentType<HeroProps>> = {
  a: HeroA,
  b: HeroB,
  c: HeroC,
};

type SearchParams = PageProps<"/lab/hero">["searchParams"];

// searchParams is a runtime API: it is read inside Suspense so the rest of the
// route stays a static shell (cacheComponents). The fallback is the empty
// page background, no spinner and no skeleton.
export default function Page({ searchParams }: PageProps<"/lab/hero">) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <HeroLab searchParams={searchParams} />
    </Suspense>
  );
}

function first(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

// Reads the provenance meta of the fixture headline. The Spanish headline is
// Claude's completion at Teo's request (01-04 G2) and the English one is
// Claude's translation: the bar says so until Teo approves them at G7.
function headlineNotes(): string[] {
  const notes: string[] = [];
  if (heroFixtureMeta.headlineSource.includes("docs/copy.md")) {
    notes.push(t.notes.copyDraft);
  }
  if (heroFixtureMeta.headlineEsStatus === "draft") {
    notes.push(
      fill(t.notes.esDraft, {
        authorship: heroFixtureMeta.headlineAuthorship,
      }),
    );
  }
  if (heroFixtureMeta.headlineEnStatus === "draft-translation") {
    notes.push(t.notes.enDraft);
  }
  return notes;
}

async function HeroLab({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  // Whitelist every parameter. An unknown lang or theme falls back silently;
  // an unknown variant shows the error state below.
  const rawVariant = first(sp.variant) ?? "a";
  const lang: Locale = first(sp.lang) === "es" ? "es" : "en";
  const theme: LabTheme = first(sp.theme) === "dark" ? "dark" : "light";
  const capture = first(sp.capture) === "1";

  const params: LabParams = { variant: rawVariant, theme, lang };
  const Hero = Object.hasOwn(VARIANTS, rawVariant)
    ? VARIANTS[rawVariant]
    : undefined;
  const headline = localized(heroFixture, "headline", lang) as string;

  let content: ReactNode;
  if (Hero === undefined) {
    content = (
      <div className="mx-auto max-w-page px-6 py-12 md:px-12 lg:py-16">
        <p className="max-w-[68ch] text-base break-words">
          {fill(t.unknownVariant, { value: rawVariant })}
        </p>
        <ul className="mt-4 flex gap-4 font-mono text-sm">
          {(["a", "b", "c"] as const).map((variant) => (
            <li key={variant}>
              <Link
                href={labHeroHref(params, { variant })}
                className="underline underline-offset-4"
              >
                {variant.toUpperCase()}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  } else if (headline.trim() === "") {
    content = (
      <div className="mx-auto max-w-page px-6 py-12 md:px-12 lg:py-16">
        <h1 className="font-heading text-xl font-semibold">
          {t.emptyHeadline.heading}
        </h1>
        <p className="mt-4 max-w-[68ch] text-base">{t.emptyHeadline.body}</p>
      </div>
    );
  } else {
    content = (
      <div lang={lang}>
        <Hero settings={heroFixture} locale={lang} cta={heroCopy[lang].cta} />
      </div>
    );
  }

  return (
    <div
      data-lab-root=""
      lang="es"
      className={cn(
        "min-h-dvh bg-background text-foreground",
        theme === "dark" && "dark",
      )}
    >
      {capture ? null : <LabBar params={params} notes={headlineNotes()} />}
      {content}
    </div>
  );
}
