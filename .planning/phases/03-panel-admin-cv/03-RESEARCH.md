# Phase 3: Panel admin + CV - Research

**Researched:** 2026-11-16
**Domain:** Next.js 16.4 admin CMS (Server Actions, Cache Components invalidation, Draft Mode), Vercel Blob client uploads, server-side PDF (react-pdf 4.9), JSON Resume
**Confidence:** HIGH for Next/Blob/Tiptap/TanStack/dnd-kit APIs (verified in installed `node_modules` and bundled Next docs). MEDIUM for react-pdf inside the Next server layer on Vercel (verified in plain Node; the Next + Vercel path still needs the day-5 spike).

## Summary

Every library this phase needs is already installed and pinned. The only new packages are `unpdf` (devDependency for the PDF text-extraction test), `sonner`, and shadcn registry components. The shadcn components pull no npm packages beyond `cn`, with one exception: shadcn's `sonner` item also pulls **`next-themes`**, which is banned. So `sonner` must be installed by hand with a hand-written wrapper. Most of the admin is plain Next 16.4 work: Server Actions guarded by the session, Zod schemas shared between client and server, `updateTag` on the affected tags, and admin loaders that are never cached. Four findings shape the plan:

1. **Draft Mode already works with `'use cache'`** (bundled docs, and the `draftMode()` source in 16.4.6). Inside a cache scope, `isEnabled` is readable. With the bypass cookie, cached functions re-execute and nothing is stored. During prerender, `draftMode()` returns `isEnabled: false` without postponing. That means the `DraftBanner` can read `draftMode()` directly in `[locale]/layout.tsx` without breaking the static shell. The existing `getProjects`/`getProject` wrappers already read it. What is missing is the D-01 overlay: public reads must return the published columns with no `draft` field, and Draft Mode reads must return the columns with the pending draft merged on top.
2. **D-01 is easiest as one nullable `draft jsonb` column per content row**, not as `*_draft` columns. Never-published rows are edited in place. Published rows put pending edits in `draft`, and "Publicar" copies them into the columns in one `db.batch`. Saving a draft of a published row needs **no public tag invalidation**, because the public site never reads `draft`.
3. **react-pdf 4.9 renders correctly in plain Node 24 with the repo's static TTFs.** In a scratchpad spike, a 10.7 KB A4 page rendered in 53 ms, with 3 embedded `FontFile2`, 3 `ToUnicode` maps and `/Lang`, so the text layer is real. Next's vendored React and `react@19.3.1` use the same element symbol (`react.transitional.element`), and react-pdf is in Next's default `serverExternalPackages`. What is still unverified is a Server Action on Vercel: font tracing, and a Buffer response body getting re-encoded (a Vercel community report on Next 16.2/Node 24). The CV plan should start with that spike.
4. **Phase 2 left four open review findings that block this phase** (02-REVIEW-DISPOSITION): CR-01 (`seed --force` overwrites whole rows), CR-02 (no production guard on seed/restore), WR-01 (every admin page/loader must call `requireSession()`), and WR-06 (guessable public Blob backup paths; drafts in the public `content/*.json`). Fix these before any admin write path ships. Otherwise one `pnpm seed --force` wipes what Teo loads in D-09.

**Primary recommendation:** Wave 1 has three tasks: the phase 2 carry-overs, the `draft jsonb` schema change with draft-aware cores, and a react-pdf spike through a real Server Action deployed to a Vercel Preview. After that, build one reusable form kit (BilingualField, Repeater, UnsavedGuard + NavigationBlocker, SortableList, DeleteConfirm) and apply it to the 5 entities, then add the CV/JSON Resume pipeline, which reads from a single `CvData` builder.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Borrador y publicación
- **D-01:** Editar algo ya publicado y pulsar "Guardar borrador" **no toca el sitio público**: sigue la versión publicada y los cambios salen solo con "Publicar". Requiere guardar los cambios pendientes aparte de la versión publicada (columnas de borrador o un JSON de cambios pendientes por fila; el mecanismo lo elige el planner). Teo aprueba el cambio en `docs/data-model.md` y la migración nueva (eligió la opción que lo decía explícitamente). Se registra en `docs/decisions.md` como decisión de Teo. — **Reversibility:** one-way — añade columnas y una migración aplicada en Neon `dev` y `main`; quitarlas exige otra migración y reescribir queries y actions.
- **D-02:** El flujo borrador/publicar aplica a **todas** las entidades de contenido: proyectos, experiencia, skills, educación y SiteSettings (ADMN-05). Ojo: `site_settings` hoy no tiene `status`; entra en el mismo cambio de esquema de D-01. Las queries públicas siguen leyendo solo lo publicado y visible.
- **D-03:** Draft Mode (ADMN-11): botón "Previsualizar" en el formulario que abre en pestaña nueva la ruta pública real (`/projects/[slug]` o `/es/proyectos/[slug]`, y la home para SiteSettings) con el borrador y una banda visible "Vista previa" con salida. Ruta interna `/api/draft` para activar y desactivar (aprobada en D-13). Sin panel lado a lado ni iframe.

#### CV
- **D-04:** Hasta **2 páginas**, una columna, sin foto, capa de texto real (CV-03).
- **D-05:** Proyectos en el CV: **solo los marcados `featured`** (columna existente), publicados y visibles.
- **D-06:** El resumen que abre el CV es el **titular + bio de SiteSettings**. Una sola fuente de verdad.
- **D-07:** **Sin overrides en v1.** El PDF sale tal cual de los datos; la columna `resume_versions.overrides` queda sin UI (no se borra).
- **D-08:** El CV público es la **copia generada y guardada en Blob** (snapshot), no un render en vivo. Se genera a mano desde `/admin/cv`; `/cv/en.pdf` y `/cv/es.pdf` sirven la última versión; el historial lista y descarga todas (CV-04). Rutas versionadas en Blob (`resume/<locale>/v<n>.pdf`), nunca sobrescritas. Aprobado por Teo; se registra en `docs/decisions.md`.

#### Cierre de la fase con contenido real
- **D-09:** El último plan es una **sesión de carga de Teo** (checkpoint humano bloqueante): él carga desde los formularios los 4 proyectos (narrativa, decisiones técnicas, métricas con fuente), los bullets de Sofka, las capturas 16:10 con alt en/es, el copy en/es, y genera el CV. La fase cierra cuando Teo dice "listo". El gate del ROADMAP no cambia. Los planes anteriores construyen y verifican el admin sobre los datos del seed.
- **D-10:** Inventario y Finanzas siguen en `draft`. Teo decide en la sesión de carga si los publica o los deja ocultos; nada se publica sin su sí. El código no asume ninguno de los dos casos.

#### Experiencia de edición
- **D-11:** El formulario de proyecto es **una sola página con secciones numeradas** (01 Básico, 02 Caso, 03 Decisiones, 04 Métricas, 05 Media, o similar) y un índice lateral, en línea con "la bitácora de un taller". Cmd+S guarda el formulario entero (ADMN-10). Las demás entidades siguen el mismo patrón, más corto.
- **D-12:** Campos bilingües en **dos columnas: ES a la izquierda, EN a la derecha**; en móvil se apilan (ES primero). Un campo ES vacío muestra la marca "Falta ES" (ADMN-07).
- **D-14:** Eliminar proyectos, experiencias, skills y educación es **borrado definitivo con confirmación** (diálogo donde Teo escribe el nombre). La recuperación es el export a `content/*.json` / Blob.
- **D-15:** Bandeja de mensajes (ADMN-13): lista con lo más reciente arriba, leer, marcar leído/no leído (con `read_at`) y eliminar, y contador de no leídos en la navegación. Vacía hasta la fase 4.

