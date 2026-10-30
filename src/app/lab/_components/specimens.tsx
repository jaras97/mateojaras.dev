import { labMessages } from "@/lib/messages";
import { cn } from "@/lib/utils";

// Specimen pieces for /lab/tokens. Token names, values and contrast rows are
// data copied verbatim from DESIGN.md §3 and the UI-SPEC; the chrome around
// them comes from messages/. Deleted with /lab.

const t = labMessages.tokens;

export const TOKENS = [
  {
    name: "--bg",
    light: "oklch(0.985 0.006 80)",
    dark: "oklch(0.17 0.01 260)",
  },
  {
    name: "--bg-elev",
    light: "oklch(0.965 0.008 80)",
    dark: "oklch(0.21 0.012 260)",
  },
  {
    name: "--ink",
    light: "oklch(0.24 0.03 260)",
    dark: "oklch(0.94 0.01 80)",
  },
  {
    name: "--ink-2",
    light: "oklch(0.48 0.02 260)",
    dark: "oklch(0.70 0.015 260)",
  },
  {
    name: "--line",
    light: "oklch(0.88 0.01 80)",
    dark: "oklch(0.30 0.012 260)",
  },
  {
    name: "--accent",
    light: "oklch(0.66 0.17 40)",
    dark: "oklch(0.72 0.16 40)",
  },
  {
    name: "--accent-ink",
    light: "oklch(0.99 0 0)",
    dark: "oklch(0.15 0.02 40)",
  },
] as const;

type Theme = "light" | "dark";

