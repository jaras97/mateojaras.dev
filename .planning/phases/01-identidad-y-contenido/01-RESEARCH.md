# Phase 1: Identidad y contenido - Research

**Researched:** 2026-10-30
**Domain:** Design tokens + self-hosted fonts (Next 16.4 / Tailwind v4 / shadcn base-nova), static presentational hero variants on a typed fixture, human-authored content capture (interview → Markdown+YAML), reproducible screenshots, static TTFs for react-pdf
**Confidence:** HIGH for the code half (verified against bundled Next docs, installed sources and live probes). MEDIUM for the content half: its shape is set, but its substance is Teo's and can't be researched.

## Summary

This phase is two different jobs. About 40% is **code** an executor can finish alone: tokens and the shadcn alias layer in `globals.css`, the three `next/font/google` families, the Button retheme, `/lab/tokens`, `StatusLine`/`SectionNumber`/`HeroA|B|C`, the typed fixture, static TTFs in `assets/fonts-pdf/`, a re-runnable capture script and the review captures. The other 60% is **human input** that the executor must never produce: the headline, the two concept sentences, the answers for 4 projects, the copy for hero/about/now/experience/contact/footer, the choice of capture views, running the two local apps, the variant pick, and every approval. The plan has to separate these physically. Content tasks become `checkpoint:human-action` / `checkpoint:decision` with `gate="blocking-human"`, because config is `mode: "yolo"` and a plain `blocking` gate can be auto-resolved. Automated guards (grep gates, a Zod contract test, a number-parity test) then prove that nothing was invented.

The research turned up seven concrete traps, all verified in this session:
1. **CSS alias cascade.** shadcn aliases declared only on `:root` (`--background: var(--bg)`) stay light inside a nested `.dark` container, which is exactly how `/lab` and the `/lab/tokens` dark column work. I falsified this in Chromium. Declare the aliases on `:root, .dark`.
2. **`/material/` is git-ignored** (`.gitignore:44-45`). That contradicts D-15 ("antes de commitear…") and the phase goal ("vive en el repo"). Teo has to decide.
3. **Date-only values shift a month.** Formatting `availableFrom` (Drizzle `date()` → string) without `timeZone: 'UTC'` renders "Oct 2026" instead of "Nov 2026" on a machine in Bogotá.
4. **`pnpm lint` is already red** on the untouched scaffold. Biome scans the vendored `.claude/`/`.agents/` skill code, and the shadcn files are unformatted. `pnpm check`/`test`/`typecheck` scripts don't exist.
5. **No YAML parser is importable** (pnpm strict), and `@axe-core/playwright` is not installed. So the D-08 content contract test and the UI-SPEC axe gate both need a dependency approval, or a fallback.
6. **The ManuJ live site opens a promotional modal on load** and has an auto-advancing carousel and a floating WhatsApp button. The capture script needs per-view setup steps.
7. **Tailwind v4's default type scale and line-height pairs differ from DESIGN.md** at every step from `lg` up. All 8 steps and their `--line-height` pairs must be overridden.

**Primary recommendation:** Build the code half in one autonomous wave (tokens → fonts → `/lab/tokens` → TTFs → capture script). Gate the hero variants behind a `blocking-human` "Teo writes headline + fixture values" checkpoint. Run the 4 project interviews and the copy as `blocking-human` human-action checkpoints. Close with machine-checkable gates: no placeholders, no `draft-translation`, every metric sourced, ≥3 16:10 WebPs per slug, TTFs static with Spanish glyphs. Keep `/lab` alive until phase 1 verification ends: success criterion 1 needs `/lab/tokens` to render, and D-02 allows deleting it at the start of phase 2.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Variantes del hero
- **D-01:** Las 3 variantes exploran **jerarquías distintas**, no densidades del mismo layout:
  - **A:** headline display grande arriba y la línea de estado debajo.
  - **B:** la página abre con la línea de estado en mono, como la primera entrada de una bitácora con fecha, disponibilidad y UTC-5; una regla de separación y el headline debajo.
  - **C:** índice editorial, con el headline en las columnas principales y las secciones numeradas (01 Work, 02 About, 03 Contact) en la columna del margen.
  Ninguna lleva dots pulsantes ni indicadores animados. Si hay un punto de estado, es estático (regla de CLAUDE.md).
- **D-02:** Las variantes y la página de muestra de tokens viven en una **ruta temporal `/lab`** (`/lab/hero`, `/lab/tokens`). Teo la aprobó en esta discusión. Se borra cuando Teo elige la variante (antes de cerrar la fase o al principio de la fase 2). No es una ruta pública: queda fuera del futuro `[locale]`, sin enlaces y con `noindex`. — **Reversibility:** reversible — es temporal y nada depende de ella.
- **D-03:** El fixture usa el **headline real de Teo** (en/es). Teo lo escribe antes de construir las variantes. Mientras tanto se usa el ejemplo de `docs/copy.md`, marcado como borrador en el fixture. El fixture cumple el tipo de `site_settings` de `docs/data-model.md` (`headlineEn/Es`, `availabilityStatus`, `availableFrom`, `timezone`, `location`...). No se inventan datos: los campos que aún no existan se dejan vacíos y el componente no los renderiza.
- **D-04:** Las variantes son **solo estáticas**: sin SplitText, sin reveal y sin GSAP. El movimiento se construye en la fase 4.
- **D-05:** Revisión antes de que Teo elija: capturas con Playwright en 390, 768 y 1440 px, en claro y oscuro, de cada variante, más `/impeccable:critique` por variante. Los hallazgos se reportan a Teo junto a las capturas.

#### Flujo del contenido
- **D-06:** Los 4 proyectos se arman por **entrevista**: Claude pregunta de forma concreta por proyecto (problema, rol, solución, resultados, 2–3 decisiones técnicas, URLs y cifras con su fuente), Teo responde y sus respuestas se convierten en el archivo. Claude solo corrige gramática y naturalidad y **no inventa ni redacta contenido** a partir de los sitios.
- **D-07:** Teo responde **en español**. Claude propone la versión en inglés y la marca como traducción pendiente de aprobación (p. ej. `en_status: draft-translation` en el front-matter, o un comentario) hasta que Teo la apruebe. Esto aplica también al copy de `docs/copy.md`.
- **D-08:** Formato: **un Markdown por proyecto con front-matter YAML**, `docs/content/<slug>.md`. El front-matter lleva los campos estructurados: slug, títulos, URLs (`liveUrl`, `repoUrl`), permiso del cliente, métricas `{label, value, source}`, fechas, stack y decisiones técnicas. El cuerpo lleva los textos largos en/es por secciones. Los nombres de campo siguen `docs/data-model.md` (camelCase) para que el seed de la fase 2 los lea directo. — **Reversibility:** costly — el seed de la fase 2 se escribe contra este formato.
- **D-09:** **El copy y los proyectos van separados.** `docs/copy.md` queda solo para hero, about, now, experiencia, contacto y footer, y se elimina su bloque "Proyectos", que pasa a `docs/content/`. Teo aprobó esta edición de `copy.md` en la discusión.
- **D-10:** **Una métrica sin fuente verificable no entra.** Si no hay número con fuente (analytics, Lighthouse/PageSpeed, el cliente), el resultado se cuenta en texto cualitativo.
- **D-11:** **La fuente va dentro de la etiqueta**, sin cambiar el esquema (`metrics: {label, value}[]`). En `docs/content/` se guarda `source` aparte y el seed de la fase 2 lo une a la etiqueta, p. ej. `"Lighthouse móvil (PageSpeed, oct 2026)"`. No se toca `docs/data-model.md`.
- **D-12:** Respuestas de Teo a las preguntas de contenido del roadmap:
  - ManuJ y EcoExport dieron permiso para mostrar capturas y cifras: `permiso: sí` en ambos.
  - El repo de la App de Finanzas Personales es **público**, así que se enlaza `repoUrl`.
  - About **menciona "contratista independiente"**.
  - La fuente de la métrica va en la etiqueta (D-11).

#### Capturas en material/
- **D-13:** ManuJ y EcoExport (en vivo) se capturan con un **script de Playwright** en `scripts/` que toma vistas definidas a 1440×900 (16:10) y que se puede volver a correr. Teo elige qué vistas (home, catálogo, reserva...). `@playwright/test` ya está instalado.
- **D-14:** El inventario y la app de finanzas se capturan **corriéndolas en local con datos de ejemplo**: Teo las levanta con su seed de ejemplo y el script de Playwright las captura. Esas capturas se marcan como "datos de ejemplo" (nombre de archivo o un `README.md` en la carpeta) y la ficha del proyecto lo dice.
- **D-15:** Estructura: `material/<slug>/NN-vista.png` (original) y `.webp` optimizado a 1600 px de ancho. Antes de commitear, porque el repo es público, se revisa que no haya datos personales de clientes reales a la vista. En la fase 3 se suben a Blob.