#### Aprobaciones de la fase (dadas por Teo en esta discusión)
- **D-13:** Rutas nuevas aprobadas. Públicas: `/cv/en.pdf`, `/cv/es.pdf`, `/resume.json`, `/resume.es.json`. Internas: `/api/cv/[lang]`, `/api/resume/[lang]`, `/api/blob/upload`, `/api/draft`. Admin: `/admin/ajustes`, `/admin/proyectos`, `/admin/experiencia`, `/admin/skills`, `/admin/educacion`, `/admin/cv`, `/admin/mensajes` (más las subrutas de crear/editar que necesiten). Se registran en `docs/decisions.md`. Cualquier ruta fuera de esta lista se pregunta.
- **D-16:** Dependencias aprobadas: (1) una devDependency para extraer texto del PDF en el test de tildes y ñ (p. ej. `unpdf`), verificada en npm y fijada exacta al instalar; (2) los componentes shadcn que necesite el admin (dialog, select, switch, textarea, table, toast…) y los paquetes pequeños que arrastren (p. ej. `sonner`). Se instalan en la primera tarea y se registran con versión exacta en `docs/decisions.md`. Lo que salga de esta lista se pregunta antes de instalar.
- **D-17:** `BLOB_READ_WRITE_TOKEN` se pide a Teo al inicio de la fase, con los pasos exactos (store **Public**; `.env.local` y Vercel Production + Preview). Mientras no esté, la subida y la generación del CV quedan tras una comprobación con mensaje claro, nunca con un mock.

### Claude's Discretion
- Mecanismo exacto de D-01 (columnas `*_draft` vs JSON `pending` por fila) y cómo se compara/publica, siempre documentado en `docs/data-model.md`.
- Procesamiento de imágenes en el cliente (formato, tamaño máximo, aviso si no es 16:10), dentro de `allowedContentTypes` y `maximumSizeInBytes`.
- Datos de contacto del CV (email, ciudad, enlaces, idiomas desde SiteSettings) y orden de secciones (resumen, experiencia, proyectos destacados, skills, educación, idiomas).
- Diseño visual de la navegación y de las pantallas del admin: va a `/gsd-ui-phase 3` (UI-SPEC), con los tokens de DESIGN.md.
- Estructura de componentes, nombres, tests, y cómo se valida el JSON Resume (Zod propio sin dependencia nueva).
- Qué etiquetas invalida cada action (ADMN-12), siempre con `updateTag` solo sobre las afectadas.

### Deferred Ideas (OUT OF SCOPE)
- Overrides solo para el PDF (columna `resume_versions.overrides`): fuera de v1 (D-07); revisable después.
- Panel de vista previa lado a lado (iframe) en el admin: descartado en favor de pestaña nueva (D-03).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADMN-01 | Admin UI in Spanish (fixed `es`) | Existing pattern: `getTranslations({ locale: 'es', namespace })` in `admin/layout.tsx`, `auth-gate.tsx`. `request.ts` resolves `es` when no root param. Strings go in `messages/es.json` + `en.json` (parity test in `src/lib/messages.test.ts`) |
| ADMN-02 | Edit SiteSettings (Tiptap Now, languages, links, SEO) | Single row `SITE_SETTINGS_ID`; same draft/publish flow (Pattern 1); RichTextField (Pattern 6); `languages` repeater |
| ADMN-03 | Projects CRUD incl. decisions + metrics with source | Project form + actions (Pattern 2); `techDecisions*` and `metrics*` jsonb shapes in `src/features/projects/schema.ts` |
| ADMN-04 | Experience, skills, education CRUD | Same kit; relations `experience_skills`, `experience_projects`, `project_skills` written with `db.batch` |
| ADMN-05 | Separate Save draft / Publish, visible toggle | Pattern 1 (`draft jsonb`); `visible` and `order` are structural and apply live (Open Q1) |
| ADMN-06 | Reorder with dnd-kit + keyboard | Pattern 5: `KeyboardSensor` + `sortableKeyboardCoordinates`, `accessibility.announcements` (Spanish), stable `DndContext id` |
| ADMN-07 | en/es side by side, empty ES marked | `BilingualField`; "empty" = `null` or `''` after trim (note `localized()` keeps `''`) |
| ADMN-08 | Client upload to Blob, alt en/es required | Pattern 7: `upload()` from `@vercel/blob/client` + `handleUpload` in `/api/blob/upload` with `requireSessionForRequest` |
| ADMN-09 | Slug fixed once published | Server-side check in the project action (`status === 'published' && input.slug !== row.slug` → reject); read-only input in UI |
| ADMN-10 | Cmd+S saves; leaving dirty asks | Pattern 4: Next 16.4 `Link onNavigate` + NavigationBlocker context (documented in link.md "Blocking navigation") + `beforeunload` + capture-phase keydown |
| ADMN-11 | Draft Mode preview on the real public route | Pattern 3: `/api/draft` GET (session-gated) → `draft.enable()` → redirect to a server-built path; DraftBanner in `[locale]/layout.tsx` |
| ADMN-12 | `updateTag` only on affected tags | Tag map (Pattern 2 table); `updateTag` is Server-Action-only (verified `updateTag.md`) |
| ADMN-13 | Contact message inbox | Uncached admin loader on `contact_messages`; mark read via `read_at`; unread count in AuthGate (inside Suspense) |
| CV-01 | Generate PDF en/es → Blob + `resume_versions` | Pattern 8: `renderToBuffer` in a Server Action → `put()` → `db.batch` insert → `updateTag(tags.resume)` |
| CV-02 | `/cv/en.pdf`, `/cv/es.pdf` serve latest | `next.config.ts` rewrites → `/api/cv/[lang]` streams the latest Blob |
| CV-03 | One column, real text layer, á é í ó ú ñ intact | Spike verified `ToUnicode` + embedded TTF in Node; test with `unpdf` `extractText` + NFC normalize |
| CV-04 | History, download any | List `resume_versions` newest first; Blob URL with `download` attribute |
| CV-05 | `/resume.json`, `/resume.es.json` live JSON Resume | Rewrites → `/api/resume/[lang]`; Zod schema mirroring JSON Resume (fields verified against `resume-schema/schema.json`) |
| IDEN-05 | 4 projects' content loaded (en/es, decisions, metrics with source) | Delivered by D-09 human checkpoint through the admin forms |
| IDEN-06 | ≥3 16:10 screenshots per project | ImageUploader with 16:10 warning + alt en/es; D-09 |
| IDEN-07 | Copy en/es without placeholders incl. Sofka bullets | Experience bullets repeater; D-09 |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Stack pinned. Do not change major versions without asking. **Adding/changing dependencies needs approval.** D-16 pre-approves `unpdf` (exact pin), shadcn components and the small packages they pull (`sonner`). Anything else must be asked first, for example `@tiptap/core`, `@dnd-kit/modifiers`, `next-themes` (banned outright).
- Read `AGENTS.md` and `node_modules/next/dist/docs/` before writing Next code. Do not edit the `nextjs-agent-rules` block.
- `proxy.ts`, not middleware. `params`/`cookies()`/`headers()` are async. `revalidateTag(tag, 'max')` takes a profile. In Server Actions, use `updateTag(tag)`. `'use cache'` cannot read `headers()`. Locale comes from `next/root-params`, which is **not available in Server Actions or Route Handlers**, so pass the locale explicitly.
- Feature folders `src/features/<entity>/{schema,queries,actions,validation}.ts` + `components/`. Server Components by default; `'use client'` only on interactive leaves.
- Mutation flow per CLAUDE.md: Zod → session → Drizzle → `updateTag` → `exportContent()`. `.claude/CLAUDE.md` and the Vercel `server-auth-actions` rule put the **session first**. Recommendation: session first, then Zod (see Pitfall 9). Record it in `docs/decisions.md`.
- Public queries: `'use cache'` + `cacheTag` (tags in `src/lib/cache-tags.ts`). Localized fields `title_en`/`title_es`; UI uses `localized(row, 'title', locale)`.
- UI strings in `messages/{en,es}.json`. Content lives only in the DB. No lorem ipsum or invented projects/metrics. Missing content means the component does not render.
- One commit per task, conventional messages, no "wip". Tests next to the code (`*.test.ts(x)`), e2e in `e2e/`.
- Design: DESIGN.md + approved UI-SPEC. Banned: Inter/Roboto/etc, gradients, glassmorphism, effects libraries, em-dashes in copy, emojis. Admin motion is limited to 160 ms color transitions, the shadcn overlay fade and the dnd transform, all under reduced-motion. GSAP only in `src/components/motion/` (not used here).
- Verification: after each public view, Playwright screenshots at 390/768/1440 in light and dark plus `/impeccable:audit` and `/impeccable:critique`. After each data change, `pnpm test` + an e2e of the affected flow. Axe with no serious/critical issues. WCAG AA.
- Ask before: adding routes outside D-13, touching DESIGN.md/copy/palette (UI-SPEC "Open approvals" 1–5 are pending with Teo), changing data-model/migrations (D-01 approved), new external services.
- Accounts: when `BLOB_READ_WRITE_TOKEN` is missing, STOP before writing code that depends on it, ask Teo with exact steps, and keep the code behind a check with a clear message (never a mock). Update `.env.example` (already has the key).
- Security: no secrets in versioned files; single admin; signup disabled; server-side Zod always; CSP and headers in `next.config.ts`.
- GSD: work goes through GSD commands. `pnpm check` must pass before each closing commit.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Admin auth gate | Frontend Server (AuthGate in `<Suspense>`) | API (`requireSession` in every loader/action/route) | The proxy cookie check is only a UX hint. Real checks live in the DAL |
| Content forms (RHF + Zod, Tiptap, dnd) | Browser (client leaves) | Frontend Server (page loads initial row) | Interactivity only. The data load is server-side and uncached |
| Mutations (save/publish/visible/order/delete) | API (Server Actions in `features/*/actions.ts`) | Database (Drizzle `db.batch`) | Session, Zod and write in one place; `updateTag` is Server-Action-only |
| Draft vs published resolution | Database / data layer (`queries.ts` cores) | Frontend Server (`draftMode()` in cached wrappers) | One overlay function; public never receives `draft` |
| Draft Mode toggle | API (`/api/draft` Route Handler) | — | `enable()`/`disable()` only work in Route Handlers or Server Actions |
| Image upload | Browser (`upload()` direct to Blob) | API (`/api/blob/upload` issues a scoped token) | Bypasses the 4.5 MB function body limit and the 1 MB Server Action limit |
| CV PDF render | API (Server Action, Node runtime) | CDN/Storage (Vercel Blob snapshot) | Rendered once on "Generar CV"; visitors read the snapshot |
| `/cv/{en,es}.pdf` | API (`/api/cv/[lang]` stream) | CDN (Blob) | Keeps the URL and filename stable; latest pointer comes from a cached DB read |
| `/resume{,.es}.json` | API (`/api/resume/[lang]`) | Data layer (cached published reads) | Built live from the same `CvData` builder |
| Contact inbox | Frontend Server (uncached admin loader) | Database | Phase 4 writes rows; phase 3 only reads, marks and deletes |
| Content backup | API (`after(() => exportContent(...))` in actions) | Storage (Blob in prod, `content/` locally) | Must not block or fail the save |

