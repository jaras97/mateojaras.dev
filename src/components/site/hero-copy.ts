import type { Locale } from "@/features/site-settings/types";
import { fill, heroMessages } from "@/lib/messages";

// Hero interface strings, read from the Hero namespace of messages/*.json.
// This file holds only routes, index numbers and the approval status. Phase 2
// replaces it with getTranslations over the same keys.

export type HeroCopy = {
  availability: {
    open: string;
    fromDate: (date: string) => string;
    closed: string;
  };
  overlap: string;
  cta: { label: string; href: string };
  index: { number: string; label: string }[];
};

const CTA_HREF: Record<Locale, string> = {
  en: "/contact",
  es: "/es/contacto",
};

function buildHeroCopy(locale: Locale): HeroCopy {
  const m = heroMessages[locale];
  return {
    availability: {
      open: m.availability.open,
      fromDate: (date) => fill(m.availability.fromDate, { date }),
      closed: m.availability.closed,
    },
    overlap: m.overlap,
    cta: { label: m.cta, href: CTA_HREF[locale] },
    index: [
      { number: "01", label: m.index.work },
      { number: "02", label: m.index.about },
      { number: "03", label: m.index.contact },
    ],
  };
}

export const heroCopy: Record<Locale, HeroCopy> = {
  en: buildHeroCopy("en"),
  es: buildHeroCopy("es"),
};

// The Hero strings are Claude's UI-SPEC proposals. Only 01-13 flips this to
// approved, after Teo approves them at G7 (01-12). Silence never approves.
export type HeroCopyStatus = "draft" | "approved";

export const heroCopyMeta: { source: string; status: HeroCopyStatus } = {
  source: "UI-SPEC Copywriting Contract (propuesta de Claude)",
  status: "draft",
};