#### Fuentes y tema
- **D-16:** Las fuentes web se cargan con **`next/font/google`**: Funnel_Display, Hanken_Grotesk y Geist_Mono, con subsets `latin` y `latin-ext`, variables y `display: 'swap'`. Se descargan en el build y se sirven desde `/_next`, así que no hay ninguna petición a un CDN de fuentes. Hay que **ajustar DESIGN.md §2**, que dice `next/font/local`; Teo lo aprobó en la discusión. Se elimina `Geist` (sans) del `layout.tsx` del scaffold.
- **D-17:** El modo oscuro se activa con la **clase `.dark`** (shadcn y el `@custom-variant dark` actual). Hay que **ajustar DESIGN.md §3**, que dice `:root[data-theme="dark"]`; Teo lo aprobó en la discusión. El toggle con View Transitions y el script anti-flash son de la fase 4. En `/lab` basta con un interruptor simple para revisar los dos temas.
- **D-18:** Los **tokens de DESIGN.md son la fuente**: `--bg`, `--bg-elev`, `--ink`, `--ink-2`, `--line`, `--accent`, `--accent-ink` en claro y oscuro. Las variables de shadcn son alias de esos tokens (`--background: var(--bg)`, `--foreground: var(--ink)`, `--primary: var(--ink)`, `--border: var(--line)`, `--ring: var(--accent)`...). Se mantienen el acento único y los radios de DESIGN.md (4px en controles, 8px en imágenes y 0 en contenedores). Se borra el tema gris por defecto de `globals.css`. — **Reversibility:** costly — todos los componentes de las fases 3 y 4 consumen estos nombres.
- **D-19:** TTF del PDF en `assets/fonts-pdf/`: los static/ oficiales de Google Fonts, Hanken Grotesk (Regular, Bold, Italic) y Geist Mono (Regular). Si Funnel Display no tiene carpeta static/, se instancia con `fonttools varLib.instancer` en los pesos 600 y 700. fonttools es una herramienta local de un solo uso y no entra como dependencia del proyecto. Se verifican los glifos latin-ext (á é í ó ú ü ñ ¿ ¡) en cada archivo.

### Claude's Discretion
- La estructura interna de los componentes del hero (nombres y props) y del fixture, siempre tipados contra `site_settings`.
- El contenido exacto de `/lab/tokens`: muestras de color, escala tipográfica y componentes shadcn con el tema.
- El guion de preguntas de la entrevista por proyecto, siempre que cubra todos los campos de IDEN-05.
- La herramienta para pasar PNG a WebP. Por la regla del proyecto no se añade ninguna dependencia sin preguntar: hay que usar algo ya disponible (CLI local tipo `cwebp` o `sips`) o pedir permiso antes.

### Deferred Ideas (OUT OF SCOPE)
None. La discusión no salió del alcance de la fase.
</user_constraints>

**Also binding:** `01-UI-SPEC.md` (status: approved) is the visual contract. It already fixes the component inventory, file paths, spacing/typography/color tables, the lab routes and query params, the copy strings and the capture matrix. This research does not repeat it. It adds the implementation facts the UI-SPEC assumes but doesn't verify.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| IDEN-01 | DESIGN.md pasa a APROBADO con las dos frases del concepto escritas por Teo | Human checkpoint (concept sentences, blocking-human). DESIGN.md edits already approved: §2 (D-16), §3 (D-17). P5 (§4 em-dash) needs Teo. Final `Estado: APROBADO` only after the variant pick (DESIGN.md:3 ties approval to both). See "Human/Code split" |
| IDEN-02 | Tokens OKLCH (claro y oscuro), escala tipográfica y tema shadcn propio en `globals.css` | Pattern 1 (token + alias layer on `:root, .dark`, verified cascade fix), Pattern 2 (type-scale override incl. `--line-height` pairs), Button retheme per UI-SPEC |
| IDEN-03 | 3 familias self-hosted con `next/font` (latin + latin-ext) y TTF estáticos en `assets/fonts-pdf/` | Pattern 3 (shared `src/app/fonts.ts`). `subsets` only controls preload (verified in loader source). Static TTFs via Google CSS2 API with an empty UA, verified static (no `fvar`) with full Spanish coverage. OFL.txt must ship alongside |
| IDEN-04 | 3 variantes del hero como componentes presentacionales tipados contra `site_settings`; Teo elige | Pattern 4 (types from data-model, Drizzle mode facts), Pattern 5 (`/lab/hero` with `searchParams` in `<Suspense>`), date/TZ pitfalls, review capture matrix, `checkpoint:decision` for the pick |
| IDEN-05 | `docs/content/` por proyecto: tagline, problema, rol, solución, resultados, 2–3 decisiones, URLs, permiso, fuente de cada métrica (en/es) | Pattern 6 (content file shape mapped field-by-field to data-model), interview script, Zod contract test, number-parity anti-invention test, metrics localization gap (Open Q2) |
| IDEN-06 | `material/` ≥3 capturas 16:10 por proyecto (inventario marcado como datos ficticios) | Pattern 7 (capture script: 1440×900 @2x → 1600×1000 WebP via Chromium canvas, zero new deps, verified). ManuJ modal/carousel handling. `/material/` gitignored (Open Q1) |
| IDEN-07 | `docs/copy.md` sin marcadores; hero, about, now, experiencia, contacto escritos por Teo en/es | Human checkpoints + placeholder grep gate (the markers vary: `[ejemplo…]`, `[Teo escribe…]`, `[...]`, `[sí/no]`, `[ej.]`), D-09 removal of lines 24-42, `draft-translation` gate |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

Directives that apply to this phase (root `CLAUDE.md` + `.claude/CLAUDE.md`):

- **Read before UI work:** `DESIGN.md`, plus `AGENTS.md` and `node_modules/next/dist/docs/` before Next code. Don't edit the `nextjs-agent-rules` block of `AGENTS.md`.
- **Ask before:** adding/changing dependencies; touching `DESIGN.md`, `docs/copy.md`, palette or typography; changing `docs/data-model.md` or a migration; adding routes; animation outside the budget; new external services; backlog items. (Already approved this phase: `/lab` routes, DESIGN.md §2/§3 edits, removing the Proyectos block from copy.md.)
- **Content:** never lorem ipsum, invented projects or metrics not in `docs/content/`. If content is missing, the component doesn't render. Copy is written by Teo; Claude only fixes grammar and naturalness.
- **Forbidden design:** Inter, Roboto, Arial, Open Sans, Lato, Space Grotesk, Satoshi, system fonts; gradients; glassmorphism; hero + 3 equal shadowed cards; icons in rounded tiles; decorative grid backgrounds; marquees, shimmer, number tickers, pulsing dots, custom cursors; Aceternity/Magic UI/React Bits/effects libraries; "Build faster. Ship smarter." copy; **em-dashes in copy**; emojis in UI.
- **Motion:** none this phase (D-04). GSAP only in `src/components/motion/` later.
- **Architecture:** Server Components by default. Feature folders `src/features/<entity>/…`. UI strings go in `messages/*.json` from phase 2 (lab strings stay inline per UI-SPEC). Tables `snake_case`, code `camelCase`. Localized fields go through `localized(row, field, locale)`.
- **Commits:** one per task, conventional (`feat(lab): …`, `docs(content): …`), no "wip". `pnpm check` must pass before each closing commit. It doesn't exist yet (see Pitfall 5).
- **Verification per public view:** Playwright screenshots at 390/768/1440, light and dark, plus `/impeccable:audit` and `/impeccable:critique`. Report findings before moving on.
- **A11y:** WCAG AA, visible focus, keyboard, axe with no serious/critical.
- **Decisions log:** every non-trivial decision goes in `docs/decisions.md` with who decided.
- **Security:** never commit keys. The repo is public, so this extends to client personal data in screenshots and content.
- **GSD:** file edits go through a GSD workflow.

## Human/Code split (the core planning input for this phase)

| Deliverable | Who produces it | Mechanism | Gate type |
|---|---|---|---|
| Tokens, aliases, type scale, radii in `globals.css` | Executor | `auto` | automated (build + grep) + end-of-phase human-check |
| `src/app/fonts.ts` + root layout swap | Executor | `auto` | automated (build output has no `fonts.gstatic`/`googleapis` refs) |
| Button retheme, `StatusLine`, `SectionNumber`, `/lab`, `/lab/tokens` | Executor | `auto` | automated + human-check |
| `assets/fonts-pdf/*.ttf` + `OFL.txt` | Executor | `auto` (download + fontTools verification) | automated script output |
| Dependency approvals (`yaml`, `@axe-core/playwright`) | **Teo** | `checkpoint:decision` | `blocking-human` |
| Headline en/es + fixture values (availability state, `availableFrom`, `location` per UI-SPEC P4) | **Teo** | `checkpoint:human-action` | `blocking-human` |
| `HeroA/B/C`, fixture, `/lab/hero` | Executor | `auto` (after headline) | automated |
| Review captures (24) + critique/audit/axe report | Executor | `auto` | report artifact |
| Variant pick + answers to UI-SPEC P1–P5 | **Teo** | `checkpoint:decision` (no `auto_select`) | `blocking-human` |
| Record pick in `docs/decisions.md` | Executor | `auto` (after pick) | grep |
| Interview answers ×4 projects (Spanish) | **Teo** | `checkpoint:human-action` per project, question script embedded | `blocking-human` |
| `docs/content/<slug>.md` from answers + EN draft | Executor | `auto` (only transcribes and translates) | Zod contract test + number parity |
| Capture views per live site | **Teo** | `checkpoint:decision` | `blocking-human` |
| Run inventory + finance apps locally with sample data | **Teo** | `checkpoint:human-action` (gives local URLs) | `blocking-human` |
| Capture script + WebP output | Executor | `auto` | dimension/count script |
| PII review of captures (public repo) | **Teo** | `checkpoint:human-verify` | `blocking-human` (never auto-approve) |
| `docs/copy.md` text (hero, about, now, experience, contact, footer) | **Teo** | `checkpoint:human-action` (can be an interview like D-06) | `blocking-human` |
| Remove copy.md Proyectos block (D-09) | Executor | `auto` | grep |
| Concept sentences (DESIGN.md §1) | **Teo** | `checkpoint:human-action` (Claude proposes no wording) | `blocking-human` |
| DESIGN.md §2/§3 edits (approved), `Estado: APROBADO` | Executor | `auto`, after the concept sentences and the variant pick | grep |
| Approval of every EN draft translation + copy | **Teo** | end-of-phase human-check, then executor flips `draft-translation` | grep gate: zero `draft-translation` |