// The dark column is a nested .dark container: the tokens and the shadcn
// aliases re-resolve inside it, so both themes show at once.
export function TokenSwatchColumn({ theme }: { theme: Theme }) {
  return (
    <div
      className={cn(
        theme === "dark" && "dark",
        "bg-background p-4 text-foreground",
      )}
    >
      <h3 className="font-mono text-sm">
        {theme === "dark" ? t.color.dark : t.color.light}
      </h3>
      <ul className="mt-4 grid gap-4 lg:grid-cols-2">
        {TOKENS.map((token) => (
          <li key={token.name}>
            <div
              className="h-16 border border-border"
              style={{ background: `var(${token.name})` }}
            />
            <p className="mt-2 font-mono text-sm">{token.name}</p>
            <p className="font-mono text-sm text-muted-foreground">
              {token[theme]}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// UI-SPEC "Contraste medido", measured 2026-10-30 (WCAG 2.x).
const CONTRAST_ROWS = [
  {
    pair: "--ink sobre --bg",
    light: "15.76",
    dark: "16.03",
    verdict: "AA texto",
  },
  {
    pair: "--ink-2 sobre --bg",
    light: "6.26",
    dark: "7.16",
    verdict: "AA texto",
  },
  {
    pair: "--ink-2 sobre --bg-elev",
    light: "5.90",
    dark: "6.63",
    verdict: "AA texto",
  },
  {
    pair: "--accent sobre --bg",
    light: "3.19",
    dark: "7.26",
    verdict:
      "Claro: pasa 3:1 (no texto, texto ≥24px) y falla 4.5:1 para texto normal",
  },
  {
    pair: "--accent sobre --bg-elev",
    light: "3.01",
    dark: "6.72",
    verdict: "Claro: en el límite de 3:1",
  },
  {
    pair: "--accent-ink sobre --accent",
    light: "3.24",
    dark: "7.48",
    verdict: "Claro: falla para texto de 14–16px",
  },
  {
    pair: "--line sobre --bg",
    light: "1.38",
    dark: "1.40",
    verdict: "Solo decorativo; nunca es el único indicador de un control",
  },
] as const;

export function ContrastTable() {
  const cell = "border-b border-border py-2 pr-4 align-top";
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse font-mono text-sm">
        <caption className="pb-2 text-left text-muted-foreground">
          {t.color.contrastCaption}
        </caption>
        <thead>
          <tr className="text-left text-muted-foreground">
            <th scope="col" className={cn(cell, "font-normal")}>
              {t.color.contrastPair}
            </th>
            <th scope="col" className={cn(cell, "font-normal")}>
              {t.color.light}
            </th>
            <th scope="col" className={cn(cell, "font-normal")}>
              {t.color.dark}
            </th>
            <th scope="col" className={cn(cell, "font-normal")}>
              {t.color.contrastVerdict}
            </th>
          </tr>
        </thead>
        <tbody>
          {CONTRAST_ROWS.map((row) => (
            <tr key={row.pair}>
              <th scope="row" className={cn(cell, "text-left font-normal")}>
                {row.pair}
              </th>
              <td className={cell}>{row.light}</td>
              <td className={cell}>{row.dark}</td>
              <td className={cn(cell, "min-w-64")}>{row.verdict}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const SAMPLE = "Aa Bb Cc 0123456789 á é í ó ú ü ñ Ñ ¿ ¡";

// The specimen rows below are the token-inspection exception of the UI-SPEC:
// they render every step and sample weight; nothing else reuses them.
const FAMILIES = [
  { label: "Funnel Display 500", className: "font-heading font-medium" },
  { label: "Funnel Display 600", className: "font-heading font-semibold" },
  { label: "Funnel Display 700", className: "font-heading font-bold" },
  { label: "Hanken Grotesk 400", className: "font-sans font-normal" },
  { label: "Hanken Grotesk 500", className: "font-sans font-medium" },
  { label: "Hanken Grotesk 600", className: "font-sans font-semibold" },
  { label: "Geist Mono 400", className: "font-mono font-normal" },
] as const;

const SCALE = [
  { label: "--text-xs 0.75rem / 1.55", className: "font-sans text-xs" },
  { label: "--text-sm 0.875rem / 1.55", className: "font-sans text-sm" },
  { label: "--text-base 1rem / 1.55", className: "font-sans text-base" },
  { label: "--text-lg 1.25rem / 1.55", className: "font-sans text-lg" },
  {
    label: "--text-xl 1.563rem / 1.1",
    className: "font-heading text-xl tracking-display",
  },
  {
    label: "--text-2xl 1.953rem / 1.1",
    className: "font-heading text-2xl tracking-display",
  },
  {
    label: "--text-3xl 2.441rem / 1.1",
    className: "font-heading text-3xl tracking-display",
  },
  {
    label: "--text-4xl clamp(2.8rem, 6vw, 4.5rem) / 1.1",
    className: "font-heading text-4xl tracking-display",
  },
] as const;

function SpecimenRow({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <li className="border-b border-border pb-4">
      <p className="font-mono text-sm text-muted-foreground">{label}</p>
      <p className={cn("mt-1 break-words", className)}>{SAMPLE}</p>
    </li>
  );
}

export function TypeSpecimen() {
  return (
    <div className="flex flex-col gap-12">
      <div>
        <h3 className="font-mono text-sm">{t.typography.families}</h3>
        <ul className="mt-4 flex flex-col gap-4">
          {FAMILIES.map((row) => (
            <SpecimenRow
              key={row.label}
              label={row.label}
              className={cn("text-2xl", row.className)}
            />
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-mono text-sm">{t.typography.scale}</h3>
        <ul className="mt-4 flex flex-col gap-4">
          {SCALE.map((row) => (
            <SpecimenRow
              key={row.label}
              label={row.label}
              className={row.className}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

// Active spacing scale of phase 1 (UI-SPEC "Spacing Scale").
const SPACING = [
  { token: "xs", px: "4px", className: "w-1" },
  { token: "sm", px: "8px", className: "w-2" },
  { token: "md", px: "16px", className: "w-4" },
  { token: "lg", px: "24px", className: "w-6" },
  { token: "xl", px: "32px", className: "w-8" },
  { token: "2xl", px: "48px", className: "w-12" },
  { token: "3xl", px: "64px", className: "w-16" },
] as const;

export function SpacingScale() {
  return (
    <div>
      <ul className="flex flex-col gap-2">
        {SPACING.map((step) => (
          <li key={step.token} className="flex items-center gap-4">
            <span className="w-20 shrink-0 font-mono text-sm">
              {step.token} {step.px}
            </span>
            <span className={cn("h-4 bg-ink-2", step.className)} />
          </li>
        ))}
      </ul>
      <p className="mt-4 font-mono text-sm text-muted-foreground">
        {t.spacing.unusedNote}
      </p>
    </div>
  );
}

const RADII = [
  { label: t.spacing.radiusControl, value: "4px", className: "rounded-sm" },
  { label: t.spacing.radiusImage, value: "8px", className: "rounded-xl" },
  { label: t.spacing.radiusContainer, value: "0", className: "rounded-none" },
] as const;

export function RadiusSamples() {
  return (
    <ul className="flex flex-wrap gap-8">
      {RADII.map((radius) => (
        <li key={radius.value}>
          <div
            className={cn(
              "size-16 border border-border bg-muted",
              radius.className,
            )}
          />
          <p className="mt-2 font-mono text-sm">{radius.label}</p>
          <p className="font-mono text-sm text-muted-foreground">
            {radius.value}
          </p>
        </li>
      ))}
    </ul>
  );
}
