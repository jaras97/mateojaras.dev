import Link from "next/link";
import type { Locale } from "@/features/site-settings/types";
import { labMessages } from "@/lib/messages";
import { cn } from "@/lib/utils";

export type LabVariant = "a" | "b" | "c";
export type LabTheme = "light" | "dark";

export type LabParams = { variant: string; theme: LabTheme; lang: Locale };

const t = labMessages.hero.bar;

// Builds a /lab/hero URL from the current params with some of them replaced.
export function labHeroHref(params: LabParams, change: Partial<LabParams>) {
  const next = { ...params, ...change };
  const query = new URLSearchParams({
    variant: next.variant,
    theme: next.theme,
    lang: next.lang,
  });
  return `/lab/hero?${query.toString()}`;
}

type Option = { label: string; href: string; active: boolean };

// The lab's top bar: three groups of plain links, no client JavaScript and no
// accent. The active option is marked with aria-current and an underline.
export function LabBar({
  params,
  notes,
}: {
  params: LabParams;
  notes: string[];
}) {
  const groups: { id: string; label: string; options: Option[] }[] = [
    {
      id: "lab-bar-variant",
      label: t.variant,
      options: (["a", "b", "c"] as const).map((variant) => ({
        label: variant.toUpperCase(),
        href: labHeroHref(params, { variant }),
        active: params.variant === variant,
      })),
    },
    {
      id: "lab-bar-theme",
      label: t.theme,
      options: (["light", "dark"] as const).map((theme) => ({
        label: t[theme],
        href: labHeroHref(params, { theme }),
        active: params.theme === theme,
      })),
    },
    {
      id: "lab-bar-lang",
      label: t.lang,
      options: (["en", "es"] as const).map((lang) => ({
        label: lang.toUpperCase(),
        href: labHeroHref(params, { lang }),
        active: params.lang === lang,
      })),
    },
  ];

  return (
    <nav
      data-lab-bar=""
      aria-label={t.label}
      className="border-b border-border"
    >
      <div className="mx-auto flex max-w-page flex-col gap-2 px-6 py-4 font-mono text-sm md:px-12">
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          {groups.map((group) => (
            <div key={group.id} className="flex items-baseline gap-2">
              <span id={group.id} className="text-muted-foreground">
                {group.label}
              </span>
              <ul aria-labelledby={group.id} className="flex gap-2">
                {group.options.map((option, i) => (
                  <li key={option.href} className="flex gap-2">
                    <Link
                      href={option.href}
                      aria-current={option.active ? "true" : undefined}
                      className={cn(
                        "underline-offset-4 hover:text-foreground motion-safe:transition-colors motion-safe:duration-[160ms]",
                        option.active
                          ? "text-foreground underline"
                          : "text-muted-foreground",
                      )}
                    >
                      {option.label}
                    </Link>
                    {i < group.options.length - 1 ? (
                      <span
                        aria-hidden="true"
                        className="text-muted-foreground"
                      >
                        ·
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {notes.map((note) => (
          <p key={note} className="text-muted-foreground">
            {note}
          </p>
        ))}
      </div>
    </nav>
  );
}