**Why `blocking-human` everywhere Teo writes or decides:** `.planning/config.json` has `"mode": "yolo"`. Per GSD `checkpoints.md`, auto-mode auto-approves `human-verify` and auto-selects `decision` checkpoints that carry `auto_select`. A content checkpoint that auto-resolves gives the executor two options: stall, or fill the gap. Filling the gap is exactly the invention CLAUDE.md forbids. `gate="blocking-human"` is never bypassed. [CITED: ~/.claude/gsd-core/references/checkpoints.md, "The gate attribute"]

**`human_verify_mode: end-of-phase`** (config) means the planner emits no `checkpoint:human-verify` tasks for post-hoc checks (folded into `<verify><human-check>`). `checkpoint:decision` and `checkpoint:human-action` are still emitted. The PII review is the exception I'd keep as an explicit blocking-human checkpoint, because it gates a commit to a public repo, not post-hoc quality. [CITED: ~/.claude/gsd-core/references/planner-human-verify-mode.md]

**Interview mechanics (D-06):** executors are subagents and lose context across a checkpoint. Put the whole question script for one project inside one `checkpoint:human-action`. The continuation executor receives Teo's verbatim Spanish answers and writes them into `docs/content/<slug>.md` the same turn, so the answers live on disk, not in chat history. If an answer is missing a field, the continuation writes the field as absent (empty/omitted, never guessed) and lists it in its summary for a follow-up checkpoint.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Design tokens / theme | Browser (CSS) | — | Pure CSS custom properties + Tailwind `@theme inline`. No JS |
| Font self-hosting | Build (Next font loader) | CDN/Static (`/_next/static/media`) | Downloaded at build, served as static assets. Zero runtime requests to Google |
| `/lab/tokens` | Frontend Server (prerendered RSC) | — | Fully static, no runtime APIs |
| `/lab/hero` param switching | Frontend Server (RSC streaming in `<Suspense>`) | Browser (plain links) | `searchParams` is a runtime API under `cacheComponents`. No client JS needed |
| Hero variants / StatusLine | Frontend Server (RSC, presentational) | — | No state. Date/offset formatting with `Intl` on the server (deterministic with explicit `timeZone`) |
| Fixture | Build-time TS module | — | Typed by `satisfies`. Typecheck is the contract gate |
| PDF fonts | Repo assets (`assets/fonts-pdf/`) | Phase 3 server (react-pdf) | Consumed by `renderToBuffer` later via `outputFileTracingIncludes` |
| Content files | Repo docs (`docs/content/`) | Phase 2 seed (DB) | Source of truth until the seed loads it into Neon |
| Screenshots | Local tooling (`scripts/`, Playwright) | Phase 3 Blob | Generated offline, uploaded later |

## Standard Stack

**This phase installs no runtime dependency.** Everything needed for the code half is already installed. [VERIFIED: package.json read this session]

### Core (already installed, used this phase)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next (`next/font/google`) | 16.4.3 | Self-hosted Google fonts | Downloads CSS + font files at build, rewrites to `/_next/static/media`. "No requests are sent to Google by the browser." [CITED: node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md:13] |
| tailwindcss + @tailwindcss/turbopack | 4.3.3 | `@theme inline` tokens | Already wired through the Turbopack loader rule in `next.config.ts` [VERIFIED: next.config.ts read] |
| shadcn (base-nova) + @base-ui/react | 4.23.0 / 1.9.0 | Button | Only `button.tsx` installed. No new shadcn components this phase (UI-SPEC slot 3) |
| cn | 0.5.0 | Class merging | "Drop-in replacement for clsx + tailwind-merge", with conflict resolution [VERIFIED: node_modules/cn/package.json + README] |
| @playwright/test | 1.64.1 | Capture script + review captures | `import { chromium } from '@playwright/test'` resolves under pnpm strict. Chromium 1248 is installed and matches [VERIFIED: probe] |

### Local one-off tools (NOT project dependencies; D-19 / discretion)
| Tool | Version | Purpose |
|------|---------|---------|
| Python fontTools | 4.63.0 (installed) | Verify TTFs are static (no `fvar`) and cover glyphs. Optional `varLib.instancer` fallback |
| curl | system | Download static TTFs from the Google Fonts CSS2 API |
| Chromium canvas (through Playwright) | 156 / rev 1248 | PNG → WebP 1600w encoding inside the capture script (verified: `toDataURL('image/webp')` works) |
| Pillow | 12.3.0 (installed, WebP=True) | Alternative WebP encoder (`python3 -I`) |
| `sips` | macOS 26.2 | **Cannot write WebP** (listed without "Writable"). Use only to read dimensions |

### Candidate dependencies that need Teo's approval (ask once, at phase start)
| Package | Version | Purpose here | Also needed later? |
|---------|---------|--------------|--------------------|
| `yaml` (devDep) | 2.9.1 | Parse `docs/content/*.md` front-matter in a Vitest/Zod contract test | **Yes.** The phase 2 seed (BASE-06) must parse the D-08 format. Nothing YAML-capable is importable today [VERIFIED: require.resolve probe for yaml, js-yaml, gray-matter, front-matter] |
| `@axe-core/playwright` (devDep) | 4.14.0 | UI-SPEC "Axe sobre /lab/hero y /lab/tokens" | **Yes.** It's already in the phase 2 approval batch (ROADMAP Phase 2 Approvals). Asking now moves it earlier |