## Standard Stack

### Core (all installed; versions read from `node_modules` on 2026-11-16)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.4.6 | Server Actions, `updateTag`, Draft Mode, Route Handlers, rewrites | Pinned stack [VERIFIED: node_modules/next/package.json] |
| drizzle-orm (neon-http) | 0.45.x | Writes via `db.batch` (no interactive transactions on HTTP) | Existing `createDb` [VERIFIED: src/db/client.ts] |
| better-auth | 1.7.25 | `requireSession()` / `requireSessionForRequest()` | Existing DAL [VERIFIED: src/lib/dal.ts] |
| react-hook-form + @hookform/resolvers + zod | 7.91 / 6.0.2 / 4.6.7 | Forms; the same schema runs in the Server Action | Existing login pattern with `useFormState` [VERIFIED: login-form.tsx] |
| @tiptap/react + starter-kit + pm | 3.32.0 (exact) | Admin rich text. StarterKit 3 already includes Link, Underline, ListKeymap | [VERIFIED: starter-kit package.json deps] |
| @tiptap/static-renderer | 3.32.0 | Server render of Tiptap JSON. **Entry: `@tiptap/static-renderer/pm/react` → `renderToReactElement({ content, extensions })`**. The PM-free entry is `/json/react` → `renderJSONContentToReactElement` (not `/react`) | [VERIFIED: package.json exports + d.ts] |
| @tanstack/react-table | 9.3.1 | Admin list markup: `useTable({ features: tableFeatures({}), columns, data, getRowId })`, `table.FlexRender`, `row.getAllCells()` | [VERIFIED: dist/useTable.d.ts + bundled skill `skills/getting-started/SKILL.md`] |
| @dnd-kit/core + sortable + utilities | 6.3.1 / 10.0.0 / 3.2.2 | Reorder with keyboard sensor and announcements | [VERIFIED: DndContext.d.ts `accessibility.announcements`, `id`] |
| @vercel/blob | 2.8.2 | `upload()` (client), `handleUpload()` (server), `put()` (PDF) | [VERIFIED: dist/client.d.ts] |
| @react-pdf/renderer | 4.9.0 | `renderToBuffer(<Document/>)`, `Font.register`, `Font.registerHyphenationCallback`, `Document language/title/author` | [VERIFIED: index.d.ts; spike rendered in Node 24] |

### Supporting (to install, D-16)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| unpdf (devDependency) | pin exact: **2.1.0** (2026-10-30) or 2.2.1 (released 2026-11-15, one day old) | `extractText(await getDocumentProxy(new Uint8Array(buf)), { mergePages: true })` in the CV-03 test | Only in `*.test.ts`. Ships a serverless PDF.js build; `pdfjs-dist` is an optional peer; `engines.node >=24` (CI uses Node 24) [CITED: context7 /unjs/unpdf; npm view] |
| sonner | 2.0.8 (exact) | Toasts | Install with `pnpm add sonner@2.0.8`. **Do not use `shadcn add sonner`**: it adds `next-themes` [VERIFIED: `shadcn view sonner` dependencies] |
| shadcn components | CLI 4.23.0 | textarea, field, select, native-select, switch, checkbox, dialog, alert-dialog, sheet, table, badge, tooltip, dropdown-menu, progress, kbd, separator, skeleton, empty, **popover** | All depend only on `cn` [VERIFIED: `shadcn view` per item]. `popover` is missing from the UI-SPEC install list but its rich-text link popover needs it |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `draft jsonb` per row | `*_draft` column per field | About 2x the columns on projects, drift-prone, every new field needs two migrations. JSON draft is validated by the same Zod draft schema |
| Stream proxy in `/api/cv/[lang]` | 307 redirect to the Blob URL | A redirect is cheaper, but the browser shows `…blob.vercel-storage.com/resume/en/v3-xyz.pdf` and the download filename is ugly. The stream keeps `/cv/en.pdf` and sets `Content-Disposition` |
| `unpdf` | `pdfjs-dist` direct, `pdf-parse` | `pdfjs-dist` needs worker and font setup in Node. `pdf-parse` is unmaintained [ASSUMED]. D-16 names `unpdf` |
| TanStack Table for small lists | Plain `<table>` | Fixed stack and UI-SPEC require it. Keep it core-only (no sorting/pagination features): order is manual |

**Installation (first task):**
```bash
pnpm add sonner@2.0.8
pnpm add -D unpdf@2.1.0   # exact; record in docs/decisions.md
node_modules/.bin/shadcn add textarea field select native-select switch checkbox dialog alert-dialog sheet table badge tooltip dropdown-menu progress kbd separator skeleton empty popover
# Never pass --overwrite: button/input/label are customized. Review `git diff src/app/globals.css` afterwards.
```

