# Phase 4: Sitio público - Research

**Researched:** 2026-11-22
**Domain:** Next.js 16.4 public site under Cache Components (route `<Activity>`), next-intl localized routing, GSAP/Motion within a fixed motion budget, Server Action contact flow (Upstash + Resend), metadata routes (OG/sitemap/robots/hreflang)
**Confidence:** HIGH for framework behavior (bundled Next 16.4.6 docs + installed sources), MEDIUM for LCP/motion interaction (needs measurement)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Caso de estudio
- **D-01:** La galería de `03 Solución` va **apilada en las columnas del texto**: imágenes 16:10, una debajo de otra, cada una con un pie en mono (vista y, si existe, fecha) que sale de `media`. No lleva lightbox ni carrusel, y tampoco JS de cliente. La primera imagen visible no se carga con `lazy` si compite por el LCP. La portada es la imagen del resumen (CASE-01).
- **D-02:** La única escena scrubbed del caso (MOTN-03) es el **número de sección (01–05) en la columna del margen**: acompaña el scroll y cambia al pasar de sección (`<ScrollScene>` en `src/components/motion/`, GSAP ScrollTrigger). Solo usa `transform`/`opacity`. Con `prefers-reduced-motion: reduce` el número queda estático junto a su sección. En móvil, donde no hay columna de margen, el número va estático en línea con el título de la sección.
- **D-03:** Anterior/siguiente (CASE-06) sigue la **columna `order` del admin** sobre los proyectos publicados y visibles, el mismo orden que la home. **No da la vuelta**: el primero no tiene "anterior" y el último no tiene "siguiente". Va seguido de la llamada a contacto.
- **D-04:** Las métricas del resumen (máx. 3) van en una **fila de datos**: el valor grande en Funnel Display y, debajo, la etiqueta con su fuente en mono pequeño (la fuente ya viene en la etiqueta, D-11 de la fase 1). Las métricas se separan con reglas de 1px (`--line`). No llevan cajas, sombras ni contador animado (number tickers prohibidos). En móvil se apilan. Si no hay métricas, la fila no se renderiza.

#### Rutas y navegación (aprobaciones de Teo, 2026-11-22)
- **D-05:** Rutas nuevas **aprobadas**: `/about` ↔ `/es/sobre-mi`, `/contact` ↔ `/es/contacto` (en `pathnames` de `src/i18n/routing.ts`), `sitemap.xml`, `robots.txt` y `opengraph-image` por página y por caso de estudio. Se registran en `docs/decisions.md` como decisión de Teo. Cualquier otra ruta se pregunta.
- **D-06:** **Now es una sección fechada dentro de `/about`**, no una ruta propia. No hay `/now`. Sale de `site_settings.now_en/now_es` (Tiptap JSON, renderizado con static-renderer) y la fecha es la del último cambio publicado.
- **D-07:** La imagen OG se **genera con `next/og`** (`ImageResponse`, viene con Next y no añade dependencias). Es tipográfica y usa los tokens: título de la página o del proyecto, "mateojaras.dev" y la fecha en mono, con Funnel Display/Geist Mono desde TTF locales. Se genera por idioma y por caso. No lleva gradientes ni imágenes decorativas.
- **D-08:** El header lleva **"Mateo Jaramillo" a la izquierda, enlazado a la home**, y a la derecha Work, About y Contact, `LangSwitch` (EN/ES en mono) y `ThemeToggle`. En móvil se mantiene en **una línea, sin menú hamburguesa**. Si no cabe a 390 px, el planner/UI-spec ajusta tamaños o abrevia, sin añadir menús. Work enlaza a la sección de proyectos de la home (`/#work`). El enlace activo es el único uso del acento en el header (regla de un acento por vista).

#### Flujo de contacto
- **D-09:** Orden de la action: Zod → honeypot/tiempo (descarte silencioso) → rate limit → guardar en `contact_messages` → enviar con Resend. **Si Resend falla después de guardar, el visitante ve la confirmación normal**: el mensaje ya está en `/admin/mensajes`. El fallo se registra en el log del servidor.
- **D-10:** **Columna nueva aprobada:** `contact_messages.email_sent_at timestamp null`, con una **migración nueva** (no se toca ninguna existente). Se rellena cuando Resend confirma el envío. `/admin/mensajes` marca los mensajes sin email enviado. Se actualizan `docs/data-model.md` y `docs/decisions.md` (decisión de Teo). — **Reversibility:** one-way — es una migración aplicada en Neon `dev` y `main`, y quitarla exige otra migración.
- **D-11:** Direcciones: **From `mateojaras.dev <contacto@mateojaras.dev>`** (dominio verificado en Resend; no hace falta un buzón real) → **To: el `email` de SiteSettings**. `replyTo` = email del visitante. Cuerpo en `text` plano (sin `react:`, porque `@react-email/render` no está instalado).
- **D-12:** Rate limit: **3 envíos por IP por hora** (Upstash `slidingWindow`, clave = IP hasheada). Falla cerrado si Upstash no responde (CONT-04).
- **D-13:** La confirmación **reemplaza al formulario en el mismo lugar**: un bloque en el idioma del visitante, con el foco movido ahí y anunciado con `aria-live`. No usa toast ni ruta nueva. Los envíos descartados (honeypot, < ~3 s) ven la misma confirmación, para no avisar al bot. El rechazo por límite o por fallo de Upstash sí muestra un error claro en su idioma.

#### Composición de la home
- **D-14:** La home lista **todos los proyectos publicados y visibles** en el orden del admin, como entradas fechadas (`EntryList`). `featured` sigue siendo solo para el CV. Con poco contenido la lista queda corta pero real. No hay página `/projects` de índice.
- **D-15:** Estructura: **hero (variante A + StatusLine) → `01 Work` (entradas) → `02 Contact`** (una línea de cierre, el email copiable y el enlace a Cal.com desde `site_settings.calendar_url`). La home no lleva teaser de About. Si falta `calendar_url`, el enlace a Cal.com no se renderiza.
- **D-16:** La home **no lleva escena scrubbed**. Su movimiento es SplitText en el H1 (MOTN-02) más `<Reveal>` (MOTN-01). ScrollTrigger se carga solo en el caso de estudio.

### Claude's Discretion
- Estructura de `/about`: orden de bio, Now, stack con años (sin barras de nivel), experiencia, educación e idiomas, numerados al estilo bitácora.
- Footer (GitHub, LinkedIn, CV `/cv/en.pdf`/`/cv/es.pdf` según el idioma, código fuente) y su disposición.
- `ThemeToggle` (script inline anti-flash + `document.startViewTransition`, persistido en localStorage) y `LangSwitch`. Para un caso de estudio, el switch apunta al mismo slug en el otro idioma.
- Cambio de ruta con `<ViewTransition>` (DESIGN.md §5.6): solo si el flag funciona sin problemas; si no, sin transición.
- Reloj de Medellín y cálculo del solapamiento Toronto/Madrid con horario de verano (hoja de cliente; el shell prerenderizado solo usa datos guardados).
- Títulos y descripciones SEO por página desde SiteSettings y el contenido. Los textos de UI nuevos van en `messages/en.json`/`es.json`, con paridad.
- Cómo se marca un proyecto sin `liveUrl` como "Herramienta interna, datos de ejemplo" con demostración por contacto (CASE-05).
- Diseño visual detallado: va a `/gsd-ui-phase 4` (UI-SPEC) con los tokens de DESIGN.md.

### Deferred Ideas (OUT OF SCOPE)
- Página índice `/projects` (solo haría falta si la home mostrara únicamente los featured): descartada por ahora (D-14).
- Lightbox o ampliación de las capturas: descartada (D-01); se puede reconsiderar en la fase 5 si la revisión de 3 personas lo pide.

**Also binding:** `04-UI-SPEC.md` (approved 2026-11-22), including Teo's answers P1–P5 (09:00–18:00 workday; `captionEn/captionEs/capturedAt` optional in `media`; "MJ" below 640px; pre-approved SplitText Plan B; summary = tagline + metrics + cover).
</user_constraints>

## Project Constraints (from CLAUDE.md)