**If Teo declines either:** content validation runs as a one-off `python3 -I` script using the installed PyYAML 6.0.2 (not committed, or committed under `scripts/` as a dev tool, which is Teo's call). The axe gate is replaced by `/impeccable:audit` + manual keyboard checks, and that gets recorded as a deviation in `docs/decisions.md`.

### Phase 2 heads-up (do not install now)
| Package | Why it surfaces from this phase |
|---------|--------------------------------|
| `@tiptap/markdown` 3.32.1 | D-08 puts long prose in Markdown. `caseStudyEn/Es` are Tiptap JSON (data-model.md:55). `MarkdownManager.parse(md)` converts on the server [CITED: Context7 /ueberdosis/tiptap-docs markdown-manager.mdx]. Keep content Markdown to the StarterKit subset (paragraphs, `###`, lists, bold/italic, links) so the conversion is lossless |

**Installation (only if approved):**
```bash
pnpm add -D yaml@2.9.1 @axe-core/playwright@4.14.0
```

## Package Legitimacy Audit

| Package | Registry | Age (latest publish) | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| yaml | npm | latest 2026-09-11 | ~307M/wk | github.com/eemeli/yaml | [OK] | Approved, pending Teo's dependency consent (CLAUDE.md) |
| @axe-core/playwright | npm | latest 2026-10-15 | ~21M/wk | dequelabs (axe-core-npm) | [SUS] reason: `too-new` (latest version is 15 days old; the package itself is long-established) | Flagged. Planner adds `checkpoint:human-verify gate="blocking-human"` before install |
| @tiptap/markdown | npm | latest 2026-10-28 | ~5.7M/wk | github.com/ueberdosis/tiptap | [SUS] reason: `too-new` (version 2 days old, same monorepo release as the installed 3.32.x) | Phase 2 only. Not installed this phase |

`postinstall` scripts: none for `yaml` or `@axe-core/playwright` (`npm view … scripts.postinstall` returned empty). [VERIFIED: gsd-tools package-legitimacy + npm view, run this session]

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** `@axe-core/playwright` (phase 1 candidate), `@tiptap/markdown` (phase 2 candidate). Both are `too-new` on a recent patch, not on the package.

## Architecture Patterns

### System Architecture Diagram

```
                       ┌──────────────── HUMAN (Teo) ────────────────┐
                       │ headline · concept · interview answers (es) │
                       │ copy · view picks · local apps · approvals  │
                       └───────┬───────────────┬──────────────┬──────┘
                               │ checkpoint    │ checkpoint   │ checkpoint
                               ▼               ▼              ▼
DESIGN.md §3 tokens ──► globals.css ──► Tailwind @theme ──► utilities ─┐
  (source of truth)    (:root/.dark     inline              (bg-background,
                        + aliases on                         text-ink-2, bg-signal)
                        :root,.dark)                                     │
Google Fonts ──build──► next/font (src/app/fonts.ts) ──► /_next/static/media
                                                                         ▼
fixture.ts (satisfies HeroSettings) ──► HeroA|B|C + StatusLine ──► /lab/hero?variant&lang&theme
                                                                  /lab/tokens
                                                                         │
                                         Playwright capture (24 shots) ◄─┘──► critique/audit/axe ──► Teo picks ──► docs/decisions.md
Teo answers (es) ──► docs/content/<slug>.md (YAML + sections, en draft) ──► Zod contract test ──► [phase 2 seed]
live sites / Teo's local apps ──► scripts/capture-material.ts ──► material/<slug>/NN-view.{png,webp} ──► [phase 3 Blob]
Google CSS2 API (empty UA) ──► assets/fonts-pdf/*.ttf + OFL.txt ──► fontTools check ──► [phase 3 react-pdf]
```

### Recommended Project Structure (new/changed this phase)
```
src/
├── app/
│   ├── fonts.ts                     # the 3 next/font/google instances (shared with phase 2 root layouts)
│   ├── layout.tsx                   # scaffold root: swap Geist → 3 families, title "Mateo Jaramillo"
│   ├── globals.css                  # tokens + aliases + @theme inline (replaces gray theme)
│   └── lab/                         # TEMPORARY (D-02), delete at start of phase 2
│       ├── layout.tsx               # robots noindex, notFound() when VERCEL_ENV==='production'
│       ├── page.tsx                 # 2 links
│       ├── tokens/page.tsx
│       ├── hero/page.tsx            # Suspense + searchParams
│       └── _components/*            # lab bar, swatches, type rows
├── components/
│   ├── ui/button.tsx                # retheme per UI-SPEC
│   └── site/
│       ├── status-line.tsx
│       ├── section-number.tsx
│       └── hero/hero-{a,b,c}.tsx
├── features/
│   ├── site-settings/{types.ts, fixture.ts}
│   └── projects/content-schema.ts (+ .test.ts)   # Zod contract for docs/content (if `yaml` approved); phase 2 seed reuses it
└── lib/
    ├── i18n-fields.ts               # localized() exactly as data-model.md:150-153
    └── format.ts                    # formatMonthYear / formatUtcOffset / formatEntryDate (+ .test.ts)
scripts/
├── capture-material.ts              # D-13/D-14, re-runnable, Node 24 type-stripping (no tsx)
└── capture-lab.ts                   # D-05 review matrix (or a flag on the same script)
assets/fonts-pdf/
├── FunnelDisplay-SemiBold.ttf  FunnelDisplay-Bold.ttf
├── HankenGrotesk-Regular.ttf   HankenGrotesk-Bold.ttf   HankenGrotesk-Italic.ttf
├── GeistMono-Regular.ttf
└── OFL-FunnelDisplay.txt  OFL-HankenGrotesk.txt  OFL-GeistMono.txt
docs/content/<slug>.md ×4
material/<slug>/NN-view.png|.webp (+ README.md for sample-data folders)
```

### Pattern 1: Tokens + shadcn alias layer (D-17, D-18), with the cascade fix
**What:** DESIGN.md tokens on `:root` (light) and `.dark` (dark). The shadcn variables are aliases declared on **`:root, .dark`**, so they re-resolve on every `.dark` element, including nested ones.
**Why:** a custom property that references another (`--background: var(--bg)`) is substituted where it's declared, and descendants inherit the *resolved* value. I falsified this in headless Chromium this session:

```
alias on :root only, nested .dark -> rgb(252, 250, 246)   ← stays LIGHT (bug)
direct var(--bg), nested .dark    -> rgb(13, 16, 20)
alias on :root,.dark, nested      -> rgb(13, 16, 20)      ← fix works
```
This matters now because `/lab/hero?theme=dark` and the dark column of `/lab/tokens` put `.dark` on a container, not on `<html>`. It keeps mattering in phase 4 for any nested scope. [VERIFIED: Playwright Chromium probe]

Token values to copy verbatim, DESIGN.md:24-41 [VERIFIED: DESIGN.md:24-41]:
```
:root {
  --bg: oklch(0.985 0.006 80);
  --bg-elev: oklch(0.965 0.008 80);
  --ink: oklch(0.24 0.03 260);
  --ink-2: oklch(0.48 0.02 260);
  --line: oklch(0.88 0.01 80);
  --accent: oklch(0.66 0.17 40);
  --accent-ink: oklch(0.99 0 0);
}
:root[data-theme="dark"] {           ← becomes `.dark` (D-17)
  --bg: oklch(0.17 0.01 260);
  --bg-elev: oklch(0.21 0.012 260);
  --ink: oklch(0.94 0.01 80);
  --ink-2: oklch(0.70 0.015 260);
  --line: oklch(0.30 0.012 260);
  --accent: oklch(0.72 0.16 40);
  --accent-ink: oklch(0.15 0.02 40);
}
```
Skeleton (alias table and `--color-signal` from UI-SPEC "Mapeo de variables shadcn"):
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

:root { /* 7 light tokens, verbatim */ --radius: 0.25rem; color-scheme: light; }
.dark { /* 7 dark tokens, verbatim */ color-scheme: dark; }

/* Aliases: BOTH selectors, so a nested .dark recomputes them */
:root, .dark {
  --background: var(--bg);        --foreground: var(--ink);
  --card: var(--bg);              --card-foreground: var(--ink);
  --popover: var(--bg);           --popover-foreground: var(--ink);
  --primary: var(--ink);          --primary-foreground: var(--bg);
  --secondary: var(--bg-elev);    --secondary-foreground: var(--ink);
  --muted: var(--bg-elev);        --muted-foreground: var(--ink-2);
  --border: var(--line);          --input: var(--line);
  --ring: var(--accent);
}

@theme inline {
  --color-background: var(--background);  --color-foreground: var(--foreground);
  /* …card/popover/primary/secondary/muted/border/input/ring… */
  --color-accent: var(--bg-elev);          /* shadcn "accent" = neutral hover surface */
  --color-accent-foreground: var(--ink);
  --color-signal: var(--accent);           /* the terracotta: bg-signal / text-signal */
  --color-ink-2: var(--ink-2);             /* optional direct utilities */
  --font-sans: var(--font-hanken-grotesk);
  --font-heading: var(--font-funnel-display);
  --font-mono: var(--font-geist-mono);
  --radius-sm: var(--radius); --radius-md: var(--radius); --radius-lg: var(--radius);
  --radius-xl: 0.5rem;
}
```
- `shadcn/tailwind.css` never references `var(--accent)` (0 occurrences), so redefining `--accent` as the terracotta can't break its keyframes or variants. [VERIFIED: grep node_modules/shadcn/dist/tailwind.css]
- Delete `--destructive`, `--chart-*` and `--sidebar-*` along with their `@theme` mappings. Button's `destructive` variant and `aria-invalid:*destructive*` classes then reference an undefined color. UI-SPEC says to drop `destructive` from the lab, so strip those classes too, or `bg-destructive` silently compiles to nothing. Keep the change consistent with UI-SPEC "Destructive: No definido".
- Remove the self-reference `--font-sans: var(--font-sans)` (globals.css:10) [VERIFIED: globals.css:10]. It is invalid at computed time.

### Pattern 2: Type scale override, including line-height pairs
Tailwind 4.3.3 defaults [VERIFIED: tailwindcss/theme.css:347-362]: `--text-lg: 1.125rem`, `--text-xl: 1.25rem`, `--text-2xl: 1.5rem`, `--text-3xl: 1.875rem`, `--text-4xl: 2.25rem`. Each has a paired `--text-*--line-height` (for example `--text-sm--line-height: calc(1.25 / 0.875)`).
DESIGN.md:20 wants [VERIFIED: DESIGN.md:20]: `--text-xs 0.75rem · --text-sm 0.875rem · --text-base 1rem · --text-lg 1.25rem · --text-xl 1.563rem · --text-2xl 1.953rem · --text-3xl 2.441rem · --text-4xl clamp(2.8rem, 6vw, 4.5rem)`, line-height 1.1 display and 1.55 text.

Override **all 8 sizes and all 8 `--line-height` pairs** in a plain `@theme` block (not `inline`, because these are literal values). Body and mono steps (xs–lg) get 1.55. Display steps get 1.1, applied through the heading/display classes, since a Funnel Display h2 at `text-xl` must be 1.1 while a Hanken paragraph at `text-xl` would be 1.55. Simplest approach: scale pairs = 1.55 for xs..lg, 1.1 for xl..4xl (the UI-SPEC only uses xl/4xl for Funnel Display headings), and set `leading-*` explicitly on the rare exception. Overriding only the size keeps Tailwind's default line-height (`text-sm` → 1.43, not 1.55). That drift is subtle and the impeccable hook may flag it.

### Pattern 3: Shared font module (D-16)
```ts
// src/app/fonts.ts — Source: next/font docs "app/fonts.ts" pattern (font.md:483-495)
import { Funnel_Display, Geist_Mono, Hanken_Grotesk } from "next/font/google";

export const funnelDisplay = Funnel_Display({
  subsets: ["latin", "latin-ext"], display: "swap", variable: "--font-funnel-display",
});
export const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin", "latin-ext"], display: "swap", variable: "--font-hanken-grotesk",
});
export const geistMono = Geist_Mono({
  subsets: ["latin", "latin-ext"], display: "swap", variable: "--font-geist-mono",
});
export const fontVariables = `${funnelDisplay.variable} ${hankenGrotesk.variable} ${geistMono.variable}`;
```
- All three are variable on Google Fonts, so no `weight` is needed. Funnel Display wght 300–800, Hanken Grotesk 100–900 (normal + italic), Geist Mono 100–900. [VERIFIED: next/dist/compiled/@next/font/dist/google/font-data.json]
- A shared module, because phase 2 (BASE-02) replaces `src/app/layout.tsx` with two root layouts (`[locale]`, `admin`) that must load the same fonts. `.claude/CLAUDE.md` §15 says "Load them in each root layout".
- `subsets` **only controls preload**. The loader downloads and self-hosts *every* subset in Google's CSS (with `unicode-range`) and marks preload only for the listed ones (`findFontFilesInCss(css, preload ? subsets : undefined)`). [VERIFIED: next/dist/compiled/@next/font/dist/google/loader.js:101-102 and find-font-files-in-css.js] Consequence: `latin-ext` adds up to 3 extra preloaded woff2 files. Spanish (á é í ó ú ü ñ ¿ ¡) is entirely in the `latin` subset (U+00A0–00FF). D-16 is locked, so keep it. Phase 4/5 Lighthouse work may revisit preload (see Open Q6).
- The build needs network access to fonts.googleapis.com. On failure the loader errors (`Failed to fetch … from Google Fonts`). Verified: the scaffold build succeeds today (3.9 s).

### Pattern 4: Types for the hero fixture (D-03, UI-SPEC)
Source of truth [VERIFIED: docs/data-model.md:8 and :28-44]:
```
export const availabilityEnum = pgEnum('availability', ['open', 'from_date', 'closed']);
...
  headlineEn: text('headline_en').notNull(),  headlineEs: text('headline_es').notNull(),
  availabilityStatus: availabilityEnum('availability_status').notNull().default('open'),
  availableFrom: date('available_from'),
  timezone: text('timezone').notNull().default('America/Bogota'),
  location: text('location').notNull().default('Medellín, Colombia'),
  updatedAt: base.updatedAt,
