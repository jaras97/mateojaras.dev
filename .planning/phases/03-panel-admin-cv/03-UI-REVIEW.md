# Phase 3 — UI Review

**Audited:** 2026-11-22
**Baseline:** `03-UI-SPEC.md` (approved 2026-11-16), plus `DESIGN.md` and `CLAUDE.md`
**Screenshots:** not captured. No dev server answered on 3000, 5173 or 8080, and nothing was started because of the production-database constraint. This is a code-only audit. Items that need a rendered check are marked `needs_human_review`.
**Focus areas:** public Draft Mode band, Ajustes, Educación.

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Copy lives in messages and follows the contract. Repeated bare "Quitar" buttons and the em-dash glyph as an empty-date placeholder are the gaps. |
| 2. Visuals | 3/4 | Structure matches the spec. The draft band truncates its message on narrow screens, and the shadcn badge is a pill where DESIGN.md says 4px. |
| 3. Color | 3/4 | The accent is confined to the nav indicator and the focus ring. No hardcoded hex found. The `--primary` alias to ink leaves shadcn defaults that bypass the spec's badge recipes. |
| 4. Typography | 2/4 | The "4 sizes, 2 weights" rule is broken. Weight 500 is used in about 14 places, mostly shadcn primitives. There are 7 sizes in the admin, and H1 sizes are inconsistent. |
| 5. Spacing | 3/4 | Page paddings and the 48px section gap match. Top padding is 32px against the spec's 64px, and a few non-scale values come from shadcn. |
| 6. Experience Design | 3/4 | Save, publish, discard, unsaved-guard, toast and error states are all present. Gaps in Ajustes language rows and the draft-exit flow. |

**Overall: 17/24**

---

## Top 3 Priority Fixes

1. **Weight 500 and off-scale sizes leak through the shadcn primitives (WARNING).** `font-medium` is in `table.tsx:72` (every table header), `field.tsx:33,124`, `badge.tsx:7`, `dialog.tsx:123`, `alert-dialog.tsx:120`, `sheet.tsx:106`, `empty.tsx:62`, `popover.tsx:63`, `progress.tsx:59`, `kbd.tsx` and `dropdown-menu.tsx:70`. This puts a third weight on every admin screen, and the spec's "dialog titles 600, table headers 14/600" is not met. Change them all to `font-semibold`. Also change the Panel and login H1 from `text-3xl` (`(panel)/page.tsx:78`, `login/page.tsx:9`) to the `text-[25px]` used everywhere else, or promote 25px to `text-xl`. Change the reader title `text-lg` (`message-reader.tsx:125`) to `text-base`.
2. **Draft band hides its message on phones (WARNING, `needs_human_review`).** In `src/components/site/draft-banner.tsx` the text is `min-w-0 truncate` while the exit button is `whitespace-nowrap`. At 390px the "Salir de la vista previa" button takes about half of the 342px content width. The line "Vista previa · contenido en borrador, no es público" is cut off, and the `title` tooltip does not exist on touch. The one sentence that says "this is not public" is the part that disappears. Let the text wrap (drop `truncate`, use `h-auto min-h-10 py-2`), or shorten the mobile string.
3. **The draft exit only returns to known routes (WARNING).** `PUBLIC_ROUTE` in `src/lib/draft-preview.ts` accepts only `/`, `/es`, `/projects/<slug>` and `/es/proyectos/<slug>`. After the admin clicks any other link while in preview, the exit form posts the current path and `safeReturnPath` silently sends them to `/`. Phase 4 adds `/about` and `/contact`, so the regex needs to grow with the routes, or the exit should return to the admin form that started the preview. Related: the band is `sticky top-0 z-50` and any sticky site header added later will collide with it. Check this when phase 4 builds the header.

Additional fixes (not in the top 3):

4. **Ajustes language rows (`settings-form.tsx:600-650`).** Every row has a button named just "Quitar", so a screen reader cannot tell which language is removed. Use `aria-label` with the code or row number. The code input shows `codeMessage` below the row without `aria-describedby` or an id. There is no Subir/Bajar, which the spec asks of repeaters.
5. **Availability uses `NativeSelect`.** The spec reserves native selects for dense repeater rows and asks for `Select` on enums. This is low-impact, since native is more robust on mobile, but it deviates from the contract. Record it in `docs/decisions.md` or switch.
6. **Badge shape.** `badge.tsx:7` ships `rounded-4xl` (a pill) and `border-transparent` defaults. DESIGN.md §4 says radii are 4px for controls. Set `rounded-[var(--radius)]` and wire the three dashed/solid status recipes from the spec.
7. **Top padding under the sticky header is `pt-8` (32px)** in `education-form.tsx`, against the 64px (3xl) in the spec. Check whether the other forms share this.
8. **Empty-date placeholder in `education-table.tsx:191`** renders an em-dash glyph. It is not copy in a message file, but it is the character CLAUDE.md bans in text. Use "Sin fecha" or a plain hyphen.
9. **Education end date.** A blank end date is the only way to say "ongoing", and the form gives no cue. Experience has a "Puesto actual" checkbox. Add the same affordance, or a helper under `endDate`.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

- Strings sit in `messages/es.json` and `messages/en.json` under `Admin.*` and `DraftMode`. `DraftMode.text/exit/label` match the contract table in both locales.
- Banner text uses a middle dot, not an em-dash. Plural forms use ICU (`messages/es.json:51,68`), so "1 mensaje sin leer" is handled.
- The checker already flagged "Publicar" and "Cancelar" as verb-only. Not reopened.
- Gaps: repeated "Quitar" buttons (fix 4), em-dash placeholder (fix 8), and "Nuevo" badge in `messages-table.tsx:78` uses `text-primary`, which is ink, so no problem.
- Education empty state, columns and toasts follow the contract copy. `needs_human_review`: read the rendered Spanish for tone.