## Package Legitimacy Audit

slopcheck is installed locally, but running it was **denied by the session permission classifier**. Per protocol, every new package below is tagged `[ASSUMED]` and the planner must put a `checkpoint:human-verify` before installing (D-16 already makes Teo the approver).

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| unpdf | npm | first releases years ago; 2.2.1 on 2026-11-15 | not checked | github.com/unjs/unpdf (npm `repository.url`) | not run | [ASSUMED]: approved by D-16 by name; pin 2.1.0 (older than 2 weeks) unless Teo prefers 2.2.1; checkpoint |
| sonner | npm | 2.0.8 on 2026-08-09 | not checked | github.com/emilkowalski/sonner | not run | [ASSUMED]: approved by D-16 by name; checkpoint |
| shadcn registry items | shadcn @shadcn | official | n/a | ui.shadcn.com | n/a | Approved (official registry, D-16); no npm deps beyond `cn` |

**Packages removed due to slopcheck [SLOP] verdict:** none (not run)
**Packages flagged as suspicious [SUS]:** none (not run). `npm view … scripts.postinstall` returned empty for unpdf and sonner.

## Architecture Patterns

### System Architecture Diagram

```
Teo's browser (/admin, es)
  │  RHF form (Zod draft/publish schemas)  ── Cmd+S / buttons
  ▼
Server Action (features/<e>/actions.ts)
  requireActionSession() ──x──> { ok:false, error:'session' } (form keeps data)
  │ zod.safeParse (same schema as client)
  ▼
Decision: row.status?
  ├─ 'draft' (never published) ── write columns directly ─────────────┐
  └─ 'published' ── Save:   write row.draft = payload (columns untouched)
                   Publish: validate publish schema → db.batch[update columns, draft=null, relations]
                   Discard: draft = null
  ▼                                                                   │
updateTag(affected public tags)  ← only on publish / visible / order / delete (never on draft save of a published row)
after(() => exportContent({ tables: [affected] }))  → content/*.json (local) | Blob backup (prod, random suffix)

Public visitor  ──> /[locale]/… ──> cached wrapper ('use cache' + cacheTag)
                                      draftMode().isEnabled ?
                                        no  → stripDraft(columns, published+visible only)
                                        yes → applyDraft(columns ⊕ draft, all rows)  (re-executes every request)
Teo "Previsualizar" ─> /api/draft?kind=project&id=… (session) ─> draft.enable() ─> 307 to server-built localized path
                                                     DraftBanner (layout) ─> POST /api/draft (disable) ─> back to path

Teo "Generar CV" ─> Server Action ─> buildCvData(locale, published only, no draftMode) ×2
                    ─> renderToBuffer(<CvDocument/>) ×2 ─> put(resume/<l>/v<n>.pdf) ×2
                    ─> db.batch insert resume_versions ×2 ─> updateTag('resume')
Visitor /cv/en.pdf ─(rewrite)→ /api/cv/en ─> getLatestResume('en') [cached, tag resume] ─> fetch Blob ─> stream PDF
Visitor /resume.json ─(rewrite)→ /api/resume/en ─> buildCvData('en') ─> toJsonResume ─> Zod parse ─> JSON
Image: browser upload() ─> POST /api/blob/upload (session, path+type+size policy) ─> token ─> PUT vercel.com/api/blob ─> url ─> form field ─> Server Action save
```

### Recommended Project Structure
```
src/
├── app/admin/(panel)/
│   ├── layout.tsx                 # Suspense + AuthGate (+ NavigationBlockerProvider, Toaster, AdminNav)
│   ├── page.tsx                   # Panel checklist (calls requireSession: WR-01)
│   ├── ajustes/page.tsx
│   ├── proyectos/{page.tsx, nuevo/page.tsx, [id]/page.tsx}
│   ├── experiencia/… skills/… educacion/…   # same shape
│   ├── cv/page.tsx
│   └── mensajes/page.tsx
├── app/api/{draft,blob/upload,cv/[lang],resume/[lang]}/route.ts
├── components/admin/              # AdminNav, AdminPageHeader, FormSection, SectionIndex, BilingualField,
│                                  # BilingualRepeater, RichTextField, ImageUploader, SortableList,
│                                  # DeleteConfirm, UnsavedGuard, NavigationBlocker, AdminLink, EnvMissingNotice
├── components/site/draft-banner.tsx
├── features/<entity>/{schema,queries,admin-queries,actions,validation}.ts + components/<Entity>Form.tsx
├── features/resume/{cv-data.ts, json-resume.ts, json-resume-schema.ts, pdf/{fonts.ts, cv-document.tsx}, actions.ts}
├── features/contact/{admin-queries.ts, actions.ts}
└── lib/{draft.ts (applyDraft/stripDraft), tiptap-extensions.ts, rich-text.tsx, zod-jitless.ts, blob.ts (hasBlobToken)}
```

### Pattern 1: D-01 via `draft jsonb` (recommended mechanism)
**What:** Add `draft: jsonb('draft').$type<…Draft>()` (nullable) to `projects`, `experiences`, `skills`, `education`, `site_settings`. Add `status` (default `'published'`) to `site_settings` (D-02). Migration `0002` via `pnpm db:generate`; `vercel.json` already runs `db:migrate` before build.
**Rules (document in `docs/data-model.md`):**
- `status='draft'` (never published): Save writes the columns. `draft` stays null. NOT NULL text columns accept `''` in the draft schema.
- `status='published'`: Save writes `draft = <full editable payload incl. relation ids>`. Publish validates the **publish schema** over `{...columns, ...draft}`, then `db.batch([update columns + draft=null + status, delete relations, insert relations])`. Discard sets `draft = null`.
- `visible`, `order` (and `featured`, see Open Q1) are structural: written to the columns immediately, never into `draft`.
- Badge "Cambios sin publicar" = `status==='published' && draft !== null`.
- Public cores **strip** `draft` from every returned row. Draft-mode cores return `applyDraft(row)` (columns overlaid by draft, `draft` removed).

```ts
// src/lib/draft.ts
export function stripDraft<T extends { draft?: unknown }>(row: T): Omit<T, "draft"> {
  const { draft: _d, ...rest } = row;
  return rest;
}
export function applyDraft<T extends { draft?: unknown }>(row: T): Omit<T, "draft"> {
  const { draft, ...rest } = row;
  return draft && typeof draft === "object" ? { ...rest, ...(draft as Partial<T>) } : rest;
}
```

### Pattern 2: Server Action shape + tag map
```ts
"use server";
// features/projects/actions.ts
export async function saveProjectDraft(id: string | null, input: unknown): Promise<ActionResult> {
  const session = await requireActionSession();            // returns null instead of redirect
  if (!session) return { ok: false, error: "session" };
  const parsed = projectDraftSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  // …branch on row.status (Pattern 1); reject slug change if published (ADMN-09)
  // never-published save → no public tag; published-draft save → no public tag
  after(() => exportContent({ db, tables: ["projects", "project_skills"] }));
  return { ok: true, savedAt: new Date().toISOString() };
}
```
| Action | `updateTag` |
|--------|-------------|
| project publish / visible / featured / delete | `projects`, `project(slug)`, `resume` (only if the JSON route caches via that tag; see note) |
| project reorder | `projects` |
| experience publish/visible/order/delete | `experience` |
| skill publish/visible/order/delete | `skills`, `projects` (project pages show skills) |
| education publish/visible/order/delete | **new** `tags.education` (add to `cache-tags.ts` + data-model.md) |
| settings publish | `settings` |
| CV generate | `resume` |
Note: if `/api/resume/[lang]` composes the per-entity cached queries, it is invalidated by their tags automatically, so no extra `resume` tag is needed on content publishes. `updateTag` throws outside Server Actions [VERIFIED: updateTag.md].