| Directive | Impact on this phase |
|-----------|----------------------|
| Read `AGENTS.md` and `node_modules/next/dist/docs/` before Next code; do not edit the `nextjs-agent-rules` block | All framework claims below were checked against the bundled 16.4.6 docs |
| Stack fixed; **ask before adding or changing dependencies** | This phase needs **zero new packages** (verified: gsap, @gsap/react, motion, resend, @upstash/*, @tiptap/static-renderer, next/og are installed or bundled) |
| Ask before: touching `DESIGN.md`/`docs/copy.md`/palette/type; changing `docs/data-model.md` or an existing migration; adding routes; animation outside budget; new external service; backlog items | D-05 and D-10 already approved. DESIGN.md §5.6 mentions `experimental.viewTransition`, which no longer exists (see State of the Art). Log the interpretation in `docs/decisions.md`, do not edit DESIGN.md |
| Feature folders `src/features/<entity>/{schema,queries,actions,validation,components}` | Contact public action goes in `src/features/contact/actions.ts` (or a sibling `public-actions.ts`), schema in `validation.ts` |
| Server Components by default; `'use client'` only on interactive leaves | Client leaves: `LangSwitch`, `NavLinks`, `ThemeToggle`, `LocalTime`, `CopyEmail`, `ContactForm`, `SplitHeading`, `ScrollScene` |
| Public queries: `'use cache'` + `cacheTag` (tags in `src/lib/cache-tags.ts`); Core + cached wrapper (Plan B seam) | New queries (project stack, sitemap entries) follow `getXCore` + wrapper |
| Localized fields via `localized(row, field, locale)`; UI strings in `messages/*.json` with parity; content only from DB | `src/lib/messages.test.ts` already enforces key parity |
| Missing content means the component does not render; no lorem, no invented metrics | Every block guards on data (UI-SPEC "UI Considerations") |
| One commit per task, conventional messages; `pnpm check` before closing commits | |
| GSAP only inside `src/components/motion/`; Motion (`motion/react`) for enter/exit | |
| Motion budget: 1 staggered reveal, precise hovers, 1–2 scrubbed scenes, theme via View Transitions; only `transform`/`opacity`; `prefers-reduced-motion`; native scroll; no 3D | |
| Banned: Inter/Roboto/Arial/system fonts, gradients, glass, hero+3 cards, effects libraries, marquees, tickers, em-dashes in copy, emojis | |
| Missing env var: **stop and ask Teo** with (1) service, (2) dashboard steps, (3) variable names and where; code stays behind an env check with a clear message, never a mock | Applies to `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL/TOKEN` |
| Security: Zod server-side always, rate limit + honeypot on public form, CSP and headers in `next.config.ts`, no keys in versioned files | |
| Verify each public view: Playwright screenshots 390/768/1440 light+dark, `/impeccable:audit` + `/impeccable:critique`, report before continuing | |
| Lighthouse mobile ≥ 95 on `/`, `/projects/[slug]`, `/about`, `/contact` (en+es); LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1; WCAG AA | |
| Record every non-trivial decision in `docs/decisions.md` | |

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CASE-01 | Header with mono meta row, summary (problem, role, up to 3 metrics), cover image | Pattern 6 (case study data), Pitfall 9 (cover LCP vs Reveal), `next/image` `fetchPriority` not `priority` |
| CASE-02 | Sections 01–05, hidden when empty | Pattern 6; fixed numbering; unique ids per instance (Pitfall 3) |
| CASE-03 | Tech decisions as `Marginalia`; below paragraph on mobile | `TechDecisions` type in `projects/schema.ts` (`decisions`, `tradeoffs`, `validation`, `aiTools`) |
| CASE-04 | Tiptap body rendered on server with static renderer | Existing `src/lib/rich-text.tsx` (`renderToReactElement` from `@tiptap/static-renderer/pm/react`); style via wrapper class or `nodeMapping` |
| CASE-05 | No `liveUrl` → "Internal tool, sample data" + demo link | Pure branch on `liveUrl === null`; contact href via `getPathname` |
| CASE-06 | Prev/next + contact CTA | Derive from cached `getProjects()` list by `order`, no wrap (D-03) |
| CASE-07 | Project published after deploy opens without redeploy | Existing Suspense-wrapped slug pattern; new client hooks in layout must sit inside `<Suspense>` (Pitfall 2) |
| SITE-01 | Hero + status line + dated entries | Existing `HeroA`/`StatusLine`; new `getProjectStacks` query |
| SITE-02 | Overlap with Toronto/Madrid, DST-aware | Pattern 4 + verified test vectors (DST gap weeks) |
| SITE-03 | Live Medellín time, client leaf, does not break prerender | Pattern 4: `useSyncExternalStore` with `null` server snapshot + inline script |
| SITE-04 | About: bio, dated Now, stack with years, experience, education, languages | Existing queries `getSkills/getExperiences/getEducation/getSiteSettings`; `RichText` for Now |
| SITE-05 | Language switch keeps the page | Pattern 3: `useParams` + `useSelectedLayoutSegments` (not `usePathname`), plain `<a>` (cross-root-layout nav is a full load) |
| SITE-06 | Theme toggle with View Transitions, no flash, persisted | Pattern 2 (head script + dual-icon CSS + `useLayoutEffect` re-apply in dev) |
| SITE-07 | Footer links GitHub, LinkedIn, CV PDF, source | Existing `/cv/{en,es}.pdf` rewrites; settings URLs |
| CONT-01 | Send name/email/message, confirmation in locale | Pattern 5; locale passed explicitly (root params unavailable in actions) |
| CONT-02 | Saved before sending; Resend with `replyTo` | Pattern 5; `after()` for the send; `{ data, error }` return shape |
| CONT-03 | Honeypot / < ~3 s silently discarded | Pattern 5: client-measured elapsed time (page is static, a server timestamp would be build time) |
| CONT-04 | Upstash per-IP limit, fail closed | **Ratelimit `timeout` resolves `success: true, reason: "timeout"` (fail-open by default)**: must treat as rejection (Pitfall 5) |
| CONT-05 | Copy email button + Cal.com link | `navigator.clipboard.writeText`, live region; plain link |
| SEO-01 | Title, description, OG per page and locale | Pattern 7: one `buildPageMetadata()` helper (shallow merge), `opengraph-image.tsx` per segment |
| SEO-02 | hreflang `en`, `es`, `x-default` | `alternates.languages` with `getPathname`; absolute via `metadataBase` |
| SEO-03 | sitemap/robots with both locales, no `/admin` | `src/app/sitemap.ts`, `src/app/robots.ts`; proxy matcher already skips dotted paths |
| MOTN-01 | Staggered reveal | CSS keyframes from first paint (Pattern 8); Pitfall 9 (LCP) and Pitfall 4 (replays after Activity) |
| MOTN-02 | Hero H1 SplitText after fonts, no CLS | Pattern 8; Pitfall 8 (two LCP traps); Plan B pre-approved |
| MOTN-03 | ≤ 1 scrubbed scene per page | `ScrollScene` with `gsap.matchMedia()`; scope to ref; Activity cleanup |
| MOTN-04 | Reduced motion: no animation; only transform/opacity | `html.motion-ok` gate + `@media (prefers-reduced-motion)` + `gsap.matchMedia` + VT reduce CSS |
| QUAL-01 | Lighthouse mobile ≥ 95 on 4 routes × 2 locales, on Vercel Preview | Environment: Lighthouse CLI not installed; Preview may be behind Deployment Protection (Open Question 2) |
| QUAL-02 | LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 | Dynamic `import()` of GSAP after hydration (28 KB gz core + 3.7 KB SplitText / 18 KB ScrollTrigger) |
| QUAL-04 | `/impeccable:audit` no criticals | Run per view (CLAUDE.md loop) |
</phase_requirements>

## Summary

Phases 1–3 left a solid base: `src/app/[locale]/` is the root layout per locale with `next/root-params`, cached cores + `'use cache'` wrappers exist for projects, settings, skills, experience and education, `RichText` already renders Tiptap JSON on the server with zero ProseMirror on the client, and the hero A + StatusLine components are approved. The home and case-study pages are phase-2 skeletons. No `src/components/motion/` exists yet, the public contact action does not exist, and `src/i18n/routing.ts` only maps `/` and `/projects/[slug]`. Nothing needs to be installed: every library the phase uses is already a dependency or ships with Next.

The biggest planning risk is not any single library but **Cache Components' route-level `<Activity>`**: Next 16 keeps up to 3 visited routes in the DOM with `display: none` and runs effect cleanups on hide and setups on show. That answers the roadmap research flag: `useGSAP`/`gsap.context` cleanups do run on hide and re-run on show (so ScrollTrigger recreates correctly, but SplitText would replay unless guarded), CSS reveal animations restart when a hidden route is shown again, duplicate `id`s from hidden pages stay in the document (skip link, `aria-labelledby`), Playwright `locator('h1')` can match hidden routes, and a submitted contact form keeps showing its confirmation after back-navigation unless reset. A second cluster comes from **client URL hooks under Cache Components**: `usePathname`/`useParams`/`useSelectedLayoutSegments` in the layout header suspend on the unknown-slug fallback shell (CASE-07), so the build fails without a `<Suspense>`; `usePathname` also risks a hydration mismatch with the next-intl rewrites on `/es/proyectos/*`.

Third, **two verified gotchas in the contact and SEO stack**: Upstash `Ratelimit` fails open on timeout (`success: true, reason: "timeout"`), so CONT-04 needs an explicit check; and next-intl documents that `opengraph-image` routes need to bypass the proxy (`.*/opengraph-image` in the matcher). The `experimental.viewTransition` flag that DESIGN.md §5.6 and the UI-SPEC reference was **removed in Next 16.3**; `<ViewTransition>` works without configuration in 16.4 + React 19.3.1. Finally, the hero motion has real LCP risk on throttled mobile: an `opacity: 0` H1 is not an LCP candidate until repainted, and a `SplitText.revert()` at the end creates a new text paint that can become the LCP entry. The pre-approved Plan B (server-split words + CSS) is the measurable fallback.

**Primary recommendation:** Build case study first on the existing cached cores, put every client URL hook in a `<Suspense>`-wrapped leaf, design every client effect to be Activity-safe (cleanup on hide, guard one-shot animations), load GSAP with dynamic `import()` after hydration, and measure LCP on the hero before polishing motion.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Case study, home, about, contact markup | Frontend Server (RSC, prerendered static shell) | CDN | Content from cached DB reads; no client JS for content (CASE-04, D-01) |
| Content reads | Database (Neon) via cached cores | Frontend Server (`'use cache'` + tags) | Admin `updateTag` invalidates; CASE-07 via fallback shell + Suspense |
| Theme no-flash | Browser (inline `<head>` script) | — | Must run before first paint; server cannot know `localStorage` |
| Theme toggle + VT | Browser (client leaf) | — | DOM class + `document.startViewTransition` |
| Live clock + overlap | Browser (client leaf + inline script) | — | `Date.now()` in prerender is a build error under Cache Components |
| Lang switch / active nav | Browser (client leaves in `<Suspense>`) | Frontend Server (fallback) | Needs current route params; layout has no access to child params |
| Contact submission | API/Backend (Server Action, Node runtime) | Database, Upstash, Resend | Zod + honeypot + rate limit + insert + email; locale passed as argument |
| Email notify | API/Backend (`after()` callback) | Resend | Non-blocking; failure does not change visitor response (D-09) |
| OG images | Frontend Server (metadata route handler, `next/og`) | CDN (static when params known) | Route handler: `params` not root params; explicit locale for translations |
| sitemap/robots | Frontend Server (metadata routes) | CDN | Cached query tagged `projects` |
| Motion (reveal) | Browser (CSS keyframes) | — | Starts at first paint, no hydration wait |
| Motion (SplitText, ScrollTrigger) | Browser (client leaf, dynamic import) | — | Keeps 28–46 KB gz out of the critical path |

## Standard Stack

### Core (all already installed; versions read from `package.json` / `node_modules` on 2026-11-22)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.4.6 | App Router, Cache Components, metadata routes, `next/og`, `after()` | Fixed stack [VERIFIED: node_modules/next/package.json] |
| react / react-dom | 19.3.1 | `ViewTransition`, `Activity`, `useSyncExternalStore` | `typeof React.ViewTransition === 'symbol'` confirmed [VERIFIED: node -e] |
| next-intl | ^4.14.9 | Localized pathnames, `getPathname`, `Link`, `getTranslations({locale})` | Existing routing in `src/i18n/` [VERIFIED: codebase] |
| gsap + @gsap/react | 3.15.0 / 2.1.2 | SplitText (hero), ScrollTrigger (case study) | All plugins in the public package [VERIFIED: node_modules/gsap] |
| motion | ^14.7.1 | Form confirmation enter fade | `motion/react` per CLAUDE.md |
| @tiptap/static-renderer | 3.32.0 | Server rendering of `case_study_*`, `now_*` | Already wrapped in `src/lib/rich-text.tsx` [VERIFIED: codebase] |
| @upstash/ratelimit + @upstash/redis | 2.2.0 / ^1.40.0 | Per-IP sliding window | [VERIFIED: node_modules/@upstash/ratelimit/dist/index.d.ts] |
| resend | 6.35.0 | Notification email | `replyTo?: string \| string[]`, returns `{ data, error }` [VERIFIED: node_modules/resend/dist/index.d.mts] |
| react-hook-form + @hookform/resolvers + zod | 7.91 / 6.0.2 / 4.6.7 | Contact form client validation; same schema on server | Fixed stack |
| lucide-react | ^1.63.0 | `Sun`, `Moon`, `ArrowLeft`, `ArrowUpRight` only | UI-SPEC |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `next/og` (`ImageResponse`) | bundled | OG PNGs 1200×630 | `opengraph-image.tsx` per segment; flexbox only, ttf/otf/woff, 500 KB bundle cap [CITED: node_modules/next/dist/docs/.../image-response.md] |
| `next/server` `after` | bundled | Send email after responding | Allowed in Server Functions, `headers()` readable inside [CITED: .../functions/after.md] |
| `tw-animate-css` | 1.4.0 | Only for shadcn overlays | Not for public motion |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Client `LangSwitch` with `useParams` + `useSelectedLayoutSegments` | Header rendered per page with server-computed alternate href | Server-only, no Suspense, but the case-study header's alternate needs the slug inside the slug Suspense; more duplication |
| GSAP SplitText (MOTN-02 letter) | Plan B: words split on the server + CSS keyframes (pre-approved P4) | Plan B is LCP-safe and ships 0 KB JS; use if Lighthouse fails |
| `useGSAP` with static `gsap` import | Dynamic `import('gsap')` inside an effect + `gsap.context` | `@gsap/react` statically imports `gsap` (28 KB gz) into the route bundle; dynamic import keeps it off the hydration path |
| Motion for confirmation fade | `motion-safe:animate-in fade-in` (tw-animate-css, 0 KB JS) | CLAUDE.md assigns enter/exit to Motion; use `LazyMotion` with async features to keep cost low |

**Installation:** none. `pnpm install` is not needed for this phase.

## Package Legitimacy Audit

No external packages are installed in this phase. Every capability uses dependencies already in `package.json` (audited in phases 1–3) or modules bundled with Next (`next/og`, `next/server`).

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| (none new) | — | — | — | — | not run (nothing to check) | — |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

Tooling note: running Lighthouse locally would mean downloading `lighthouse` via `pnpm dlx` (a tool, not a dependency). It is not installed. Treat that as a "new tool" question for Teo, or use Chrome DevTools / PageSpeed Insights (see Environment Availability).

## Architecture Patterns

### System Architecture Diagram

```
Visitor request
   │
   ▼
src/proxy.ts ──(/admin/*)──▶ cookie hint → admin (unchanged)
   │  matcher skips: api, _next, _vercel, dotted paths (sitemap.xml, robots.txt),
   │  and MUST also skip .*/opengraph-image
   ▼
next-intl rewrite: /about → /en/about · /es/sobre-mi → /es/about · /es/proyectos/x → /es/projects/x
   │
   ▼
[locale]/layout.tsx (root layout per locale, static)
   ├─ <head>: theme + motion-ok inline script (before paint)
   ├─ SiteHeader (RSC) ── <Suspense> NavLinks / LangSwitch (client, URL hooks)
   ├─ <main id="main"> ── <ViewTransition>? ── page
   │      ├─ /            HeroA+SplitHeading · StatusLine+LocalTime · EntryList · Contact
   │      ├─ /about       bio · Now(RichText) · stack · experience · education · languages
   │      ├─ /contact     intro · ContactForm(client) ──▶ Server Action ─┐
   │      └─ /projects/[slug]  shell ── <Suspense> CaseStudy(slug) ── ScrollScene(client)
   └─ SiteFooter (RSC)                                                    │
                                                                          ▼
        cached cores ('use cache' + cacheTag) ◀── updateTag from admin   submitContact(locale, input)
              │                                                           1 Zod (locale enum)
              ▼                                                           2 honeypot / elapsed < 3 s → fake ok
        Neon Postgres (dev / main)                                        3 Upstash limit (timeout = reject)
                                                                          4 insert contact_messages
Metadata routes (route handlers, no root params):                         5 after(): Resend send → email_sent_at
   [locale]/**/opengraph-image.tsx (params.locale, explicit getTranslations)
   app/sitemap.ts, app/robots.ts (getPathname for both locales, cached query)
```

### Recommended Project Structure (new files only)
```
src/
├── app/
│   ├── sitemap.ts                       # SEO-03
│   ├── robots.ts                        # SEO-03
│   └── [locale]/
│       ├── layout.tsx                   # + head script, header, footer, <main id="main">, metadataBase
│       ├── opengraph-image.tsx          # home OG
│       ├── about/{page.tsx,opengraph-image.tsx}
│       ├── contact/{page.tsx,opengraph-image.tsx}
│       └── projects/[slug]/{page.tsx,opengraph-image.tsx}
├── components/
│   ├── motion/{reveal.tsx,split-heading.tsx,scroll-scene.tsx,load-gsap.ts}
│   └── site/{site-header,site-footer,nav-links,lang-switch,theme-toggle,theme-script,
│             inline-script,local-time,page-section,entry-list,marginalia,copy-email}.tsx
│             case-study/{header,metrics,cover,sections,gallery,prev-next}.tsx
├── features/contact/
│   ├── validation.ts                    # shared Zod schema (client + server)
│   ├── public-actions.ts                # 'use server' submitContact(locale, input)
│   ├── submit-core.ts                   # pure core with injected deps (unit-testable)
│   └── components/contact-form.tsx
├── lib/
│   ├── overlap.ts                       # self-contained, also embedded in the inline script
│   ├── site-url.ts                      # absolute base URL
│   └── seo.ts                           # buildPageMetadata(), alternates
drizzle/0003_*.sql                       # email_sent_at (D-10), generated, never hand-edited
```

### Pattern 1: Activity-safe client leaves (applies to every client component in this phase)
**What:** Under `cacheComponents: true`, Next hides up to 3 previous routes with React `<Activity>` (`display: none`). Effect cleanups run when hidden; effects re-run when shown; state and refs are preserved. [CITED: node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md]
**Rules:**
- Timers/subscriptions (clock, matchMedia listeners) live in effects or `useSyncExternalStore` subscribe so they stop when hidden.
- One-shot animations (SplitText) keep a "played" flag in a ref or module variable so returning to the page does not replay. Refs survive Activity.
- GSAP selectors are always scoped to a container ref. Never `gsap.utils.toArray('.x')` globally: hidden routes still have matching DOM.
- Contact form: reset stale confirmation on hide with the documented `useLayoutEffect` cleanup + `shouldReset` ref.
- Put `<main id="main" tabIndex={-1}>` once in the layout (not per page), so the skip link never targets a hidden route's `<main>`. Prefix in-page ids with the slug in case studies (`${slug}-problem`), because prev/next keeps several case pages in the DOM and `aria-labelledby` resolves to the first match even if hidden.

```tsx
// Source: node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md ("Resetting stale status messages")
useLayoutEffect(() => {
  return () => {
    if (shouldReset.current) {
      shouldReset.current = false;
      setStatus("idle");
      form.reset();
    }
  };
}, []);
```

### Pattern 2: Theme without flash + View Transition toggle
**What:** Inline script in `<head>` of `[locale]/layout.tsx` sets `.dark` (stored value, else `prefers-color-scheme`) and `motion-ok` (when `prefers-reduced-motion: no-preference`). `<html suppressHydrationWarning>`. [CITED: .../02-guides/preventing-flash-before-hydration.md]
- In development, Strict Mode's remount resets `<html>` attributes to the JSX ones and drops `.dark`/`motion-ok`; re-apply in a `useLayoutEffect` of `ThemeToggle` (documented "Re-applying attributes in development"). No-op in production.
- Render **both** icons and both labels, switched with `dark:` classes (`dark:hidden` / `hidden dark:inline`). The correct icon and accessible name then come from CSS, with no hydration mismatch and no icon flash. `display: none` removes the inactive label from the accessibility tree.
- Click: `if (matchMedia('(prefers-reduced-motion: no-preference)').matches && document.startViewTransition) document.startViewTransition(flip) else flip()`, where `flip` toggles the class synchronously and writes `localStorage.theme`. The class lives outside React, so a manual `startViewTransition` is appropriate here (the VT skill's "never call it yourself" rule targets React state updates).
- CSS: `::view-transition-old(root), ::view-transition-new(root) { animation-duration: 250ms; }` plus the reduce block that zeroes durations.
- CSP: the inline script is allowed by the current `script-src 'unsafe-inline'`. Phase 5's blocking CSP must keep it (or add a hash). Note it for phase 5.

```tsx
// Source: preventing-flash-before-hydration.md (Themes), adapted to .dark + motion-ok
const themeScript = `(function(){try{var d=document.documentElement,t=localStorage.getItem("theme");
if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))d.classList.add("dark");
if(matchMedia("(prefers-reduced-motion: no-preference)").matches)d.classList.add("motion-ok")}catch(e){}})()`;
// <html lang={param} className={...} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html: themeScript}} /></head>
```

### Pattern 3: Header active state and LangSwitch under Cache Components
**What:** `usePathname`, `useParams`, `useSelectedLayoutSegment(s)` suspend on routes whose dynamic params are not in `generateStaticParams` (the unknown-slug fallback shell that CASE-07 depends on). Without a `<Suspense>` around the consumer, **the build fails**. [CITED: .../04-functions/use-pathname.md, use-params.md, use-selected-layout-segments.md "Cache Components"]
**Recommendation:**
- `NavLinks` (active `aria-current`) uses `useSelectedLayoutSegment()` from the `[locale]` layout: it returns route segments (`about`, `contact`, `projects`), not the browser URL. That avoids the rewrite mismatch `usePathname` documents ("reading the pathname with usePathname() can result in hydration mismatch errors" with Proxy rewrites [CITED: use-pathname.md]).
- `LangSwitch` uses `useParams()` (`{ locale, slug? }`) + `useSelectedLayoutSegments()` to rebuild the internal href, then `getPathname({ locale: other, href })` from `@/i18n/navigation`. With `localePrefix: 'as-needed'`, `getPathname` omits the `en` prefix (verified in `next-intl/dist/esm/development/navigation/shared/utils.js` `applyPathnamePrefix`). Do **not** use next-intl `<Link locale=…>`: it forces a prefix (`forcePrefix`), which then costs a redirect from `/en/…` to `/…`.
- Render as a plain `<a href hrefLang lang>`. Switching locale changes the root layout (`[locale]` is the root segment), so it is a full document load anyway. Preserve the hash in `onClick` (`e.currentTarget.href = base + location.hash`).
- Wrap both in `<Suspense fallback={<StaticVariant />}>`: the fallback renders no active state, and links to the other locale's home. Known slugs from `generateStaticParams` resolve at build time, so the fallback only shows on never-before-built slugs.
- Client components cannot call `useTranslations` here (`NextIntlClientProvider messages={null}`); pass labels as props from the server header.

### Pattern 4: Live clock + DST overlap without breaking the prerender
**What:** `Date.now()`/`new Date()` during prerender is a build error under Cache Components, also with `instant = false` [CITED: .../02-guides/migrating-to-cache-components.md step 3]. The shell renders only stored data (`UTC-5` and the static overlap phrase, as today).
- `src/lib/overlap.ts`: one **self-contained** function (no imports, no closures) `overlapHours(at: Date) → { toronto, madrid }`: take the Bogotá calendar date of `at`, compute each city's 09:00–18:00 window in UTC using the zone's offset at 12:00 UTC of that date (DST switches happen at night, so noon is safe), intersect with Bogotá's window.
- Hard load: an `InlineScript` placed **after** the `<time>` and overlap `<span>`s writes their text before paint (`suppressHydrationWarning` on those two spans only). The UI-SPEC says "ThemeScript" sets them, but a `<head>` script runs before those elements exist. Use the documented `InlineScript` helper with the `type` swap trick, and embed `String(overlapHours)`.
- Soft navigation and minute ticks: `LocalTime` uses `useSyncExternalStore(subscribeEveryMinute, () => Math.floor(Date.now()/60000), () => null)`. A `null` server snapshot means no clock read on the server, and hydration matches. Subscription stops when Activity hides the home.
- Verified test vectors (run 2026-11-22 with Node 24.22 ICU, 09:00–18:00 in all three cities):

| Date (2026) | Toronto | Madrid | Why |
|---|---|---|---|
| 01-15 | 9 | 3 | Both standard time |
| 03-09 | 8 | 3 | US DST started Mar 8, EU not yet |
| 03-30 | 8 | 2 | EU DST started Mar 29 |
| 07-15 | 8 | 2 | Both summer |
| 10-26 | 8 | 3 | EU ended Oct 25, US still EDT |
| 11-02 | 9 | 3 | US ended Nov 1 |
| 11-22 | 9 | 3 | Matches UI-SPEC "today" |

### Pattern 5: Public contact Server Action
**What:** Order fixed by D-09. Root params are unavailable in Server Actions [CITED: .../04-functions/next-root-params.md "Not available in Server Actions"], so `locale` is an argument validated by `z.enum(['en','es'])`.

```ts
// src/features/contact/public-actions.ts (shape; deps injected into a pure core for unit tests)
"use server";
export async function submitContact(locale: unknown, input: unknown): Promise<ContactResult> {
  const parsed = contactSchema.safeParse({ ...(input as object), locale });
  if (!parsed.success) return { ok: false, error: "validation", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const { website, elapsedMs, ...msg } = parsed.data;
  if (website || elapsedMs < 3000) return { ok: true };                 // silent discard (D-13)
  const limiter = getLimiter();                                           // null when env missing
  if (!limiter) { console.error("Falta UPSTASH_REDIS_REST_URL/TOKEN"); return { ok: false, error: "unavailable" }; }
  const ipHash = hashIp((await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown");
  try {
    const r = await limiter.limit(ipHash);
    if (r.reason === "timeout") return { ok: false, error: "unavailable" }; // fail closed (Pitfall 5)
    if (!r.success) return { ok: false, error: "rate_limited" };
  } catch { return { ok: false, error: "unavailable" }; }
  const [row] = await db.insert(contactMessages).values({ ...msg, ipHash }).returning({ id: contactMessages.id });
  after(() => notifyByEmail(row.id, msg));   // Resend; sets email_sent_at on success, logs on error
  return { ok: true };
}
```
- **Elapsed time:** `/contact` is prerendered, so a server-rendered timestamp would be the build time. The client records `performance.now()` at mount and sends `elapsedMs` at submit (relative, so client/server clock skew does not matter). A missing value (bot posting without JS) parses as `0` and is discarded. Trade-off: a no-JS human is also silently discarded. That is acceptable, because the email address is on the page.
- **Limiter:** `new Ratelimit({ redis: new Redis({ url, token }), limiter: Ratelimit.slidingWindow(3, "1 h"), prefix: "contact", timeout: 2000 })` at module scope, created only when env exists. Accept `UPSTASH_REDIS_REST_*` or `KV_REST_API_*` (Marketplace names).
- **Resend:** `const { data, error } = await resend.emails.send({ from: "mateojaras.dev <contacto@mateojaras.dev>", to: settings.email, replyTo: msg.email, subject, text })`. The SDK returns `{ data, error }` for API errors instead of throwing; wrap it in try/catch for network errors too. Strip `\r\n` from `name` before it goes into `subject`. Read `settings.email` with `getSiteSettingsCore({ includeDrafts: false })`. `CONTACT_TO_EMAIL` in `.env.example` becomes obsolete under D-11 (same cleanup as `NEXT_PUBLIC_CAL_URL`).
- **`after()`** runs the send after the response, on Vercel via `waitUntil` [CITED: after.md]. The visitor's result never depends on Resend (D-09), and INP on submit improves.
- **IP hashing:** SHA-256 of IP + a server secret. No dedicated salt env exists. Reusing `BETTER_AUTH_SECRET` as pepper avoids a new variable but couples rotation; a new `CONTACT_IP_SALT` needs Teo (Open Question 4).
- **Form:** RHF + `zodResolver(contactSchema)` with error codes mapped to localized strings passed as props; on submit call the action inside `startTransition`. Focus moves to the confirmation `h2` (`tabIndex={-1}`).

### Pattern 6: Case study composition on existing cached cores
- `getProject(slug)` (existing, tags `projects` + `project:slug`) for the page; prev/next from `getProjects()` (same `order`, no wrap). Both are already cached.
- **New query:** `getProjectStacks()` (core + `'use cache'`, tags `projects` + `skills`): `project_skills ⨝ skills` where the skill is published and visible, ordered by `skills.order`. `project_skills` has no order column, so the stack order is the skill order. Skill edits already call `updateTag(tags.projects)` (`src/features/skills/actions.ts:43`).
- `media` JSON gets optional `captionEn/captionEs/capturedAt` (P2, approved): update the Drizzle `$type<>`, the item Zod schema, the admin media form and `docs/data-model.md`. No SQL migration.
- Cover: `next/image` with `fetchPriority="high"` and `loading="eager"`. **`priority` is deprecated in Next 16** in favor of `preload`, and the docs recommend `fetchPriority`/`loading="eager"` over `preload` in most cases [CITED: .../02-components/image.md "preload", "priority"].
- Plain-text fields (`problem`, `role`, `solution`): split on blank lines, group `- ` lines into `<ul>`. Pure function, unit-tested.
- `RichText` styling: wrap in a container with descendant utilities, or pass `options.nodeMapping` (supported by `renderToReactElement` [VERIFIED: @tiptap/static-renderer/dist/pm/react/index.d.ts]). Keep `rich-text.tsx` free of `'use client'` imports so StarterKit never reaches a client bundle.

### Pattern 7: Metadata, OG, sitemap, robots
- `metadataBase` in `[locale]/layout.tsx` `generateMetadata` from `siteUrl()` = `NEXT_PUBLIC_SITE_URL` → `https://${VERCEL_PROJECT_PRODUCTION_URL}` → `http://localhost:3000`.
- Next metadata merges **shallowly**: a page that sets `openGraph` or `alternates` replaces the layout's whole object. Use one helper, `buildPageMetadata({ locale, title, description, href })`, that returns `title`, `description`, `alternates: { canonical, languages: { en, es, 'x-default': en } }`, `openGraph: { type, locale, siteName, url }` and `twitter: { card: 'summary_large_image' }` on every page.
- With Cache Components, `generateMetadata` that awaits `params` or reads uncached data defers to request time. That is fine on the case study (its body also defers), but static pages must read only cached data. [CITED: generate-metadata.md "With Cache Components"]
- **OG routes are Route Handlers:** `next/root-params` is not available there [CITED: next-root-params.md], and `src/i18n/request.ts` falls back to `rootParams.locale()` when no locale is passed. Always use `params.locale` and `getTranslations({ locale, namespace })`. Fonts: `readFile(join(process.cwd(), 'assets/fonts-pdf/FunnelDisplay-SemiBold.ttf'))` at module scope (34 KB + Geist Mono 101 KB, under the 500 KB cap). Add an `outputFileTracingIncludes` entry for the OG routes (today only `/admin/**` includes the fonts). Localized `alt` via `generateImageMetadata({ params })`.
- **Proxy matcher:** add `.*/opengraph-image` to the exclusion, per next-intl: "this route might not be accessible since Next.js doesn't know about potential rewrites of the middleware" [CITED: Context7 /amannn/next-intl/v4.14.9 actions-metadata-route-handlers]. The emitted URL is the internal path (`/en/opengraph-image`, `/es/projects/x/opengraph-image`), served directly once bypassed. Verify in e2e: read `og:image` from the page head, fetch it, and expect `200 image/png`.
- `sitemap.ts`: entries for `/`, `/about`, `/contact` and each published+visible slug, with `alternates.languages` from `getPathname` for `en`/`es`, and `lastModified` from DB `updatedAt` (never `new Date()` in a prerender). Use a cached query tagged `projects`. `robots.ts`: `disallow: ['/admin', '/api']` and the sitemap URL. Both already bypass the proxy (dotted path).
- next-intl's proxy already emits a `Link` hreflang header by default (`alternateLinks`). Keep it consistent with the metadata alternates; do not disable it without a reason.

### Pattern 8: Motion components
- **`<Reveal>` (Server, CSS):** `<div className="reveal" style={{'--reveal-index': i}}>` with
  `@media (prefers-reduced-motion: no-preference){ .reveal{ animation: reveal 400ms cubic-bezier(.2,.8,.2,1) both; animation-delay: calc(var(--reveal-index)*60ms) } }` and `@keyframes reveal{ from{ opacity:0; transform:translateY(12px) } }`. No `will-change` (the animation promotes the layer itself).
- **`<SplitHeading>` (client):** the H1 stays server-rendered as `children`. CSS hides it only under `html.motion-ok` and never for more than 1000 ms: `html.motion-ok [data-split]:not([data-split-done]){ opacity:0; animation: split-failsafe 0s 1000ms forwards }`. The effect: `await document.fonts.ready`, then `const [{gsap},{SplitText}] = await Promise.all([import('gsap'), import('gsap/SplitText')])`, a `cancelled` guard, `gsap.registerPlugin(SplitText)`, `ctx = gsap.context(() => SplitText.create(el, { type: 'words', aria: 'auto', onSplit: s => gsap.from(s.words, {...}) }), ref)`, then set `data-split-done`. Cleanup: `cancelled = true; ctx?.revert()`. Use a module-level `played` flag so Activity re-show does not replay. `type: 'words'` only, so no line re-splitting is needed (`autoSplit` matters only for lines [CITED: Context7 /websites/gsap SplitText]).
- **`<ScrollScene>` (client, case study only):** dynamic import of `gsap` + `gsap/ScrollTrigger`. `gsap.matchMedia()` with `"(min-width: 1024px) and (prefers-reduced-motion: no-preference)"` creates one ScrollTrigger per section (`start: 'top 50%'`, `end: 'bottom 50%'`, scrub the accent layer's opacity). matchMedia auto-reverts when the conditions stop matching. Revert on cleanup, which also runs on Activity hide. The sticky number is CSS `position: sticky` (not GSAP pinning), applied only under `motion-safe` and `lg`.
- **`<ViewTransition>` for route changes:** no flag needed in 16.4 (`experimental.viewTransition` "removed in 16.3.0 … View transitions work in the App Router without configuration" [CITED: .../02-guides/upgrading/version-16.md]). If used: wrap `{children}` in the layout, default crossfade 250 ms, reduce-motion CSS, `::view-transition { pointer-events: none }`. Keep it the last motion task and drop it if any navigation glitch appears (UI-SPEC row 6).

### Anti-Patterns to Avoid
- **`usePathname` in the layout header:** suspends on fallback shells (build failure without Suspense) and can mismatch with next-intl rewrites.
- **Static `import gsap` in a component used by the home or case-study shell:** puts 28–46 KB gz on the hydration path.
- **Global GSAP selectors:** match hidden Activity routes.
- **`new Date()` in sitemap/OG/pages:** prerender build error; use stored dates.
- **`getTranslations({ namespace })` without `locale` in OG routes or actions:** `request.ts` calls root params, which throws there.
- **Trusting Ratelimit `success` alone:** a timeout returns `success: true`.
- **next-intl `<Link locale="en">` for the switch:** forces `/en/…` and a redirect.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Localized URLs (sitemap, hreflang, switch, CTAs) | String concatenation (`'/es/proyectos/' + slug`) | `getPathname({ locale, href })` from `@/i18n/navigation` | Pathname map + `as-needed` prefix logic already encoded. `hero-copy.ts` hardcodes `CTA_HREF` and should move to `getPathname` once `/contact` is in `pathnames` |
| Rate limiting | Redis INCR/EXPIRE logic | `Ratelimit.slidingWindow(3, '1 h')` | Atomic Lua scripts, ephemeral cache |
| Word splitting with a11y | Manual span wrapping in the client | GSAP `SplitText` `aria: 'auto'` (or Plan B server split) | Handles `aria-label`, nested nodes, `revert()` |
| Scroll-position triggers | `IntersectionObserver` + scroll math | ScrollTrigger + `gsap.matchMedia` | Refresh on resize/fonts, reduced-motion revert |
| OG image rendering | Canvas / headless browser | `next/og` `ImageResponse` | Bundled, cached as a static route |
| Tiptap to React | HTML string + `dangerouslySetInnerHTML` | Existing `RichText` (static renderer) | No XSS surface, no ProseMirror on the client |
| Email transport | SMTP/nodemailer | `resend.emails.send` | Already decided (D-11) |
| Hydration-safe client time | `useState(Date.now())` / `useEffect` + `setState` | `useSyncExternalStore` with `null` server snapshot + inline script | No mismatch, no flash |

**Key insight:** most risk in this phase lives in framework semantics (Activity, fallback shells, root-params boundaries). Writing custom glue around them causes more bugs than it removes.

## Common Pitfalls

### Pitfall 1: `experimental.viewTransition` does not exist anymore
**What goes wrong:** A task adds the flag that DESIGN.md §5.6 / UI-SPEC row 6 mention. The config is then invalid or ignored.
**How to avoid:** Use `<ViewTransition>` from `react` with no config. Log the interpretation in `docs/decisions.md` ("the flag the doc names was removed in 16.3; the condition 'works without problems' is evaluated on the component"). Do not edit DESIGN.md without asking.

### Pitfall 2: Client URL hooks in the layout break the build or CASE-07
**What goes wrong:** `next build` fails with "encountered URL data in a Client Component outside of Suspense" for the `/[locale]/projects/[slug]` fallback shell.
**How to avoid:** `<Suspense>` around `NavLinks` and `LangSwitch`, as in Pattern 3.
**Warning signs:** Build error naming `blocking-prerender-client-hook`; a newly published slug returns 500.

### Pitfall 3: Duplicate DOM from Activity-preserved routes
**What goes wrong:** The skip link jumps to a hidden `<main>`. `aria-labelledby="hero-title"` resolves to a hidden copy. Playwright `page.locator('h1')` hits a strict-mode violation after a soft navigation.
**How to avoid:** One `<main id="main">` in the layout; slug-prefixed ids in case studies; e2e uses `getByRole`, or `.filter({ visible: true })` [CITED: preserving-ui-state.md "Testing"]. Existing `e2e/public.spec.ts` asserts `page.locator("h1")).toHaveText(siteName)` on `/`. It breaks once the hero replaces the name and must be rewritten.

### Pitfall 4: Animations replay when a preserved route is shown again
**What goes wrong:** Back-navigation to the home replays `<Reveal>` (CSS animations restart when an element goes from `display: none` to displayed) and re-runs the SplitText effect.
**How to avoid:** A module-level `played` flag for SplitHeading. For Reveal, accept the replay (400 ms, subtle) or have a tiny client leaf add `data-revealed` to the page root after the first `animationend`. Record the choice in decisions.md.

### Pitfall 5: Upstash fails open by default
**What goes wrong:** When Upstash is slow, `limit()` resolves `{ success: true, reason: "timeout" }` after `timeout` (default 5000 ms) [VERIFIED: node_modules/@upstash/ratelimit/dist/index.js around line 931; d.ts "If set, the ratelimiter will allow requests to pass after this many milliseconds"]. CONT-04 is violated silently.
**How to avoid:** `timeout: 2000`, treat `reason === "timeout"` as `unavailable`, wrap in try/catch, and fail closed when env vars are missing. Unit-test all three branches with a fake limiter.

### Pitfall 6: OG images 404 or redirect behind the i18n proxy
**What goes wrong:** Crawlers get a redirect or a 404 for `og:image`.
**How to avoid:** Add the matcher exclusion `.*/opengraph-image`, plus an e2e that fetches the emitted URL. Also never call `getTranslations` without `locale` in OG routes.

### Pitfall 7: Static `/contact` makes server timestamps meaningless
**What goes wrong:** A "render time" hidden field holds the build time, so every submission looks hours old and the < 3 s check never fires (or always fires).
**How to avoid:** The client measures `elapsedMs` from mount (Pattern 5).

### Pitfall 8: SplitText hero can push LCP past 2.5 s on mobile
**What goes wrong:** (a) Chromium ignores `opacity: 0` paints for LCP, so the H1 becomes a candidate only when repainted visible, which depends on JS download + hydration + `fonts.ready` under 4× CPU throttling. (b) `revert()` at the end replaces the word spans with a fresh text node. That is a new paint of the largest text block, which can be reported as the LCP entry at about JS time + 700 ms. [CITED: web.dev/lcp "elements with an opacity of 0 … are excluded"; debugbear.com/blog/opacity-animation-poor-lcp]
**How to avoid:** Dynamic-import GSAP; the 1000 ms CSS failsafe caps (a). Measure on the Preview before polishing. If LCP > 2.5 s, either skip `revert()` (SplitText `aria: 'auto'` keeps the label) or switch to pre-approved Plan B (server split + CSS). Both are deviations to log. Confidence MEDIUM on (b): validate with the Performance panel's LCP entry.

### Pitfall 9: `<Reveal>` on the LCP element
**What goes wrong:** The case-study cover is listed in Reveal (UI-SPEC row 1). An opacity-0 start removes it from LCP candidacy until a repaint. Compositor-only opacity animations may never trigger the repaint, so LCP shifts to another element or gets reported late.
**How to avoid:** Keep the H1s out of Reveal (the UI-SPEC already does). For the cover, measure both options (cover in Reveal vs. not), pick the one that passes, and log the choice.

### Pitfall 10: Hydration of theme-dependent UI
**What goes wrong:** `ThemeToggle` reads `localStorage` in `useState`, so the server and client trees differ, and the icon flashes or a hydration error appears.
**How to avoid:** CSS-driven dual icon/label (Pattern 2). React does not need to know the theme to render.

### Pitfall 11: Migration on Neon `main`
**What goes wrong:** `0003` (email_sent_at) is applied on `dev` but not on `main`. Production inserts work (the column is nullable), but the action's `update … set email_sent_at` fails on `main`.
**How to avoid:** `pnpm db:generate` (never hand-edit), migrate `dev`, and get Teo to run the migration against `main` (phase 3 showed `vercel env pull` returns `[SENSITIVE]` for `DATABASE_URL`). Write the `email_sent_at` update inside a try/catch so an unmigrated DB only logs.

### Pitfall 12: Metadata shallow merge drops OG/alternates
**What goes wrong:** The layout sets `openGraph.siteName`, a page sets `openGraph.title`, and the page's OG loses `siteName`/`locale`.
**How to avoid:** `buildPageMetadata()` returns complete objects on every page (Pattern 7).

## Code Examples

### Ratelimit fail-closed check
```ts
// Source: node_modules/@upstash/ratelimit/dist/index.d.ts (RatelimitResponse.reason, timeout option)
const res = await limiter.limit(ipHash);
if (res.reason === "timeout") return { ok: false, error: "unavailable" };
if (!res.success) return { ok: false, error: "rate_limited" };
```

### Resend call shape
```ts
// Source: node_modules/resend/dist/index.d.mts (CreateEmailOptions.replyTo, Response<T> = {data}|{error})
const { error } = await resend.emails.send({
  from: "mateojaras.dev <contacto@mateojaras.dev>",
  to: settings.email,
  replyTo: msg.email,
  subject: `Mensaje de ${msg.name.replace(/[\r\n]+/g, " ")} · mateojaras.dev`,
  text: `${msg.name} <${msg.email}> (${msg.locale})\n\n${msg.message}`,
});
if (error) console.error("resend failed", error.name); else await markEmailSent(id);
```

### Inline script helper (no React script warning)
```tsx
// Source: node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
```

### Sitemap entry with next-intl
```ts
// Source: Context7 /amannn/next-intl/v4.14.9 (actions-metadata-route-handlers, Sitemap)
const entry = (href: Href, lastModified: Date) => ({
  url: base + getPathname({ locale: "en", href }),
  lastModified,
  alternates: { languages: {
    en: base + getPathname({ locale: "en", href }),
    es: base + getPathname({ locale: "es", href }),
    "x-default": base + getPathname({ locale: "en", href }),
  } },
});
```

### Proxy matcher
```ts
// Source: Context7 /amannn/next-intl/v4.14.9 "Bypass middleware for opengraph-image"
export const config = { matcher: ["/((?!api|_next|_vercel|.*/opengraph-image|.*\\..*).*)"] };
```
Keep the `/admin` branch inside `proxy()` unchanged. Check that `/opengraph-image` at the root (home en OG is emitted as `/en/opengraph-image`) still matches the exclusion; the pattern `.*/opengraph-image` covers any depth.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `experimental.viewTransition` | `<ViewTransition>` with no config | Removed in Next 16.3.0 | DESIGN.md/UI-SPEC wording is stale; no config task |
| `next/image` `priority` | `preload`, or (recommended) `fetchPriority="high"` / `loading="eager"` | Next 16 | Use `fetchPriority` on the cover |
| Unmount on navigation | Routes preserved with `<Activity>` (max 3) | Cache Components (Next 16) | All client effects must be hide/show-safe |
| `middleware.ts` | `proxy.ts` | Next 16 | Already done |
| GSAP Club plugins | All plugins free in the public `gsap` | 3.13 | SplitText usable from `gsap/SplitText` |
| `SplitText` new + manual re-split | `SplitText.create`, `onSplit`, `autoSplit`, `aria` | 3.13 | Use `create` + `aria: 'auto'` |

**Deprecated/outdated in this repo:** `.env.example` `NEXT_PUBLIC_CAL_URL` (data lives in `site_settings.calendar_url`) and `CONTACT_TO_EMAIL` (D-11 uses the SiteSettings email). `hero-copy.ts` `CTA_HREF` hardcodes `/es/contacto`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `usePathname` from next-intl would mismatch on `/es/proyectos/*` because the server sees the rewritten internal path | Pattern 3 | Low: the recommendation avoids `usePathname` anyway |
| A2 | `useSelectedLayoutSegment(s)` returns route segments that are identical on server and client under the next-intl rewrite | Pattern 3 | Medium: if wrong, `NavLinks` shows a hydration warning. Verify in dev on `/es/sobre-mi` |
| A3 | `SplitText.revert()` produces a new LCP entry | Pitfall 8 | Medium: affects only which mitigation is chosen; measurement decides |
| A4 | `String(overlapHours)` of a self-contained function survives server bundling/minification as valid JS | Pattern 4 | Medium: add a unit test that evaluates the string with `new Function` |
| A5 | `x-forwarded-for` first hop is the client IP on Vercel | Pattern 5 | Low on Vercel (the platform sets it); spoofable off Vercel |
| A6 | Next's tracer may not include the TTFs for OG routes without `outputFileTracingIncludes` | Pattern 7 | Low: the explicit include is cheap insurance |
| A7 | `generateImageMetadata` receives `params` including `locale` for nested OG routes | Pattern 7 | Low: confirm with `next typegen` types |
| A8 | Vercel Preview is behind Deployment Protection, so PageSpeed Insights cannot reach it | Environment | Medium: changes how QUAL-01 is measured |

## Open Questions

1. **Hero motion path (MOTN-02 vs QUAL-02)**
   - What we know: Plan B is pre-approved; the GSAP path has two LCP traps.
   - Recommendation: implement GSAP first (it is the letter of MOTN-02), measure on the first Preview, switch to Plan B immediately if LCP > 2.5 s. Log either way.
2. **How QUAL-01 is measured on the Preview**
   - What we know: the Lighthouse CLI is not installed; the Preview may require Vercel auth; the Vercel toolbar on previews injects a script that affects scores.
   - Recommendation: ask Teo once: Chrome DevTools Lighthouse (mobile, logged in), or PSI with a protection bypass, or approve `pnpm dlx lighthouse`. Disable the toolbar for measurement.
3. **Reveal replay after Activity re-show:** accept it, or add the `data-revealed` leaf. Claude's discretion; log it.
4. **IP hash pepper:** reuse `BETTER_AUTH_SECRET`, or add `CONTACT_IP_SALT` (a new env var means asking Teo). Recommendation: ask together with the Resend/Upstash keys so it costs one interruption.
5. **Content readiness:** only ManuJ is complete, and `e2e-stale-probe` appears published+visible (order 998) in the `content/projects.json` snapshot. The planner must confirm the dev/main DB state before screenshots, and ask Teo to fill ManuJ's narrative fields, cover and media before the Lighthouse gate.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | build/dev | ✓ | 24.22.1 | — |
| pnpm | all scripts | ✓ | 12.16.1 | — |
| Playwright Chromium | e2e, screenshots | ✓ | chromium-1248 | — |
| Vercel CLI | previews, env | ✓ | 59.4.0 | Dashboard |
| `dig` | checking Resend SPF/DKIM DNS in Porkbun | ✓ | system | Resend dashboard |
| Lighthouse CLI | QUAL-01 | ✗ | — | Chrome DevTools Lighthouse; PageSpeed Insights; `pnpm dlx lighthouse` (ask) |
| `RESEND_API_KEY` + verified domain | CONT-02 | ✗ (phase 4 account, not created) | — | Message saved, confirmation shown, `email_sent_at` null (D-09) |
| `UPSTASH_REDIS_REST_URL/TOKEN` | CONT-04 | ✗ (not created) | — | None: fails closed with the "unavailable" error by design |
| `site_settings.calendar_url` | CONT-05 | data (Teo enters it) | — | Link not rendered (D-15) |
| Neon `main` migration access | D-10 | Teo only (`DATABASE_URL` sensitive in Vercel) | — | Teo runs `pnpm db:migrate` with the main URL |

**Missing dependencies with no fallback:** Upstash credentials. Until they exist, the success path of the contact form cannot be exercised end to end (only the honeypot/validation paths and unit tests with fakes). Ask Teo on day 1, in the exact CLAUDE.md format, together with Resend (DNS propagation).

**Missing dependencies with fallback:** Resend (save + confirm), Lighthouse CLI (DevTools/PSI).

*(Validation Architecture section omitted: `workflow.nyquist_validation` is `false` in `.planning/config.json`. Testing guidance still applies: unit-test `overlapHours` with the vectors above, the contact core with fake limiter/mailer/db, the plain-text paragraph splitter, `buildPageMetadata`, and prev/next derivation. E2E: rewrite `public.spec.ts` for the hero, add case-study/about/contact/lang-switch/theme/OG/sitemap/robots specs using `getByRole`. Playwright already runs with `reducedMotion: "reduce"`.)*

## Security Domain

### Applicable ASVS Categories (Level 1)

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no (public site) | Admin unchanged |
| V3 Session Management | no | — |
| V4 Access Control | yes (limited) | `/admin/mensajes` badge reads go through existing `requireSession` loaders; the public action never reads messages |
| V5 Input Validation | yes | Shared Zod schema on client and server; `locale` as `z.enum`; length caps (name ≤ 100, email ≤ 254, message 10–5000); CR/LF stripped in the subject |
| V6 Cryptography | yes (hashing) | `node:crypto` SHA-256 with a server-side pepper for `ip_hash`; never store or log raw IPs |
| V7 Error/Logging | yes | Log error codes and names, not message bodies or emails; the missing-env log names the variable only |
| V11 Business Logic (anti-automation) | yes | Honeypot + elapsed-time + Upstash 3/h fail-closed |
| V13 API | yes | Server Action built-in Origin/Host CSRF check and 1 MB body limit [CITED: server-actions.md] |
| V14 Configuration | yes | Existing headers + Report-Only CSP; `X-Robots-Tag` on `/admin`; robots `disallow /admin, /api` |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Contact spam / flooding | DoS | Honeypot, elapsed-time, sliding window per hashed IP, fail closed |
| Email header injection via name | Tampering | Resend JSON API (no raw headers) + CR/LF strip in the subject |
| Stored XSS via message or rich text | Tampering | React text escaping in the admin reader; `RichText` emits elements, with protocols allowlisted (`https`, `mailto`) in `tiptap-extensions.ts` and `rich-text-schema.ts` |
| IP spoofing to dodge the limit | Spoofing | On Vercel `x-forwarded-for` is platform-set; off-platform is out of scope |
| PII leakage in logs/backups | Info disclosure | `contact_messages` already excluded from `exportContent`; `ipHash` never selected by admin queries |
| Draft content leaking to the public | Info disclosure | Public cores use `includeDrafts: false` unless Draft Mode (existing) |
| Inline script vs future strict CSP | — | Phase 5: keep `'unsafe-inline'` for scripts or add hashes for the theme/clock scripts |

## Sources

### Primary (HIGH confidence)
- `node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md`: Activity behavior, reset patterns, testing with hidden routes
- `node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md`: theme script, `InlineScript`, dev re-apply, live clocks
- `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`: `experimental.viewTransition` removed in 16.3.0
- `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`: `<ViewTransition>` without config, reduce-motion CSS
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/{use-pathname,use-params,use-selected-layout-segment(s),next-root-params,generate-metadata,generate-image-metadata,after,image-response}.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/{opengraph-image,sitemap,robots}.md`; `05-config/01-next-config-js/output.md` (tracing includes); `02-components/image.md` (preload/priority)
- `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md`: synchronous IO rule
- Installed sources: `@upstash/ratelimit` 2.2.0 (timeout → `success: true`), `resend` 6.35.0 types, `next-intl` `applyPathnamePrefix`/`useBasePathname`, `@gsap/react` static `gsap` import, `@tiptap/static-renderer` `nodeMapping`, gsap file sizes
- Codebase: `src/app/[locale]/*`, `src/features/*/queries.ts`, `src/proxy.ts`, `src/i18n/*`, `src/lib/{rich-text,format,cache-tags,env}.ts`, `next.config.ts`, `e2e/public.spec.ts`, `content/projects.json`
- Local computation: DST overlap vectors (Node 24.22 ICU)

### Secondary (MEDIUM confidence)
- Context7 `/amannn/next-intl/v4.14.9`: OG matcher bypass, sitemap with `getPathname`
- Context7 `/websites/gsap`: `SplitText.create`, `aria`, `autoSplit`, `onSplit`
- `.agents/skills/vercel-react-view-transitions/SKILL.md`: browser support, "don't call startViewTransition yourself" (scoped to React updates)
- https://web.dev/lcp/: opacity-0 exclusion

### Tertiary (LOW confidence, validate)
- https://debugbear.com/blog/opacity-animation-poor-lcp: repaint requirement after fade-in (single source; measure)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH. Nothing new; versions read from the installed tree.
- Architecture: HIGH for Activity, Suspense and root-params rules (bundled docs); MEDIUM for the header hook choice (A2).
- Pitfalls: HIGH for Upstash, OG matcher, the VT flag and the prerender clock rule; MEDIUM for the LCP/motion interaction.

**Research date:** 2026-11-22
**Valid until:** 2026-12-22 (stable pinned stack; re-check if Next moves past 16.4.x)