### Pillar 2: Visuals (3/4)

- Focal point per screen is clear: sticky `AdminPageHeader` with one filled action, then numbered `FormSection`s with `SectionIndex` at the right. Education is a single section, so the index lists one entry, which is noise. The spec says single-section forms have no index (Skill), and Education is described the same way. Hide the index when `sections.length === 1`.
- Icon-only controls carry `aria-label` (visible switch `education-table.tsx:219`, row menu `:236`). Trash2/Plus icons in Ajustes are paired with text.
- Draft band: 40px, ink background, background-colored text, mono 12px and a 14px/600 underlined exit control, as specified. It has no icon, glow or gradient. It is `<section aria-label>`, so it is exposed as a region. The exit is a POST form, which is the right choice since prefetched GETs cannot clear the cookie. Findings are the narrow-screen truncation and the route allowlist above.
- The band appears in `[locale]/layout.tsx` ahead of `children`, so a skip link added later would have to come before it.
- `needs_human_review`: dark theme on the band (`bg-foreground text-background` inverts correctly in code).

### Pillar 3: Color (3/4)

- Accent use: `admin-nav.tsx:58` (2px indicator, `bg-signal`) and the focus ring (`--ring: var(--accent)`). That is exactly the spec's exhaustive list. No hex, `rgb()` or Tailwind palette colors in admin code.
- `--destructive` and `--input` are defined as proposed (`globals.css:16,29,52`). Error text uses `text-destructive` at 14px, which has 5.6:1 contrast.
- shadcn `--accent` is remapped to a neutral surface, so hover rows are neutral as intended.
- Deduction: the badge default is solid ink (`bg-primary`), not the spec's `--bg-elev` plus 1px line. Whether the status badges override this was not verified rendered. Draft/Published/Pending and "Falta ES" should be checked visually.

### Pillar 4: Typography (2/4)

Counts across `src/components/admin`, `src/app/admin`, `src/features/*/components` and `src/components/ui`:

| Class | Uses |
|-------|------|
| `text-sm` | 112 |
| `text-xs` | 56 |
| `text-base` | 11 |
| `text-[25px]` | 7 |
| `text-3xl` | 2 |
| `text-lg` | 1 |
| `font-semibold` | 41 |
| `font-medium` | 14 |
| `font-normal` | 8 |

- Sizes: spec allows 12, 14, 16 and 25. Actual also has `text-3xl` (Panel and login H1) and `text-lg` (message reader title). The Panel H1 is larger than every other page H1, which breaks the "one H1 size" contract.
- Weights: `font-medium` is a third weight (see fix 1). The spec's weight rule is violated on table headers, field labels, dialog titles and badges.
- Table headers use `text-xs` in `education-table.tsx:375`, where the spec asks for 14px/600.
- Good: Funnel Display is applied through `font-heading` (the earlier `font-display` bug is gone), with `tracking-display`. Mono is used for meta.

### Pillar 5: Spacing (3/4)

- Form wrapper: `px-6 lg:px-12`, `gap-12` between sections, `max-w-xl` fields, `gap-6` between ES/EN columns. This matches the scale.
- Deviations: `pt-8` where 64px is specified; `max-w-4xl` (896px) against the 960px form column; shadcn switch sizes (`h-[18.4px]`) are not on the 8px grid. Arbitrary values in admin code are few (`[480px]` sheet, `[96px]` sticky offset, both from the spec).
- `pb-28 md:pb-16` leaves room for the mobile bottom action bar. `needs_human_review` at 390px: the stacked table rows and the bottom bar were never captured (plan 03-14 lists this as a known limit).

### Pillar 6: Experience Design (3/4)

- Coverage found: busy ref against double submit, Zod on draft and publish schemas, first-invalid focus (`showIssues`), `role="alert"` form-level error, session-expired link, persistent error toast with "Reintentar", `UnsavedGuard` with Cmd+S, discard dialog in Ajustes, `loading.tsx` for Education edit, list load-failure fallback (`ajustes/page.tsx`), Empty component for zero rows.
- Gaps: Ajustes language errors lack `aria-describedby`; no reorder of languages; the draft exit falls back to `/` for unknown routes; education date inputs are native `type="date"`, which allows a partial or invalid entry on some browsers, and there is no check that end is after start (not verified in `validation.ts`).
- Registry audit: shadcn is initialised, but UI-SPEC lists no third-party registries (`registries: {}`). Skipped, no flags.

---

## Files Audited

- `.planning/phases/03-panel-admin-cv/03-UI-SPEC.md`, `03-14-SUMMARY.md`, `DESIGN.md`
- `src/components/site/draft-banner.tsx`, `draft-exit-form.tsx`, `src/lib/draft-preview.ts`, `src/app/api/draft/route.ts`, `src/app/[locale]/layout.tsx`
- `src/features/site-settings/components/settings-form.tsx`, `src/app/admin/(panel)/ajustes/page.tsx`
- `src/features/education/components/education-form.tsx`, `education-table.tsx`, `src/app/admin/(panel)/educacion/page.tsx`
- `src/components/admin/*` (grep), `src/components/ui/*` (grep), `src/app/globals.css`, `messages/es.json`, `messages/en.json`