### Pattern 3: Draft Mode with Cache Components
```ts
// app/api/draft/route.ts
export async function GET(request: NextRequest) {
  const auth = await requireSessionForRequest(request);
  if (!auth.ok) return auth.response;                       // 401, never public
  const kind = request.nextUrl.searchParams.get("kind");    // 'project' | 'home'
  const locale = request.nextUrl.searchParams.get("locale") === "es" ? "es" : "en";
  // look up the row by id from the DB; build the path server-side (no open redirect)
  const path = kind === "project"
    ? getPathname({ locale, href: { pathname: "/projects/[slug]", params: { slug: row.slug } } })
    : getPathname({ locale, href: "/" });
  (await draftMode()).enable();
  redirect(path);
}
export async function POST(request: NextRequest) {           // exit, from a <form method="post">
  (await draftMode()).disable();
  const back = String((await request.formData()).get("path") ?? "/");
  redirect(back.startsWith("/") && !back.startsWith("//") ? back : "/");
}
```
- `isEnabled` is readable inside `'use cache'`. Cached scopes re-execute and are not stored while Draft Mode is on. During prerender `draftMode()` resolves to disabled without postponing, so `DraftBanner` can `await draftMode()` in `[locale]/layout.tsx` [VERIFIED: draft-mode.md, use-cache.md, `next/dist/server/request/draft-mode.js` cases `prerender` / `cache`].
- `draftMode()` inside `generateStaticParams` **throws** (`build-time-generator` case). Keep `getPublishedSlugsCore` there.
- Exit must be a form (POST), not a `<Link>`: prefetch would clear the cookie [CITED: draft-mode.md].
- Cookie `__prerender_bypass` is `httpOnly`, `secure` and `SameSite=None` outside dev. It works on `http://localhost` in Chromium (Playwright project is chromium only) [VERIFIED: draft-mode-provider.js].
- `getSiteSettings` must also become draft-aware for the home preview (today it ignores `draftMode()`).

### Pattern 4: Unsaved guard + Cmd+S (ADMN-10)
- `NavigationBlockerProvider` (client) in the panel layout. All admin nav links render through `AdminLink` (`next/link` with `onNavigate={(e) => { if (blocked) { e.preventDefault(); openDialog(href) } }}`). On confirm, call `reset()` and then `router.push(href)` [CITED: link.md "Blocking navigation"].
- `beforeunload` while dirty (tab close/reload). **Browser back/forward is not intercepted** (no App Router API). Accept and document this.
- Cmd/Ctrl+S: `window.addEventListener('keydown', h, { capture: true })` in a `useEffect`. Check `(e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's'`, call `preventDefault`, ignore while saving. StarterKit binds no `Mod-s`, so it also fires inside the editor.
- Dirty state: `useFormState({ control }).isDirty` (Compiler-safe, existing pattern). After a successful save, call `reset(savedValues)`.

### Pattern 5: dnd-kit keyboard sortable inside a TanStack v9 table
```tsx
const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
<DndContext id={useId()} sensors={sensors} collisionDetection={closestCenter}
  accessibility={{ announcements: esAnnouncements, screenReaderInstructions: { draggable: t("dnd.instructions") } }}
  onDragEnd={({ active, over }) => { if (over && active.id !== over.id) { const next = arrayMove(rows, from, to); setRows(next); void saveOrder(next.map(r => r.id)).then(r => { if (!r.ok) setRows(prev) }) } }}>
  <SortableContext items={rows.map(r => r.id)} strategy={verticalListSortingStrategy}>…<SortableRow/>…</SortableContext>
</DndContext>
// row: const { setNodeRef, attributes, listeners, transform, transition } = useSortable({ id }); style={{ transform: CSS.Transform.toString(transform), transition }}
// attributes+listeners go on the handle <button aria-label="Mover {nombre}">, not the <tr>
```
- `useId()` for `DndContext id` avoids hydration mismatches of `DndDescribedBy-N` [ASSUMED: known dnd-kit SSR issue; `id` prop verified in d.ts].
- `@dnd-kit/modifiers` (vertical-axis lock) is not installed. Do without it, or ask first.
- The order action takes `string[]` of ids and writes `order = index` in one `db.batch` of updates. Skills reorder only within a category.
- TanStack: `const features = tableFeatures({})` at module scope, `getRowId: (r) => r.id`, `row.getAllCells()`. With core-only features, the visibility-aware APIs do not exist [CITED: bundled getting-started SKILL.md].

### Pattern 6: Tiptap editor + server renderer, one extension list
```ts
// src/lib/tiptap-extensions.ts (no 'use client', no @tiptap/react import)
import StarterKit from "@tiptap/starter-kit";
export const richTextExtensions = [StarterKit.configure({
  heading: { levels: [3] }, codeBlock: false, horizontalRule: false, strike: false, underline: false,
  link: { openOnClick: false, autolink: true, protocols: ["https", "mailto"], defaultProtocol: "https" },
})];
// editor (client): useEditor({ extensions: richTextExtensions, content, immediatelyRender: false,
//   shouldRerenderOnTransaction: false, onUpdate: ({ editor }) => field.onChange(editor.getJSON()) })
//   toolbar active state via useEditorState({ editor, selector })
// server: import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
//   renderToReactElement({ content: doc, extensions: richTextExtensions })
```
Validate stored JSON in the action with a recursive Zod schema: allowlisted node and mark types, and `link.href` must match `^(https://|mailto:)` (Pitfall 7). Load the editor with `next/dynamic` (`ssr: false` is fine inside a client component) so ProseMirror only ships on the form routes [CITED: vercel-react-best-practices `bundle-dynamic-imports`].

### Pattern 7: Blob client upload
```ts
// app/api/blob/upload/route.ts
export async function POST(request: Request) {
  const auth = await requireSessionForRequest(request);
  if (!auth.ok) return auth.response;
  if (!process.env.BLOB_READ_WRITE_TOKEN) return Response.json({ error: "missing BLOB_READ_WRITE_TOKEN" }, { status: 503 });
  const body = (await request.json()) as HandleUploadBody;
  const result = await handleUpload({ request, body, onBeforeGenerateToken: async (pathname) => {
    if (!/^projects\/[0-9a-f-]{36}\/[a-z0-9._-]+\.(avif|webp|jpe?g|png)$/.test(pathname)) throw new Error("invalid pathname");
    return { allowedContentTypes: ["image/avif","image/webp","image/jpeg","image/png"], maximumSizeInBytes: 8 * 1024 * 1024, addRandomSuffix: true };
  } /* no onUploadCompleted: Vercel cannot call localhost; the client saves blob.url via the Server Action */ });
  return Response.json(result);
}
// client: const blob = await upload(`projects/${id}/${safeName}`, file, { access: "public", handleUploadUrl: "/api/blob/upload", onUploadProgress: ({ percentage }) => setPct(percentage) });
```
[VERIFIED: `HandleUploadOptions`, `onUploadProgress` in client.d.ts]. Client checks before upload: type, size ≤ 8 MB, and dimensions via `createImageBitmap(file)` for the 16:10 warning (tolerance ±1%). No re-encoding (no new dep). `next/image` optimizes on delivery in phase 4.