```
with `base.updatedAt` = `timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date())` (data-model.md:24).

Drizzle 0.45.4 inferred TS types [VERIFIED: drizzle-orm/pg-core/columns/date.d.ts:45-47, timestamp.d.ts:65-67]: `date()` with no `mode` → **string** builder (`PgDateStringBuilderInitial`). `timestamp()` with no `mode: 'string'` → **Date**. So the hand-written type must be:
```ts
// src/features/site-settings/types.ts — phase 2 replaces with typeof siteSettings.$inferSelect
export type AvailabilityStatus = "open" | "from_date" | "closed";
export type SiteSettings = {
  id: string; name: string;
  headlineEn: string; headlineEs: string;
  bioEn: string; bioEs: string;
  nowEn: unknown | null; nowEs: unknown | null;
  availabilityStatus: AvailabilityStatus;
  availableFrom: string | null;      // 'YYYY-MM-DD' (date mode string)
  timezone: string; location: string; email: string;
  calendarUrl: string | null; githubUrl: string | null; linkedinUrl: string | null;
  seoTitleEn: string | null; seoTitleEs: string | null;
  seoDescriptionEn: string | null; seoDescriptionEs: string | null;
  updatedAt: Date;
};
export type HeroSettings = Pick<SiteSettings,
  "headlineEn" | "headlineEs" | "availabilityStatus" | "availableFrom" | "timezone" | "location" | "updatedAt">;
```
The fixture uses `satisfies HeroSettings`. Fields Teo hasn't confirmed are left empty (`availableFrom: null`) and the component skips that segment (UI-SPEC "partial" row). The values Teo must confirm at the headline checkpoint are the status (`from_date`?), the date (copy.md shows "Nov 2026" only as a *format* example), and `location` (P4).

`localized()` goes in `src/lib/i18n-fields.ts` exactly as specified [VERIFIED: docs/data-model.md:150-153]:
```ts
export function localized<T extends Record<string, unknown>>(row: T, field: string, locale: 'en' | 'es') {
  const key = `${field}${locale === 'en' ? 'En' : 'Es'}` as keyof T;
  return (row[key] ?? row[`${field}En` as keyof T]) as T[keyof T];   // fallback a inglés
}
```
Note the English fallback: an empty `headlineEs: ""` is not nullish, so it does **not** fall back. "Empty headline → hero returns null" must check for an empty string explicitly.

### Pattern 5: `/lab/hero` under `cacheComponents`
`searchParams` is a runtime API. Read it inside a `<Suspense>` child or the build reports a blocking route. [CITED: node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md:161-191]
```tsx
// src/app/lab/hero/page.tsx
import { Suspense } from "react";
export default function Page({ searchParams }: PageProps<"/lab/hero">) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <HeroLab searchParams={searchParams} />
    </Suspense>
  );
}
async function HeroLab({ searchParams }: { searchParams: PageProps<"/lab/hero">["searchParams"] }) {
  const sp = await searchParams;
  const variant = typeof sp.variant === "string" ? sp.variant : "a";
  // unknown variant → UI-SPEC error state; unknown lang/theme → defaults
  // <div className={theme === "dark" ? "dark min-h-dvh bg-background" : "min-h-dvh bg-background"}> …
}
```
- `src/app/lab/layout.tsx`: `export const metadata: Metadata = { robots: { index: false, follow: false } }` [CITED: generate-metadata.md:551+], plus `if (process.env.VERCEL_ENV === "production") notFound()`. `VERCEL_ENV` is evaluated at prerender time, which is what we want. Locally it's undefined, so the lab renders. [ASSUMED: assumes the GitHub repo auto-deploys `main` to Production on Vercel. The guard is harmless either way.]
- `@custom-variant dark (&:is(.dark *))` matches **descendants** of `.dark`, not the `.dark` element itself. A `dark:` utility on the same container that carries `.dark` doesn't apply. Token-based utilities (`bg-background`) do work there, because the vars are redefined on the element. [VERIFIED: globals.css:5 selector semantics]
- Pass `PageProps<"/lab/hero">` (typed routes via `next typegen`/build). If the type isn't generated yet in a fresh checkout, run `pnpm build` or `next typegen` first.

### Pattern 6: Content file shape (D-08), mapped to data-model.md
Field names come from data-model.md:47-72 [VERIFIED: docs/data-model.md:47-72]: `slug`, `titleEn/Es`, `taglineEn/Es`, `problemEn/Es`, `roleEn/Es`, `solutionEn/Es`, `caseStudyEn/Es` (Tiptap JSON), `resultsEn/Es` (text[]), `metrics: jsonb('metrics').$type<{ label: string; value: string }[]>()`, `techDecisionsEn/Es: TechDecisions`, `liveUrl`, `repoUrl`, `coverImage`, `media: jsonb('media').$type<{ url: string; altEn: string; altEs: string; type: 'image' | 'video' }[]>()`, `featured`, `startedAt`, `finishedAt`, and
```
export type TechDecisions = {
  decisions: { title: string; body: string }[];   // qué decidí y por qué
  tradeoffs?: string;
  validation?: string;                              // cómo lo verifiqué (tests, métricas)
  aiTools?: string[];                               // herramientas de IA usadas, como una más
};
```
Recommended shape (Claude's recommendation; the exact layout is the planner's call within D-08):
```markdown
---
slug: centro-estetico-manuj          # immutable once published
enStatus: draft-translation           # D-07 → "approved" after Teo; gate greps for draft-translation
source: interview-2026-10-30          # provenance: Teo's interview, not the website
clientPermission: true                # D-12 (ManuJ, EcoExport). false/omitted → no captures or figures shown
sampleData: false                     # true for inventory + finance (D-14)
titleEn: …
titleEs: …
taglineEn: …
taglineEs: …
liveUrl: https://centroesteticomanuj.com
repoUrl: null
startedAt: 2025-…                     # 'YYYY-MM-DD' or null (date mode string)
finishedAt: null
stack: [Next.js, Tailwind CSS, Cloudinary]   # names → skills/project_skills in phase 2
metrics:                               # D-10: no source → not here (goes to results as qualitative text)
  - labelEs: Rendimiento móvil
    labelEn: Mobile performance
    value: "…"
    source: "PageSpeed Insights, móvil, <fecha>"   # D-11: phase 2 seed appends to label
resultsEs: [ … ]
resultsEn: [ … ]
techDecisionsEs: { decisions: [ {title, body} ×2–3 ], tradeoffs: …, validation: …, aiTools: [ … ] }
techDecisionsEn: { … }
media:
  - file: material/centro-estetico-manuj/01-home.webp
    altEs: …                           # factual description of the screenshot; Claude may draft, Teo approves
    altEn: …
    type: image
