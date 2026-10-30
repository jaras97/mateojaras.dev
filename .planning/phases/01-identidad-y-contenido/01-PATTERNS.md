# Phase 01: Identidad y contenido - Pattern Map

**Mapped:** 2026-10-30
**Files analyzed:** 30 (new or modified)
**Analogs found:** 6 / 30 (the repo is a near-fresh scaffold. Tracked source is only `src/app/{layout.tsx,globals.css,page.tsx}`, `src/components/ui/button.tsx`, `src/lib/utils.ts`, `next.config.ts`, `biome.json`, `package.json`, `tsconfig.json`)

All analog paths below are git-tracked (`git ls-files` checked). No mirror paths.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/app/globals.css` (MODIFY) | config (theme) | transform | itself (scaffold shadcn theme) | exact (rewrite in place) |
| `src/app/fonts.ts` (NEW) | config | build-time | `src/app/layout.tsx` lines 2-13 | role-match |
| `src/app/layout.tsx` (MODIFY) | root layout | request-response | itself | exact |
| `src/components/ui/button.tsx` (MODIFY) | component (shadcn) | presentational | itself | exact (retheme in place) |
| `src/app/lab/layout.tsx` (NEW) | layout | request-response | `src/app/layout.tsx` (Metadata + LayoutProps) | role-match |
| `src/app/lab/page.tsx` (NEW) | route page | static | `src/app/page.tsx` (shape only) | partial |
| `src/app/lab/tokens/page.tsx` (NEW) | route page | static | none | no analog |
| `src/app/lab/hero/page.tsx` (NEW) | route page | request-response (searchParams in Suspense) | none (Next docs) | no analog |
| `src/app/lab/_components/*` (NEW) | component | presentational | `src/components/ui/button.tsx` (cn + props style) | partial |
| `src/components/site/status-line.tsx` (NEW) | component (RSC) | presentational | `button.tsx` (cn usage) | partial |
| `src/components/site/section-number.tsx` (NEW) | component (RSC) | presentational | `button.tsx` | partial |
| `src/components/site/hero/hero-{a,b,c}.tsx` (NEW) | component (RSC) | presentational | `button.tsx` (consumes it via `render`) | partial |
| `src/features/site-settings/types.ts` (NEW) | model (types) | — | `docs/data-model.md` (spec, not code) | no code analog |
| `src/features/site-settings/fixture.ts` (NEW) | fixture | build-time | none | no analog |
| `src/lib/i18n-fields.ts` (NEW) | utility | transform | `src/lib/utils.ts` (location/style only) | partial |
| `src/lib/format.ts` + `format.test.ts` (NEW) | utility + test | transform | none (no tests exist yet) | no analog |
| `src/features/projects/content-schema.ts` + `.test.ts` (NEW, if `yaml` approved) | model (Zod) + test | validation | none | no analog |
| `scripts/capture-material.ts` (NEW) | script | file-I/O | none | no analog |
| `scripts/capture-lab.ts` (NEW, or flag on the above) | script | file-I/O | none | no analog |
| `scripts/verify-pdf-fonts.py` (NEW, optional) | script | file-I/O | none | no analog |
| `assets/fonts-pdf/*.ttf` + `OFL-*.txt` (NEW) | asset | — | none | n/a |
| `biome.json` (MODIFY) | config | — | itself | exact |
| `package.json` (MODIFY: `typecheck`, `check`, `test` scripts) | config | — | itself | exact |
| `docs/content/<slug>.md` x4 (NEW) | content | — | `docs/data-model.md` field names | spec only |
| `material/<slug>/NN-view.{png,webp}` + `README.md` | asset | — | none | n/a |
| `docs/copy.md` (MODIFY, remove Proyectos block + Teo's text) | content | — | itself | exact |
| `docs/decisions.md` (MODIFY, append) | doc | — | itself, existing entries | exact |
| `DESIGN.md` (MODIFY §2, §3, §4 em-dash, Estado) | doc | — | itself | exact |

## Pattern Assignments

### `src/app/globals.css` (config, transform) — rewrite in place

**Analog:** current `src/app/globals.css`.

**Keep** (lines 1-5):
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));
```
**Keep** `@layer base` (lines 120-130), but change `outline-ring/50` to plain `outline-ring` (the 50% ring drops below 3:1 on light, UI-SPEC "Button: tema"):
```css
@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
  html { @apply font-sans; }
}
```
**Delete:** lines 10 (`--font-sans: var(--font-sans)` self-reference), 12 (`--font-heading: var(--font-sans)`), 13-25 (`--color-sidebar-*`, `--color-chart-*`), 29 (`--color-destructive`), 42-48 radius calc lines (replace), and the entire gray `:root` (51-84) and `.dark` (86-118) blocks.

**Replace with:** RESEARCH.md Pattern 1 skeleton (DESIGN.md:24-41 token values verbatim; alias block on `:root, .dark`, NOT `:root` only, Pitfall 1), `--color-accent: var(--bg-elev)`, `--color-signal: var(--accent)`, fonts mapped to `--font-hanken-grotesk` / `--font-funnel-display` / `--font-geist-mono`, radii `--radius-sm|md|lg: var(--radius)`, `--radius-xl: 0.5rem`, `--radius: 0.25rem`. Plus a plain (non-inline) `@theme` block overriding all 8 `--text-*` and all 8 `--text-*--line-height` pairs (RESEARCH Pattern 2; 1.55 for xs..lg, 1.1 for xl..4xl).

---

### `src/app/fonts.ts` (config, build-time) — NEW

**Analog:** `src/app/layout.tsx` lines 2, 5-13 (the only `next/font/google` usage):
```ts
import { Geist, Geist_Mono } from "next/font/google";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```
Move this into `src/app/fonts.ts`, swap to `Funnel_Display`, `Hanken_Grotesk`, `Geist_Mono` with `subsets: ["latin", "latin-ext"]`, `display: "swap"`, variables `--font-funnel-display`, `--font-hanken-grotesk`, `--font-geist-mono`, and export a `fontVariables` string (RESEARCH Pattern 3; authoritative source `node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md:483-495`). Drop `Geist` sans entirely (D-16).

---

### `src/app/layout.tsx` (root layout) — MODIFY

**Analog:** itself. Keep structure (lines 15-29), change fonts and metadata:
```tsx
export const metadata: Metadata = {
  title: "Create Next App",              // -> "Mateo Jaramillo", no description (UI-SPEC)
  description: "Generated by create next app",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"                           // keep; [locale] layout is phase 2
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}  // -> `${fontVariables} h-full antialiased`
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```
Conventions to keep: `import type { Metadata } from "next"`, global `LayoutProps<"...">` / `PageProps<"...">` typed-route helpers (no import), double quotes + semicolons in `src/app/*`.

---

### `src/components/ui/button.tsx` (shadcn component) — MODIFY in place

**Analog:** itself. Keep the module shape (lines 1-5, 42-57):
```tsx
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
...
function Button({ className, variant = "default", size = "default", ...props }:
  ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return <ButtonPrimitive data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}
export { Button, buttonVariants }
```
Edits required by UI-SPEC "Button: tema":
- Base (line 6): `rounded-lg` -> `rounded-[var(--radius)]`; `font-medium` -> `font-semibold`; `transition-all` -> `motion-safe:transition-colors motion-safe:duration-[160ms]`; `focus-visible:ring-3 focus-visible:ring-ring/50` -> `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`; `active:...translate-y-px` under `motion-safe:`; strip every `aria-invalid:*destructive*` class.
- Variants: remove `destructive` (line 17-18, no token). `default` hover `/80` -> `/90`. Strip `dark:bg-input/30`, `dark:hover:*` from `outline`/`ghost` (hover is `bg-muted`).
- Sizes: `sm` h-8 px-4 gap-2; `default` h-10 px-4 gap-2; `lg` h-11 px-6 gap-2; `icon` size-10, `icon-sm` size-8, `icon-lg` size-11; delete `xs`, `icon-xs`; `rounded-[min(var(--radius-md),…)]` -> `rounded-[var(--radius)]`; no `text-[0.8rem]`/`text-xs`.
- Note: Biome formatting will add semicolons to this file (Pitfall 5 Wave 0 `pnpm format`).

**CTA usage pattern** (heroes): Base UI link-button
```tsx
<Button size="lg" nativeButton={false} render={<a href={cta.href} />}>{cta.label}</Button>
```

---

### `src/app/lab/layout.tsx` (layout) — NEW

**Analog:** `src/app/layout.tsx` (Metadata export + `LayoutProps`). Pattern:
```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default function LabLayout({ children }: LayoutProps<"/lab">) {
  if (process.env.VERCEL_ENV === "production") notFound();
  return children;
}
```
Source: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md` (robots). Must NOT add `<html>`/`<body>` (root layout owns them in phase 1; Pitfall 10).

### `src/app/lab/page.tsx`, `src/app/lab/tokens/page.tsx` (static pages) — NEW

**Analog:** none meaningful (`src/app/page.tsx` is the create-next-app placeholder and must not be touched, D-02). Fully static RSC, default export, no runtime APIs. Content contract: UI-SPEC "Contenido de /lab/tokens" (5 sections, `SectionNumber` + h2). Plain `<a>` links (A4; switch to `next/link` if Biome's `next` domain flags them).

### `src/app/lab/hero/page.tsx` (request-response) — NEW

**No in-repo analog.** Copy RESEARCH.md Pattern 5 (lines 413-430): `searchParams` awaited inside a child rendered within `<Suspense fallback={<div className="min-h-dvh bg-background" />}>`. Authoritative: `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md:161-191`. Whitelist `variant` (a|b|c, unknown -> UI-SPEC error copy), `lang` (en|es), `theme` (light|dark), `capture=1` hides the bar. Theme by putting `dark` class on the lab container (aliases work because of `:root, .dark`; `dark:` utilities only apply to descendants).

---

### `src/components/site/status-line.tsx`, `section-number.tsx`, `hero/hero-{a,b,c}.tsx` (RSC presentational) — NEW

**Closest analog:** `src/components/ui/button.tsx` for conventions only:
- `import { cn } from "cn"` (or `@/lib/utils`, which re-exports it: `src/lib/utils.ts:1` `export { cn } from "cn"`). Pick one and use it consistently; shadcn files use `"cn"` directly.
- Named function components, named exports, `className` passthrough merged with `cn`.
- No `'use client'`, no hooks, no motion (D-04).

Contract (UI-SPEC "Las 3 variantes" + "StatusLine"):
- Props: `{ settings: HeroSettings; locale: "en" | "es"; cta: { label: string; href: string } }`.
- `<section aria-labelledby="hero-title">`, `h1#hero-title` via `localized(settings, "headline", locale)`; return `null` if the headline is empty string (fallback in `localized` does not catch `""`).
- StatusLine uses `formatMonthYear` / `formatUtcOffset` / `formatEntryDate` from `src/lib/format.ts` (never hardcode `UTC-5`, never `toISOString().slice(0,10)`); dot `size-2 rounded-full bg-signal` (or `bg-ink-2` when `closed`), `aria-hidden`.
- Spacing utilities limited to `1, 2, 4, 6, 8, 12, 16`.

---

### `src/features/site-settings/types.ts` + `fixture.ts` — NEW

**No code analog.** Source of truth `docs/data-model.md:8, 24, 28-44`. Copy the type block verbatim from RESEARCH.md Pattern 4 (lines 382-400): `availableFrom: string | null` (Drizzle `date()` string mode), `updatedAt: Date`. Fixture: `export const heroFixture = { … } satisfies HeroSettings` + `heroFixtureMeta = { headlineSource: "docs/copy.md (ejemplo, borrador)" }`. Values only from Teo's checkpoint; unknowns `null`.

### `src/lib/i18n-fields.ts` — NEW
Copy exactly from `docs/data-model.md:150-153` (reproduced in RESEARCH Pattern 4, lines 404-408). Location follows `src/lib/utils.ts`.

### `src/lib/format.ts` + `src/lib/format.test.ts` — NEW
**No analog** (no test exists in repo; no vitest config, no `test` script). Copy RESEARCH.md "Code Examples" (lines 615-627). Tests colocated (`*.test.ts`, CLAUDE.md). Cases: `2026-11-01` -> `Nov 2026` / `nov 2026` regardless of local TZ; `America/Bogota` -> `UTC-5`; `UTC` zone -> `UTC`; `formatEntryDate` at 2026-10-31T01:00Z -> `2026-10-30`. Needs a minimal `vitest.config.ts` (none exists; `@vitejs/plugin-react`, `vitest`, `jsdom` already installed; path alias via `resolve.tsconfigPaths` per `.claude/CLAUDE.md` §14).

### `src/features/projects/content-schema.ts` + `.test.ts` — NEW (conditional on `yaml` approval)
**No analog.** Zod 4 (installed). Shape from RESEARCH Pattern 6 (lines 446-486) mapped to `docs/data-model.md:47-72`. Includes number-parity anti-invention test. Fallback if declined: `python3 -I` PyYAML script.

---

### `scripts/capture-material.ts`, `scripts/capture-lab.ts` (file-I/O scripts) — NEW
**No analog** (no `scripts/` dir). Copy RESEARCH Pattern 7 (lines 503-511): `import { chromium } from "@playwright/test"`, 1440x900 @ `deviceScaleFactor: 2`, `reducedMotion: "reduce"`, wait `document.fonts.ready`, per-view `setup` (ManuJ modal/carousel/floating button; EcoExport use `www.`), WebP 1600x1000 via in-page canvas `toDataURL("image/webp")`. Single file, no relative `.ts` imports, run with `node scripts/…ts` (Node 24 type stripping). Lab captures against `pnpm build && pnpm start`, matrix per UI-SPEC "Revisión antes de la elección" (24 shots).

### `assets/fonts-pdf/*` — NEW
No analog. Commands in RESEARCH Pattern 8 (lines 523-539) + "Font verification gate" (lines 632-635). Commit `OFL-*.txt` alongside.

---

### `biome.json` / `package.json` — MODIFY (Wave 0, Pitfall 5)
`biome.json:10` current:
```json
"includes": ["**", "!node_modules", "!.next", "!dist", "!build"]
```
-> add `"!.claude", "!.agents", "!.planning"`. Never edit vendored skill files to satisfy lint.
`package.json:5-11` scripts: add `"typecheck": "tsc --noEmit"`, `"test": "vitest run"`, provisional `"check"` (typecheck + lint + test + build). No dependency changes without Teo (`yaml`, `@axe-core/playwright` are a `blocking-human` decision).

### `docs/decisions.md` — append
Use the existing entry format (lines 5-13):
```
## YYYY-MM-DD · <título corto>
Contexto: …
Decisión: …
Quién: Teo | Claude Code (aprobado por Teo) | Claude Code (autónomo, dentro de los límites)
Por qué: …
Verificación: …
```
Entries expected: variant pick, `--color-signal` naming, Biome exclusions, `/lab` deletion timing, material/ gitignore policy, P1-P5 answers.

### `docs/content/<slug>.md`, `docs/copy.md`, `DESIGN.md`, `material/`
Human-authored content; no code pattern. Format from RESEARCH Pattern 6 (headings = exact camelCase field names). Note `.gitignore:44-45` ignores `/material/` (Open Q1, needs Teo's decision before capture plan).

## Shared Patterns

### Class merging
**Source:** `src/lib/utils.ts:1` (`export { cn } from "cn"`), used in `src/components/ui/button.tsx:3,51`. Apply to all new components.

### Theming via tokens only
**Source:** new `globals.css`. Components use `bg-background`, `text-foreground`, `text-muted-foreground` (= `--ink-2`), `border-border`, `bg-signal` (the only accent path). Never raw OKLCH, never `shadow-*`, never gradients. Accent max one element per view (status dot) plus focus ring.

### Typed routes / metadata
**Source:** `src/app/layout.tsx:1,15,20` (`import type { Metadata }`, global `LayoutProps<"/">`). Use `PageProps<"/lab/hero">` for pages; run `next typegen`/`pnpm build` if types are missing.

### Runtime APIs under `cacheComponents`
**Source:** `next.config.ts:5` (`cacheComponents: true`, `partialPrefetching: true`). Any `searchParams` read goes inside `<Suspense>`; no `new Date()` in prerendered RSC (use fixture `updatedAt`).

### Content provenance
No invented text anywhere: components return `null` on missing data; grep gates for placeholders, `draft-translation`, em-dashes (RESEARCH Pitfall 8).

## No Analog Found

| File | Role | Data Flow | Reason / Source to use |
|---|---|---|---|
| `src/app/lab/hero/page.tsx` | page | searchParams in Suspense | No dynamic routes yet. Use `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` + RESEARCH Pattern 5 |
| `src/app/lab/tokens/page.tsx` | page | static | Only scaffold placeholder exists. Use UI-SPEC content contract |
| `src/features/site-settings/{types,fixture}.ts` | model | — | No features dir yet. Use `docs/data-model.md` + RESEARCH Pattern 4 |
| `src/lib/format.ts` + test | utility/test | transform | No tests or vitest config yet. RESEARCH Code Examples |
| `src/features/projects/content-schema.ts` + test | model | validation | No Zod schemas yet. RESEARCH Pattern 6 |
| `scripts/capture-*.ts`, `scripts/verify-pdf-fonts.py` | script | file-I/O | No scripts dir. RESEARCH Patterns 7, 8 |
| `assets/fonts-pdf/*` | asset | — | RESEARCH Pattern 8 |

## Metadata

**Analog search scope:** all git-tracked files outside `.planning/`, `.claude/`, `.agents/` (32 files)
**Files scanned:** 9 (globals.css, layout.tsx, button.tsx, utils.ts, next.config.ts, package.json, tsconfig.json, biome.json, docs/decisions.md) + .gitignore
**Pattern extraction date:** 2026-10-30