### Pattern 8: CV pipeline
- `buildCvData(locale)`: uses **cores with `includeDrafts: false`**, never the draft-aware wrappers (Pitfall 3). Returns a plain serializable object. Feeds both `CvDocument` and `toJsonResume`.
- `pdf/fonts.ts`: register once (module-level guard). Paths `path.join(process.cwd(), 'assets/fonts-pdf', …)`; exactly the 4 files in UI-SPEC; `Font.registerHyphenationCallback((w) => [w])`.
- `pdf/cv-document.tsx`: pure components, **no hooks**. Add `"use no memo"` at the top of the file so React Compiler never inserts `useMemoCache` into components that react-pdf's own React copy calls (Pitfall 4). Use `<Document language={locale} title author>` and `<Page size="A4" wrap>`.
- Action `generateCv()`: session → token check → `n = max(version)+1` → `Promise.all` render en/es → `put('resume/<l>/v<n>.pdf', buf, { access:'public', contentType:'application/pdf', addRandomSuffix: true })` → `db.batch([insert en, insert es])` → `updateTag(tags.resume)`. If anything before the insert fails, no row is written ("No se publicó ninguna versión nueva").
- `next.config.ts`:
```ts
outputFileTracingIncludes: { "/admin/cv": ["./assets/fonts-pdf/*.ttf"], "/admin/**": ["./assets/fonts-pdf/*.ttf"] },
async rewrites() { return { beforeFiles: [
  { source: "/cv/en.pdf", destination: "/api/cv/en" }, { source: "/cv/es.pdf", destination: "/api/cv/es" },
  { source: "/resume.json", destination: "/api/resume/en" }, { source: "/resume.es.json", destination: "/api/resume/es" },
] }; },
```
Use literal sources (no path-to-regexp dot handling). `beforeFiles` runs before `[locale]` dynamic matching [CITED: rewrites.md order]. The proxy matcher already skips dotted paths and `/api`.
- `/api/cv/[lang]` GET: validate `lang`; `getLatestResume(lang)` (`'use cache'` + `cacheTag(tags.resume)`); 404 when none; `const up = await fetch(row.pdfUrl)`; `return new Response(up.body, { headers: { "Content-Type": "application/pdf", "Content-Disposition": 'inline; filename="mateo-jaramillo-cv-en.pdf"', "Cache-Control": "public, max-age=0, must-revalidate", ...(len && { "Content-Length": len }) } })`. Never return a Node `Buffer` as the body (Pitfall 5).
- `/api/resume/[lang]`: GET route handlers follow the page prerender model under Cache Components. With cached data plus `generateStaticParams` returning `[{lang:'en'},{lang:'es'}]`, it is prerendered and revalidated by tags [CITED: 15-route-handlers.md "With Cache Components"]. `use cache` cannot go on `GET` itself; use a helper.

### Anti-Patterns to Avoid
- **Selecting whole rows (with `draft`) into public pages.** Drafts leak into the RSC payload if any client component gets the row. Always `stripDraft` in public cores.
- **`redirect()` from `requireSession()` inside a form Server Action.** It navigates away and loses unsaved edits. Return `{ error: 'session' }` (UI-SPEC "Session expired" copy).
- **`shadcn add sonner`.** It installs `next-themes` (banned).
- **`shadcn add … --overwrite`.** It replaces the customized `button`/`input`/`label`.
- **Reading `draftMode()` from the CV/JSON builders.** Teo's draft cookie would leak drafts into the public CV.
- **`onUploadCompleted` for persistence.** It does not fire on localhost. Persist `blob.url` through the entity action.
- **`<Link>` for Draft Mode exit.** Prefetch clears the cookie.
- **`unstable_cache`, `revalidateTag` without profile, `middleware.ts`, `dynamicParams=false`, `db.transaction()` on neon-http:** see `.claude/CLAUDE.md` "What NOT to Use".

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Signed direct-to-storage uploads | Own presign/multipart | `handleUpload` + `upload()` | Token scoping, progress, retries, size/type policy built in |
| Keyboard drag and drop + SR announcements | Custom key handlers | dnd-kit `KeyboardSensor` + `accessibility` | Focus restore, live region, collision handled |
| Rich text JSON to HTML on server | Hand-written JSON walker | `@tiptap/static-renderer/pm/react` | Same schema as editor; marks/nesting correct |
| PDF layout and text layer | HTML-to-PDF, headless Chrome | `@react-pdf/renderer` (pinned) | Real text layer (ToUnicode verified), no Chromium in functions |
| PDF text extraction in tests | Regex over PDF bytes | `unpdf` `extractText` | Font subsets use CID glyphs, so raw bytes don't contain "á" |
| Navigation blocking | Monkey-patching `history` | `Link onNavigate` + context | Documented Next 16 API |
| Draft preview bypass | Custom preview cookie + uncached branches | `draftMode()` | Bypasses every `'use cache'` layer automatically |

**Key insight:** Correctness here comes from cache and auth boundaries. Each custom shortcut skips one of them: a cookie, a cache scope, or a session check.

## Common Pitfalls

### Pitfall 1: Phase 2 carry-overs destroy admin content
**What goes wrong:** `pnpm seed --force` upserts whole rows (CR-01) and nothing blocks running seed/restore against Neon `main` (CR-02). One command after D-09 erases Teo's session.
**How to avoid:** First plan. Make `--force` never overwrite non-null admin-edited fields (or refuse when `updated_at > created_at`). Refuse to seed or restore when `describeDbTarget` says production/main unless an explicit `--i-know-this-is-production` flag is passed. Every admin page and loader calls `requireSession()` (WR-01).
**Warning signs:** `02-REVIEW-DISPOSITION.md` rows still "open".

### Pitfall 2: Drafts leak through backups and the public repo (WR-06)
**What goes wrong:** With D-01, `draft` and the never-published rows (Inventario/Finanzas, D-10) land in `content/*.json`, which is committed to a **public** GitHub repo, and in Blob at `backup/<timestamp>/…` on a public store whose host id appears in every image URL.
**How to avoid:** Blob backups use `addRandomSuffix: true` (unguessable; `list()` needs the token). For `content/`, see Open Q2 (needs a Teo decision).

### Pitfall 3: Teo's Draft Mode cookie contaminates the CV or JSON Resume
**What goes wrong:** Teo previews a draft, then clicks "Generar CV". Server Actions see `draftMode().isEnabled === true`, so `getProjects()` returns drafts and they get frozen into the public PDF.
**How to avoid:** `buildCvData` calls cores with `{ includeDrafts: false }`. Add a unit test that mocks a draft row and asserts it is absent.

### Pitfall 4: react-pdf inside the Next server layer
**What goes wrong:** React error #31 or "renderToBuffer is not a function" (reports exist for Next 15 on other hosts), missing fonts on Vercel (not traced), or React Compiler inserting hooks into PDF components.
**Why:** react-pdf is externalized (default `serverExternalPackages` includes it [VERIFIED: server-external-packages.jsonc]) and runs its own reconciler with `node_modules/react`. Element symbols match, so plain elements are fine. Hooks across the two React copies are not.
**How to avoid:** Spike day 5: a Server Action on a Vercel Preview renders both locales, uploads, and the downloaded file passes the unpdf test. Use pure components plus `"use no memo"`, fonts via `process.cwd()` + `outputFileTracingIncludes`, and named imports only (`import { renderToBuffer } from '@react-pdf/renderer'`). In the spike, `pdf.default` did not expose `renderToBuffer`.
**Fallback order if the spike fails:** (a) move the render into the `/api/cv/[lang]` POST Route Handler (session-gated; `revalidateTag('resume', 'max')` instead of `updateTag`); (b) ask Teo about rendering with `pdfkit` directly (already a transitive dep of react-pdf; would be a new direct dep).

### Pitfall 5: Buffer response bodies corrupted on Vercel
**What goes wrong:** A Vercel community report (Next 16.2.10, Node 24) shows a `Buffer` body returned from a route handler re-encoded as UTF-8 (`EF BF BD`), so binaries break in production only [CITED: community.vercel.com/t/46721].
**How to avoid:** Stream `upstream.body` (a web ReadableStream) from `/api/cv/[lang]`. If a buffer is ever returned, wrap it as `new Uint8Array(buf)` with `Content-Length`. The e2e/manual gate compares `Content-Length` and the `%PDF-` magic on the Preview.

### Pitfall 6: Activity keeps admin forms alive after navigation
**What goes wrong:** With Cache Components, Next hides up to 3 previous routes with `<Activity>` instead of unmounting [CITED: preserving-ui-state.md]. A form left via "Salir sin guardar" comes back still dirty with stale values. Playwright CSS locators can match hidden copies.
**How to avoid:** Call `reset()` before navigating on confirmed leave. Key forms by `row.updatedAt`. Register listeners in effects (they are cleaned up while hidden). In e2e, use `getByRole`/`getByLabel` only.