---
## problemEs
…
## problemEn
…
## roleEs / ## roleEn / ## solutionEs / ## solutionEn / ## caseStudyEs / ## caseStudyEn
```
- **Headings = exact field names**, so the phase 2 seed splits on `^## (\w+)$` with no fuzzy matching. Body Markdown stays inside the StarterKit subset for `@tiptap/markdown` (phase 2).
- **The metrics localization gap:** `metrics` is a single, non-localized `{label, value}[]` (data-model.md:57), but the site is bilingual, and D-11's example label is Spanish. Store `labelEs`/`labelEn` + `source` losslessly now. How phase 2 collapses them (an English-only label, or `metricsEn/metricsEs`, which is a data-model change) is Teo's decision. See Open Q2.
- **Contract test** (if `yaml` is approved): `src/features/projects/content-schema.ts` holds a Zod schema for the front-matter (required en+es pairs, `techDecisions*.decisions.length` 2–3, `metrics[].source` non-empty, `clientPermission` boolean, URLs `z.url()` or null, `enStatus` enum), and `content-schema.test.ts` loads all 4 files and parses them. The phase 2 seed imports the same schema.
- **Anti-invention test:** for each file, the multiset of numbers (`/\d+([.,]\d+)?%?/g`) in the EN fields must equal the one in the ES fields. A translation can't add or change a figure. Cheap, deterministic, and it catches the most dangerous kind of invention.

**Interview script (D-06; covers every IDEN-05 field; Teo answers in Spanish):**
1. ¿Nombre del proyecto en en/es y una frase (tagline) que diga qué es y para quién?
2. Problema: ¿qué tenía el cliente antes y qué le dolía? (2–3 frases)
3. Rol: ¿qué hiciste tú exactamente y qué hicieron otros (si hubo)?
4. Solución: ¿qué construiste? (módulos, flujos, integraciones)
5. Resultados: 2–3 resultados. Para cada cifra: valor, fuente (analytics, PageSpeed/Lighthouse con fecha, el cliente) y fecha. Sin fuente → lo dices en texto cualitativo (D-10).
6. Decisiones técnicas (2–3): qué decidiste, por qué, qué descartaste (tradeoffs), cómo lo verificaste, y si usaste IA, cuál y para qué.
7. URLs: sitio en vivo, repo (¿público?).
8. Fechas de inicio y fin (mes/año basta) y stack.
9. Permiso del cliente para capturas y cifras (ya confirmado: ManuJ y EcoExport = sí).
10. Vistas a capturar (3+) y si contienen datos personales de clientes reales.