### Pitfall 7: Stored XSS through rich text links or message bodies
**What goes wrong:** Tiptap JSON with `href: "javascript:…"` rendered by the static renderer on public pages. Contact messages rendered as HTML.
**How to avoid:** Validate with Zod in the action (node/mark allowlist, href scheme `https:`/`mailto:`), and keep the Link `protocols` restricted in the editor. Render messages as text with `whitespace-pre-wrap`, and build the `mailto:` with `encodeURIComponent`.

### Pitfall 8: e2e and local saves dirty the git tree
**What goes wrong:** Off Vercel, `exportContent()` writes `content/*.json` into the repo on every admin save, including during `pnpm test:e2e`.
**How to avoid:** Run the export through `after()` and pass only the affected `tables`. Read `dir` from an env var (`CONTENT_EXPORT_DIR`), set to a temp dir in Playwright's `webServer.env`.

### Pitfall 9: Order of session vs Zod in actions
**What goes wrong:** Validating before the session check gives unauthenticated callers schema feedback and costs work. Server Actions are public POST endpoints [CITED: vercel-react-best-practices `server-auth-actions`].
**How to avoid:** Session first in every action and route (`requireActionSession` → Zod → write). Add a unit test per action file that a call with no session returns `{ error: 'session' }` and writes nothing (pattern exists in `src/app/admin/(panel)/actions.test.ts`).

### Pitfall 10: Zod JIT probe and CSP in new client forms
**What goes wrong:** Only the login form imports `zod-jitless`. New admin forms would trigger Zod's `new Function` probe, which the CSP reports.
**How to avoid:** Move it to `src/lib/zod-jitless.ts` and import it first in every client form module (or once in a client provider in the panel layout).

### Pitfall 11: CSP and images for Blob
**What goes wrong:** The Report-Only CSP has `img-src 'self' blob: data:` and `connect-src 'self'`. Blob images (`*.public.blob.vercel-storage.com`) and client uploads (`https://vercel.com/api/blob` [VERIFIED: @vercel/blob chunk]) would be violations, and `next/image` needs `images.remotePatterns`.
**How to avoid:** Add both hosts to the CSP and add a remotePattern for `*.public.blob.vercel-storage.com` (narrow to the store host once the token arrives).

### Pitfall 12: Unicode normalization in the extraction test
**What goes wrong:** Extracted "á" can come back decomposed (`a` + U+0301), or words come back split by kerning/spacing, so `includes('Medellín')` fails flakily.
**How to avoid:** `text.normalize('NFC')`, collapse whitespace, then assert each of `á é í ó ú ñ` and 2–3 known words from the fixture. Also assert `totalPages <= 2`.

### Pitfall 13: Blob path collisions on retry
**What goes wrong:** v2 defaults to `allowOverwrite: false`. If the DB insert fails after `put`, a retry with the same `v<n>` path throws.
**How to avoid:** `addRandomSuffix: true` keeps the versioned prefix (`resume/en/v3-<rand>.pdf`). It never overwrites, consistent with D-08's intent. The exact filename differs slightly from D-08's literal `v<n>.pdf`; note it in decisions.md.

## Code Examples

### CV-03 extraction test (vitest, node env)
```ts
// src/features/resume/pdf/cv-document.test.tsx
import { renderToBuffer } from "@react-pdf/renderer";
import { extractText, getDocumentProxy } from "unpdf";
import { CvDocument } from "./cv-document";
import { cvFixture } from "../cv-fixture"; // built from committed content/*.json shapes, not invented copy

for (const locale of ["en", "es"] as const) {
  test(`CV ${locale} keeps Spanish characters in the text layer`, async () => {
    const buf = await renderToBuffer(<CvDocument data={cvFixture(locale)} locale={locale} />);
    const pdf = await getDocumentProxy(new Uint8Array(buf));
    const { totalPages, text } = await extractText(pdf, { mergePages: true });
    const t = text.normalize("NFC").replace(/\s+/g, " ");
    for (const ch of ["á", "é", "í", "ó", "ú", "ñ"]) expect(t).toContain(ch);
    expect(t).toContain("Medellín");
    expect(totalPages).toBeLessThanOrEqual(2);
  });
}
```
[CITED: context7 /unjs/unpdf extractText; spike confirmed renderToBuffer + fonts]. The fixture must contain every one of á é í ó ú ñ through real seeded strings (e.g., "Medellín", "Educación", "Español"). If one is missing in real data, add it through a fixture-only label from `messages` (section headings "Educación", "Perfil"), never invented content.