### Pattern 7: Capture script (D-13, D-14, D-15), zero new dependencies
Verified this session: a 1440×900 viewport at `deviceScaleFactor: 2` yields a 2880×1800 PNG. Chromium's canvas downsamples it to **1600×1000 WebP** (`toDataURL('image/webp', q)` → `data:image/webp;…`, 1600×1000). At DSF 1 the source is only 1440 wide and would have to be *upscaled* to reach the 1600-wide target. [VERIFIED: Playwright probe]
```ts
// scripts/capture-material.ts — run: node scripts/capture-material.ts <slug> [baseUrl]
// Node 24.22 strips types natively (verified). Single file: no relative .ts imports (avoids TS5097).
import { chromium } from "@playwright/test";
type View = { name: string; path: string; setup?: (p: import("@playwright/test").Page) => Promise<void> };
const VIEWS: Record<string, { base: string; sampleData: boolean; views: View[] }> = { /* filled from Teo's picks */ };
// per view: newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2, reducedMotion:'reduce', locale })
// goto(waitUntil:'networkidle') → setup() (close modal, pause carousel, hide floating buttons)
// → screenshot() → write NN-name.png → encode WebP 1600w in-page via canvas → write NN-name.webp
```
Live-site findings to bake into `setup` (probed 2026-10-30):
- **ManuJ** (Next.js on Vercel): on load, a **promotional modal** (`div.fixed inset-0 z-50 bg-black/60` + centered dialog, a birthday discount) covers the page. There is also a **hero carousel** (dots and arrows, so the frame isn't deterministic), a floating chat/WhatsApp button (`a.fixed bottom-5 right-5`), and a sticky header showing the business phone. `reducedMotion: 'reduce'` did not suppress the modal. Close it with `Escape` or its close button, wait for the carousel to settle (or pick slide 1 by clicking its dot), and decide with Teo whether to hide the floating button.
- **EcoExport**: redirects `ecoexportcostarica.com/es` → `www.ecoexportcostarica.com/es` (308). It has one floating button (`div.fixed bottom-6 right-6`). Use the `www` URL directly.
- Both have lazy images below the fold (13 and 3). Viewport-only captures (D-13) are unaffected. Any full-page capture would need a scroll pass.
- D-14 (sample-data apps): the base URL is a CLI arg (Teo's `localhost:<port>`). Mark the output with `material/<slug>/README.md` ("Capturas con datos de ejemplo, no son datos reales de clientes") and `sampleData: true` in the content file.
- Dimension gate: `sips -g pixelWidth -g pixelHeight material/*/*.webp` (sips *reads* WebP) or Pillow. Expect 1600×1000 and ≥3 per slug.

### Pattern 8: Static TTFs for react-pdf (D-19), verified source
The google/fonts repo ships **only variable TTFs** for all three families (`FunnelDisplay[wght].ttf`; `HankenGrotesk[wght].ttf` + `-Italic[wght].ttf`; `GeistMono[wght].ttf` + italic), with no `static/` folder. [VERIFIED: GitHub contents API for ofl/funneldisplay, ofl/hankengrotesk, ofl/geistmono] So D-19's "static/ oficiales" premise doesn't hold for any of them.

The Google Fonts **CSS2 API called with an empty User-Agent** returns Google-generated **static** TTF instances, not subsetted:
```bash
curl -s -A "" "https://fonts.googleapis.com/css2?family=Funnel+Display:wght@600;700&family=Hanken+Grotesk:ital,wght@0,400;0,700;1,400&family=Geist+Mono:wght@400"
# → src: url(https://fonts.gstatic.com/s/…/….ttf) format('truetype') per weight/style
```
fontTools check on the downloaded files (this session) [VERIFIED: fontTools 4.63.0 probe]:
```
FunnelDisplay-600.ttf: name='Funnel Display SemiBold' fvar=False wght=600 glyphs=348 missing_es=[]
FunnelDisplay-700.ttf: name='Funnel Display Bold'     fvar=False wght=700 glyphs=348 missing_es=[]
GeistMono-400.ttf:     name='Geist Mono Regular'      fvar=False wght=400 glyphs=889 missing_es=[]
HankenGrotesk-400-italic.ttf: 'Hanken Grotesk Italic' fvar=False italicAngle=-8.0 glyphs=550 missing_es=[]
HankenGrotesk-400.ttf: 'Hanken Grotesk Regular'       fvar=False wght=400 glyphs=550 missing_es=[]
HankenGrotesk-700.ttf: 'Hanken Grotesk Bold'          fvar=False wght=700 glyphs=550 missing_es=[]
```
The cmap sizes equal the variable masters' (Funnel 348, Hanken 550), so nothing was subsetted away. The only gap in a 37-char Latin Extended-A sample is Funnel Display's `Ţ` (U+0162, Romanian legacy), which is irrelevant for en/es.
- **Recommended:** this method for all six files. It's an official Google source and needs no instancing. `fonttools varLib.instancer --static` on the `[wght]` masters is the equivalent fallback (installed, verified callable).
- **OFL compliance:** the repo is public, which counts as redistribution, and the SIL OFL requires the license to travel with the fonts. Commit each family's `OFL.txt` (from `google/fonts/ofl/<family>/OFL.txt`) into `assets/fonts-pdf/`.
- Rename to react-pdf-friendly names (`HankenGrotesk-Regular.ttf`, `-Bold`, `-Italic`, `FunnelDisplay-SemiBold`, `-Bold`, `GeistMono-Regular`). `.claude/CLAUDE.md` §7 shows the expected `Font.register` paths.

### Anti-Patterns to Avoid
- **Writing any content the executor "infers" from the live sites** (taglines, results, alt text with claims). D-06 forbids it. Alt text may *describe what's visible* only, drafted for Teo's approval.
- **Declaring the shadcn aliases only on `:root`.** It breaks the nested dark scope (Pattern 1).
- **Formatting `availableFrom` without `timeZone: "UTC"`** (Pitfall 3).
- **Hardcoding "UTC-5".** Derive it from `timezone` and normalize Intl's `GMT-5` → `UTC-5`.
- **Running `impeccable document` or `impeccable init`.** `document` regenerates DESIGN.md (forbidden without Teo). `init` writes a new PRODUCT.md. Use only `critique` and `audit`.
- **Deleting `/lab` before phase verification.** Success criterion 1 needs a page that renders the tokens.
- **Adding `next-themes` or a client theme toggle.** The lab theme is a query param + class (D-17). The real toggle is phase 4.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font self-hosting | Downloading woff2 into `public/` + manual `@font-face` | `next/font/google` | Fallback metric adjustment (CLS), hashing, preload, unicode-range subsets are all automatic |
| Static PDF fonts | Instancing by hand / converting WOFF2 | Google CSS2 API TTFs (or `fonttools varLib.instancer --static`) | Official instances, verified static |
| Glyph verification | Eyeballing a PDF | fontTools `getBestCmap()` script | Deterministic, scriptable gate |
| PNG→WebP | New npm dep (sharp is transitive and not importable) | Chromium canvas in the same Playwright script, or Pillow | Zero new deps (verified) |
| UTC offset / month names | String tables | `Intl.DateTimeFormat` (`shortOffset`, `{month:'short', year:'numeric'}`) | Locale-correct `Nov 2026` / `nov 2026` (verified) |
| Class merging | Manual string concat | `cn` (already wired) | Conflict resolution for Button overrides |
| YAML parsing | A regex front-matter parser | `yaml` (needs approval) or PyYAML one-off | YAML edge cases (multiline, quoting `"98"` vs `98`, `null`) |

**Key insight:** in this phase the expensive failures aren't code bugs. They're *content provenance* failures (an invented number, a translated claim) and *public-repo leaks* (a client's personal data in a screenshot). The guardrails that matter are checkpoints, provenance fields and parity tests, not libraries.

## Common Pitfalls

### Pitfall 1: Nested `.dark` doesn't re-theme shadcn aliases
**What goes wrong:** `/lab/hero?theme=dark` shows a light background and borders even though the container has `.dark`.
**Why:** the aliases are resolved where they're declared (`:root`), then inherited as resolved values.
**How to avoid:** declare the alias block on `:root, .dark` (verified fix).
**Warning signs:** dark screenshots where `--bg-elev` surfaces look right but `bg-background`/`border-border` stay light.

### Pitfall 2: `/material/` is git-ignored
**What goes wrong:** captures are made, D-15 "antes de commitear" does nothing, `git status` is clean, and the material exists only on Teo's laptop. A verifier with `search_gitignored: false` may not see it.
**Evidence:** `.gitignore:44-45` [VERIFIED]: `# material original (capturas y logos de clientes; se suben a Blob desde el admin)` / `/material/`.
**How to avoid:** a blocking-human decision at phase start (Open Q1). The verification commands must read the filesystem (`ls material/*/`), not `git ls-files`.

### Pitfall 3: Date-only values render a month early in Bogotá
**What goes wrong:** `availableFrom = '2026-11-01'` shows "Oct 2026" locally. On Vercel (UTC) it shows "Nov 2026", so local screenshots and production disagree.
**Evidence (this session):** `Intl.DateTimeFormat('en',{month:'short',year:'numeric'}).format(new Date('2026-11-01'))` → `Oct 2026` with local TZ America/Bogota. With `timeZone:'UTC'` → `Nov 2026`.
**How to avoid:** always pass `timeZone: "UTC"` for date-only strings. For variant B's `updatedAt` (a `Date`), produce the `YYYY-MM-DD` `dateTime` attribute with `Intl.DateTimeFormat('en-CA', { timeZone: settings.timezone })`, not `toISOString().slice(0,10)` (UTC date, off by one after 7 pm Bogotá). Put these in `src/lib/format.ts` with Vitest tests.

### Pitfall 4: Intl returns `GMT-5`, not `UTC-5`
**Evidence:** `shortOffset` for America/Bogota gives `GMT-5` in both `en` and `es` (Node 24, ICU 79.1). **Fix:** `.replace(/^GMT/, "UTC")`, and handle `GMT` alone (offset 0) → `UTC`.

### Pitfall 5: The quality gate is red before any work, and `pnpm check` doesn't exist
**Evidence:** `pnpm lint` exits 1 on the untouched scaffold. Biome scans `.claude/skills/impeccable/scripts/*.js` (≈160 errors) and `.agents/skills/vercel-optimize/lib/*.mjs`. `src/components/ui/button.tsx`, `src/lib/utils.ts` and `src/app/globals.css` fail formatting (no semicolons in the shadcn output). `package.json` has no `check`, `test` or `typecheck` scripts. `tsc --noEmit` passes, and `pnpm build` passes (3.9 s). [VERIFIED: commands run this session]
**How to avoid:** a Wave 0 task. Add `"!.claude", "!.agents", "!.planning"` to `biome.json` `files.includes` (biome.json:10) and run `pnpm format` on `src/`. Add `"typecheck": "tsc --noEmit"`. A provisional `"check"` (typecheck + lint + build, plus `vitest run` if a test exists) is reasonable. BASE-10 formalizes it with CI in phase 2. Log the Biome exclusion in `docs/decisions.md` (Claude, within limits: tooling config, no visual change).
**Warning signs:** executors "fixing" vendored skill files to satisfy lint. That's forbidden.

### Pitfall 6: Default Tailwind line-heights leak into DESIGN's scale
See Pattern 2. Overriding `--text-sm` without `--text-sm--line-height` leaves 1.43 instead of 1.55.

### Pitfall 7: Screenshot nondeterminism (live sites and the lab)
- ManuJ modal, carousel and floating button (Pattern 7).
- **Dev overlay in lab captures:** `next dev` injects the dev-tools indicator. Capture against `pnpm build && pnpm start` (production fonts, no overlay). `/lab` still renders because `VERCEL_ENV` is unset locally.
- Font swap: wait for `document.fonts.ready` before each screenshot.

### Pitfall 8: Invented content through "helpful" defaults
**What goes wrong:** the executor fills a missing tagline, metric, overlap text or Spanish string to make a test pass or a component render.
**How to avoid:** blocking-human checkpoints. Schema allows absence (nullable fields) and components return `null`. Gates:
`! grep -nE '\[(Teo escribe|ejemplo|ej\.|\.\.\.|sí/no|en qué)' docs/copy.md` (the real markers at copy.md:7,9,15,18,21,22,33,51,52 [VERIFIED: grep]); `! grep -rn 'draft-translation' docs/content docs/copy.md` at close; the number-parity test; `heroFixtureMeta.headlineSource` must no longer say borrador.
Also: copy.md's own headings contain em-dashes (`### Freelance — Frontend Developer`, copy.md:45,47). After Teo's rewrite, `! grep -n '—' docs/copy.md docs/content/*.md` keeps the no-em-dash rule mechanically true.

### Pitfall 9: The impeccable hook flags the lab's intentional specimen rows
`/lab/tokens` deliberately renders all 8 type steps and the 500/700 weights (UI-SPEC "Excepción de inspección de tokens"). The PostToolUse hook (`.claude/settings.local.json`) may report design-system drift. Triage per `reference/hooks.md`: a narrow `ignore-file 'src/app/lab/tokens/**'` with `--reason "Teo-approved UI-SPEC: token specimen page, deleted with /lab"`, never a project-wide rule ignore.

### Pitfall 10: Phase 2 deletes the root layout
BASE-02 removes `src/app/layout.tsx`. If `/lab` still exists then, it either gets its own root layout or is deleted first. Recommendation: delete `/lab` as the first task of phase 2 (D-02 allows it). Keep the fonts in `src/app/fonts.ts` so nothing is lost.

## Code Examples

### StatusLine formatting helpers (server-only, deterministic)
```ts
// src/lib/format.ts — behavior verified with Node 24 Intl this session
export function formatMonthYear(isoDate: string, locale: "en" | "es") {
  return new Intl.DateTimeFormat(locale, { month: "short", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${isoDate}T00:00:00Z`));            // en "Nov 2026", es "nov 2026"
}
export function formatUtcOffset(timeZone: string, at: Date) {
  const part = new Intl.DateTimeFormat("en", { timeZone, timeZoneName: "shortOffset" })
    .formatToParts(at).find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  return part.replace(/^GMT/, "UTC");                       // "GMT-5" → "UTC-5"
}
export function formatEntryDate(at: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" })
    .format(at);                                             // "YYYY-MM-DD" in Teo's zone
}
```
`formatUtcOffset` uses a fixed `at` (the fixture's `updatedAt`), not `new Date()`. Reading the current time in a prerendered RSC under `cacheComponents` is a runtime dependency, and Bogotá has no DST anyway.

### Font verification gate
```bash
python3 -I scripts/verify-pdf-fonts.py assets/fonts-pdf/*.ttf   # or a scratch copy if Teo prefers no .py in repo
# asserts: 'fvar' not in font; all of "áéíóúüñÁÉÍÓÚÜÑ¿¡" in getBestCmap(); usWeightClass matches filename
```

### No font CDN in the build output
```bash
pnpm build && ! grep -rlE "fonts\.(googleapis|gstatic)\.com" .next/static .next/server/app 2>/dev/null
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `next/font/local` + downloaded woff2 (DESIGN.md:16) | `next/font/google`, build-time self-hosting | Teo approved D-16 | DESIGN.md §2 edit (approved) |
| `:root[data-theme="dark"]` (DESIGN.md:33) | `.dark` class + `@custom-variant dark` | Teo approved D-17 | DESIGN.md §3 edit (approved) |
| clsx + tailwind-merge | `cn` package | shadcn 4.x | Already in `src/lib/utils.ts` |
| shadcn on Radix | shadcn `base-nova` on Base UI (`render` prop + `nativeButton={false}` for link-buttons) | shadcn 4 | CTA as `<a>` per UI-SPEC |
| Google Fonts "download family" ZIP with `static/` | CSS2 API static TTFs (empty UA) or `fonttools varLib.instancer` | google/fonts repo ships variable-only for these families | D-19's premise is outdated; same outcome |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Pushes to `main` auto-deploy to Vercel Production (no `.vercel/` dir locally to confirm) | Pattern 5 | Low. The `VERCEL_ENV` guard is harmless if not; if yes, it's what keeps `/lab` out of production |
| A2 | The CSS2-API static TTFs render correctly in @react-pdf/renderer 4.9 (fontkit) | Pattern 8 | Medium. Phase 3 already has a react-pdf spike on day 5 (STATE.md). Fallback: `varLib.instancer --static` |
| A3 | Teo's availability for the fixture is `from_date` / Nov 2026 (copy.md shows it only as a format example) | Pattern 4 | Medium. Wrong public claim. Confirm at the headline checkpoint |
| A4 | Biome 2.4's `next` domain doesn't flag plain `<a>` in the lab bar (if it does, use `next/link`) | Pattern 5 | Low. Lint fix |
| A5 | `impeccable critique/audit` run fine without a `PRODUCT.md` (the project uses `PROJECT.md`) and don't force `init` | Pitfall 9 | Low. If it asks, answer from PROJECT.md. Don't let it write files without Teo |
| A6 | `latin-ext` preload adds ~3 woff2 files (one per family) on routes using all three fonts | Pattern 3 | Low now, possibly relevant to the phase 4 Lighthouse ≥95 gate |

## Open Questions (all need Teo; none blocks the Wave 1 code)

1. **`/material/` git-ignored vs. D-15 "commit after PII review".**
   - Known: `.gitignore:44-45` ignores it on purpose ("capturas y logos de clientes; se suben a Blob desde el admin"). The phase goal says content "vive en el repo".
   - Options: (a) keep ignored, so material stays local only and phase 3 uploads from Teo's machine (no backup, invisible to CI and verifier); (b) commit only `material/**/*.webp` after the PII review, keeping PNG originals and logos ignored; (c) commit everything.
   - Recommendation: **(b)**. It satisfies D-15 and the goal without publishing originals. Ask as a `checkpoint:decision` before the capture plan.
2. **Metric labels in two languages.** `metrics` is not localized (data-model.md:57), D-11 says "no se toca data-model.md", and the example label is Spanish. Recommendation: store `labelEs/labelEn/source` in `docs/content` now (lossless). Add "how metrics become bilingual" to the phase 2 approval batch, which already edits data-model.md for `languages`.
3. **Dependency approvals:** `yaml` 2.9.1 (content contract test, needed by the phase 2 seed anyway) and `@axe-core/playwright` 4.14.0 (UI-SPEC axe gate, already in the phase 2 batch). One `checkpoint:decision` at phase start. Fallbacks are documented above.
4. **When `/lab` is deleted.** D-02 allows "antes de cerrar la fase o al principio de la fase 2". Success criterion 1 needs a rendered tokens page. Recommendation: delete at the start of phase 2. Record this in decisions.md.
5. **UI-SPEC P1–P5** (accent contrast, CTA copy, variant B date, `location`, the DESIGN.md §4 em-dash) are answered in the same checkpoint as the variant pick.
6. **`latin-ext` preload** (perf, phase 4): D-16 is locked. Flag it only if the Lighthouse gate is tight later.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | build, scripts (type stripping) | ✓ | 24.22.1 | — |
| pnpm | all | ✓ | 12.16.1 | — |
| Network → fonts.googleapis.com / gstatic | `next/font/google` build, TTF download | ✓ (build passed; curl OK) | — | none at build time |
| Playwright + Chromium | captures, WebP encoding | ✓ | 1.64.1 / chromium-1248 (matches) | — |
| Python 3 + fontTools | TTF verification / instancer | ✓ | 3.13.5 / 4.63.0 | — |
| Pillow (WebP) | alternative encoder | ✓ | 12.3.0 | Chromium canvas (primary) |
| PyYAML | content-validation fallback | ✓ | 6.0.2 | `yaml` npm (if approved) |
| `cwebp` | — | ✗ | — | Chromium canvas / Pillow |
| `sips` WebP write | — | ✗ (read-only) | macOS 26.2 | read dimensions only |
| ManuJ / EcoExport live | D-13 captures | ✓ (200; EcoExport via `www.` after 308) | — | — |
| Teo's inventory + finance apps locally | D-14 captures | ? (other repos, Teo runs them) | — | human-action checkpoint |
| axe-core | UI-SPEC axe gate | ✗ (not importable) | — | approval, or impeccable audit + manual keyboard check |

**Missing with no fallback:** none blocking.
**Missing with fallback:** axe (approval or substitute), YAML parser (approval or PyYAML).

## Validation Architecture

Skipped: `workflow.nyquist_validation` is explicitly `false` in `.planning/config.json`. The phase-specific automated gates the planner should still wire into `<verify>` blocks: `pnpm exec tsc --noEmit`, `pnpm lint` (after the Wave 0 Biome fix), `pnpm build`, the no-CDN grep, the placeholder/`draft-translation`/em-dash greps, `vitest run` for `src/lib/format.test.ts` and the content contract (if approved), the TTF fontTools check, and the WebP dimension/count check.

## Security Domain

`security_enforcement: true`, ASVS level 1. This phase has no auth, no input handling and no server mutations. The relevant risks are information disclosure in a **public repo** and an unintended public route.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — (phase 2) |
| V3 Session Management | no | — |
| V4 Access Control | partially | `/lab` gated by `notFound()` in Vercel production + `robots: noindex`, no inbound links |
| V5 Input Validation | minimal | `/lab/hero` query params whitelisted (`a/b/c`, `en/es`, `light/dark`). Unknown values → default or error message. Never echo raw HTML (React escapes; the error string renders `{valor}` as text) |
| V6 Cryptography | no | — |
| V8 Data Protection | **yes** | PII review of screenshots and content before any commit (blocking-human). No secrets in repo |

### Known Threat Patterns
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Client customer data visible in screenshots (names, phones, bookings in admin views) | Information disclosure | Teo's blocking-human PII review. Sample-data only for the local apps. Decide the gitignore policy (Open Q1) |
| Client figures published without consent | Information disclosure / repudiation | `clientPermission` field per project. A metric without permission or source is excluded (D-10, D-12) |
| Lab route reachable/indexed in production | Information disclosure | `notFound()` on `VERCEL_ENV==='production'` + noindex + delete at the start of phase 2 |
| Reflected content via `?variant=` | Tampering (XSS) | Whitelist. React text escaping. No `dangerouslySetInnerHTML` |
| Font licensing (redistribution in a public repo) | Compliance | Commit `OFL.txt` per family in `assets/fonts-pdf/` |

## Sources

### Primary (HIGH confidence)
- `node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md`: self-hosting, `variable`, Tailwind v4 `@theme inline` usage, `app/fonts.ts` pattern, preload semantics
- `node_modules/next/dist/compiled/@next/font/dist/google/{loader.js,find-font-files-in-css.js,font-data.json}`: subsets = preload only, all subset files downloaded, family axes/subsets
- `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`: runtime APIs (`searchParams`) inside `<Suspense>`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md`: `robots`
- `node_modules/.pnpm/tailwindcss@4.3.3/.../theme.css:325,347-362`: default `--text-*` and line-height pairs
- drizzle-orm 0.45.4 `pg-core/columns/{date,timestamp}.d.ts`: default modes
- Repo files read this session: `DESIGN.md`, `docs/data-model.md`, `docs/copy.md`, `docs/decisions.md`, `.gitignore`, `biome.json`, `package.json`, `next.config.ts`, `src/app/{layout.tsx,globals.css}`, `src/components/ui/button.tsx`, `PROJECT.md`, `01-UI-SPEC.md`, `01-CONTEXT.md`
- Live probes: Chromium CSS cascade test, Chromium WebP encode, Node Intl outputs, fontTools on downloaded TTFs, `pnpm lint/tsc/build` baseline, live-site overlay probe
- gsd-tools `package-legitimacy check` + `npm view` (yaml, @axe-core/playwright, @tiptap/markdown)

### Secondary (MEDIUM confidence)
- Context7 `/ueberdosis/tiptap-docs` (markdown-manager.mdx): `MarkdownManager.parse` for the phase 2 seed
- GitHub contents API `google/fonts/ofl/{funneldisplay,hankengrotesk,geistmono}`: variable-only masters
- `~/.claude/gsd-core/references/{checkpoints.md,planner-human-verify-mode.md}`: gate semantics under yolo / end-of-phase

### Tertiary (LOW confidence)
- None used for recommendations.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH. No new runtime deps. Every tool was probed locally.
- Architecture (tokens, fonts, lab, fixture types): HIGH. Verified against bundled docs, installed type definitions and live browser tests.
- Content format and checkpoint structure: MEDIUM. The shape follows D-08 and data-model.md, but the metrics localization gap and the material/ policy need Teo.
- Pitfalls: HIGH. Every pitfall above was reproduced or read from source this session.

**Research date:** 2026-10-30
**Valid until:** 2026-11-29 (stable stack, pinned versions). Re-probe the live sites right before capturing, because modals and promos change.