### JSON Resume mapping (shape verified against resume-schema)
```ts
// basics{name,label,email,url,summary,location{city,countryCode,region},profiles[{network,url}]}
// work[{name,position,location,startDate,endDate,highlights}]  education[{institution,area,studyType,startDate,endDate}]
// skills[{name,level,keywords}]  languages[{language,fluency}]  projects[{name,description,url,highlights,keywords,startDate,endDate}]
// meta{canonical,version,lastModified}
const iso8601 = /^([1-2][0-9]{3}-[0-1][0-9]-[0-3][0-9]|[1-2][0-9]{3}-[0-1][0-9]|[1-2][0-9]{3})$/; // exact pattern from schema.json
// experience dates are stored as the 1st of the month → emit "YYYY-MM"; endDate null → omit
```
[CITED: raw.githubusercontent.com/jsonresume/resume-schema/master/schema.json; `additionalProperties: true` everywhere, `$schema` is draft-07]. Validate the output with a Zod mirror in a unit test and inside the route (fail closed with 500 + log).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useBlocker`-style hacks for unsaved changes | `Link onNavigate` + `preventDefault()` | Next 15.3+ (documented in 16.4 link.md) | Clean in-app blocking; back button still not covered |
| Unmounting pages on navigation | Activity preserves up to 3 routes | Cache Components (16.x) | Form state survives; reset deliberately |
| GET route handlers always dynamic | Same prerender model as pages | Cache Components | Cached JSON Resume can be static + tag-revalidated |
| `revalidateTag(tag)` | `updateTag(tag)` in actions / `revalidateTag(tag, 'max')` elsewhere | Next 16 | Read-your-writes in the admin |
| shadcn DataTable (TanStack v8) | v9 `useTable` + `tableFeatures` + `table.FlexRender` | TanStack Table 9 | Recipes must be translated |

**Deprecated/outdated:** `@tiptap/static-renderer/react` does not exist in 3.32 (the entries are `/pm/react` and `/json/react`; `.claude/CLAUDE.md` §6 names a non-existent path). Blob `onUploadCompleted` is not usable locally.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `visible`, `order` and `featured` bypass draft/publish and apply live | Pattern 1 | If Teo wants them drafted, the actions move them into `draft`; small change |
| A2 | react-pdf `renderToBuffer` works from a Server Action on Vercel with traced fonts | Pattern 8 / Pitfall 4 | CV plan falls back to a Route Handler or pdfkit; spike first |
| A3 | `DndContext id={useId()}` prevents hydration mismatch | Pattern 5 | Cosmetic console warning only |
| A4 | `neon-http` `db.batch` is atomic (single transaction) | Pattern 1 | Partial publish on failure; then add a compensating write or use the WebSocket Pool for publish |
| A5 | unpdf/sonner are legitimate (slopcheck not run) | Package audit | Supply-chain risk; checkpoint before install |
| A6 | Turbopack's React Compiler may compile server-layer PDF components (webpack path skips server) | Pitfall 4 | `"use no memo"` is harmless if not needed |
| A7 | `pdf-parse` unmaintained | Alternatives | None (not chosen) |
| A8 | Minimum to create a never-published row is one title + slug (NOT NULL columns get `''`) | Pattern 1 | UX detail; planner confirms with UI-SPEC "Guardar borrador accepts incomplete content" |

## Open Questions

1. **Do `featured` (and the inline list switches) go through draft/publish?**
   - What we know: UI-SPEC puts the Visible and Destacado switches in the list and assumes they apply live. D-01 covers content edits. Success criterion 2 says visible removes from the site directly.
   - Recommendation: treat `visible`, `order` and `featured` as structural/live. Log the decision in decisions.md (the UI-SPEC "unresolved" row).
2. **What happens to committed `content/*.json` once drafts exist (WR-06)?**
   - What we know: the repo is public. Phase 2 decided to commit `content/`. D-10 keeps Inventario/Finanzas as drafts, and D-14's recovery relies on the export.
   - Options: (a) gitignore `content/` from now on and rely on Blob backups (random-suffix paths) plus a local untracked copy; (b) keep committing, accept that drafts are public. (a) changes a phase 2 decision, so **ask Teo** (high relevance: privacy of unpublished client content).
3. **Cover image source.**
   - Recommendation: `cover_image` stores the URL of one `media` item (so it always has alt en/es). Publish fails if `cover_image` is not in `media`.
4. **unpdf version: 2.1.0 vs 2.2.1.**
   - Recommendation: 2.1.0 (older than 2 weeks, same API). Teo confirms at the install checkpoint.
5. **CV PDF filename/path vs D-08's literal `v<n>.pdf`.** With `addRandomSuffix` the path is `resume/<l>/v<n>-<rand>.pdf`. Recommend accepting and recording it; the public URL stays `/cv/<l>.pdf`.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | build, vitest, unpdf (`>=24`) | ✓ | 24.22.1 (CI: 24) | — |
| pnpm | installs | ✓ | 12.16.1 | — |
| Playwright Chromium | e2e, axe, screenshots | ✓ | chromium-1248 cached | — |
| Vercel CLI | preview deploy for the PDF spike | ✓ | `/opt/homebrew/bin/vercel` | git push → Preview |
| Neon `dev` (DATABASE_URL) | admin, e2e, build | assumed ✓ (phase 2 green; `.env.local` not readable by policy) | — | — |
| `BLOB_READ_WRITE_TOKEN` | uploads, CV generation, prod backups | ✗ (requested at phase start, D-17) | — | Code behind `hasBlobToken()` + `EnvMissingNotice`; no mock |
| slopcheck | package audit | installed but blocked by session permissions | — | `[ASSUMED]` + human checkpoint |
| PDF text tools (pdftotext etc.) | — | ✗ | — | unpdf in vitest |

**Missing dependencies with no fallback:** `BLOB_READ_WRITE_TOKEN` blocks ADMN-08, CV-01/02/04 verification and the D-09 session. Request it in the first plan with these steps: Vercel → Storage → Create Blob store, **Public** access, connect to the project for Production and Preview, then copy `BLOB_READ_WRITE_TOKEN` to `.env.local`.

## Security Domain

### Applicable ASVS Categories (Level 1)

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes (existing) | Better Auth, signup disabled; no change |
| V3 Session Management | yes | DB sessions, no cookieCache; `requireActionSession` returns an error instead of redirecting in actions |
| V4 Access Control | yes | `requireSession()` in every admin page/loader (WR-01) and action; `requireSessionForRequest` in `/api/blob/upload`, `/api/draft` GET, any admin POST |
| V5 Input Validation | yes | Zod 4 (shared schemas); recursive Tiptap JSON allowlist; URL scheme checks; slug regex `^[a-z0-9]+(-[a-z0-9]+)*$` |
| V6 Cryptography | no new | Draft cookie value generated per build by Next |
| V12 Files and Resources | yes | Blob token scoped by pathname regex, content types, 8 MB max, random suffix; uploads never through functions |
| V13 API | yes | Route handlers validate `lang`; JSON Resume returns only published data |
| V14 Config | yes | CSP hosts for Blob; `X-Robots-Tag` noindex on `/admin` (exists); no secrets in repo |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Direct invocation of Server Actions without a session | Elevation | Session check as the first line; unit test per action |
| Open redirect via `/api/draft` | Spoofing | Build the target path from the DB row with `getPathname`; exit accepts only `/`-relative paths |
| Stored XSS via rich text `javascript:` links | Tampering | Zod href allowlist + editor `protocols` |
| Draft content disclosure (RSC payload, backups, public repo, CV) | Info disclosure | `stripDraft` in public cores; `includeDrafts:false` in CV builder; random-suffix backups; Open Q2 |
| Arbitrary file upload / overwrite | Tampering | `onBeforeGenerateToken` path regex + types + size + `addRandomSuffix` |
| CSRF on route handlers | Tampering | Better Auth cookie SameSite=Lax blocks cross-site POST; Server Actions have Next's origin check [ASSUMED] |
| Destructive seed against production | Tampering/DoS | CR-01/CR-02 guards |

## Sources

### Primary (HIGH confidence)
- `node_modules/next/dist/docs/01-app/02-guides/draft-mode.md`, `03-api-reference/04-functions/draft-mode.md`, `01-directives/use-cache.md` (Draft Mode + `'use cache'`)
- `node_modules/next/dist/server/request/draft-mode.js`, `server/async-storage/draft-mode-provider.js` (prerender/cache behaviour, cookie attributes)
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/updateTag.md`, `after.md`; `01-getting-started/15-route-handlers.md`; `02-guides/migrating-to-cache-components.md` (route handlers)
- `node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md` (`onNavigate`, "Blocking navigation")
- `node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md` (Activity)
- `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/{output,rewrites}.md`; `next/dist/lib/server-external-packages.jsonc`
- Installed type definitions: `@vercel/blob/dist/client.d.ts`, `@tiptap/static-renderer` exports + `dist/pm/react/index.d.ts`, `@tanstack/react-table/dist/useTable.d.ts` + bundled `skills/`, `@dnd-kit/core` `DndContext.d.ts`, `@react-pdf/renderer/index.d.ts`, `@react-pdf/font` d.ts
- Spike: `/private/tmp/claude-501/-Users-mateojaramillo-projects-mateojaras-dev/46d4847b-d5ec-408c-b46e-ac07b85a736f/scratchpad/spike-pdf.mjs` (Node 24, repo fonts, ToUnicode/FontFile2/Lang present)
- `shadcn view <item>` for each component (dependencies)
- npm registry (`npm view unpdf|sonner|pdfjs-dist`, 2026-11-16)

### Secondary (MEDIUM confidence)
- Context7 `/unjs/unpdf` (extractText, getDocumentProxy)
- Context7 `/diegomura/react-pdf` (Font.register, registerHyphenationCallback, renderToBuffer)
- https://react-pdf.org/compatibility (React 19 since 4.1.0; App Router)
- https://raw.githubusercontent.com/jsonresume/resume-schema/master/schema.json (fields, iso8601 pattern)
- `.agents/skills/vercel-react-best-practices/rules/server-auth-actions.md`, `bundle-dynamic-imports.md`

### Tertiary (LOW confidence)
- https://community.vercel.com/t/node-buffer-response-body-re-encoded-as-utf-8-on-vercel-functions-high-bytes-become-ef-bf-bd/46721 (Buffer body re-encoding; single report)
- https://station.railway.com/questions/pdf-generation-fails-with-react-pdf-ren-3d95fbce (React #31 with renderToBuffer on Next 15; no fix confirmed)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH. Everything is installed; APIs were read from the installed d.ts files and bundled docs.
- Architecture: HIGH for Draft Mode, tags and uploads (source-verified). MEDIUM for the D-01 draft-jsonb design (sound, but my recommendation, not an external standard).
- Pitfalls: HIGH for the carry-overs, sonner/next-themes, Activity and draft cookies (verified). MEDIUM for react-pdf on Vercel and the Buffer re-encoding (single reports; spike resolves them).

**Research date:** 2026-11-16
**Valid until:** 2026-12-16 (unpdf is releasing weekly; re-check its version at install)
