# Phase 4: Sitio público - Context

**Gathered:** 2026-11-22
**Status:** Ready for planning

<domain>
## Phase Boundary

El sitio público en en/es: casos de estudio (`/projects/[slug]`, `/es/proyectos/[slug]`), home (`/`), about con Now (`/about`, `/es/sobre-mi`) y contacto (`/contact`, `/es/contacto`), con header/footer, cambio de idioma y tema, SEO completo (meta, OG, hreflang, sitemap, robots) y el presupuesto de movimiento de DESIGN.md §5. Requisitos: CASE-01..07, SITE-01..07, CONT-01..05, SEO-01..03, MOTN-01..04, QUAL-01, QUAL-02, QUAL-04. La 404 (SITE-08), la CSP en bloqueo, analytics y la revisión por 3 personas son de la fase 5.

Los casos de estudio van primero: si el tiempo aprieta, el resto queda sobrio.

</domain>

<decisions>
## Implementation Decisions

### Caso de estudio
- **D-01:** La galería de `03 Solución` va **apilada en las columnas del texto**: imágenes 16:10, una debajo de otra, cada una con un pie en mono (vista y, si existe, fecha) que sale de `media`. No lleva lightbox ni carrusel, y tampoco JS de cliente. La primera imagen visible no se carga con `lazy` si compite por el LCP. La portada es la imagen del resumen (CASE-01).
- **D-02:** La única escena scrubbed del caso (MOTN-03) es el **número de sección (01–05) en la columna del margen**: acompaña el scroll y cambia al pasar de sección (`<ScrollScene>` en `src/components/motion/`, GSAP ScrollTrigger). Solo usa `transform`/`opacity`. Con `prefers-reduced-motion: reduce` el número queda estático junto a su sección. En móvil, donde no hay columna de margen, el número va estático en línea con el título de la sección.
- **D-03:** Anterior/siguiente (CASE-06) sigue la **columna `order` del admin** sobre los proyectos publicados y visibles, el mismo orden que la home. **No da la vuelta**: el primero no tiene "anterior" y el último no tiene "siguiente". Va seguido de la llamada a contacto.
- **D-04:** Las métricas del resumen (máx. 3) van en una **fila de datos**: el valor grande en Funnel Display y, debajo, la etiqueta con su fuente en mono pequeño (la fuente ya viene en la etiqueta, D-11 de la fase 1). Las métricas se separan con reglas de 1px (`--line`). No llevan cajas, sombras ni contador animado (number tickers prohibidos). En móvil se apilan. Si no hay métricas, la fila no se renderiza.

### Rutas y navegación (aprobaciones de Teo, 2026-11-22)
- **D-05:** Rutas nuevas **aprobadas**: `/about` ↔ `/es/sobre-mi`, `/contact` ↔ `/es/contacto` (en `pathnames` de `src/i18n/routing.ts`), `sitemap.xml`, `robots.txt` y `opengraph-image` por página y por caso de estudio. Se registran en `docs/decisions.md` como decisión de Teo. Cualquier otra ruta se pregunta.
- **D-06:** **Now es una sección fechada dentro de `/about`**, no una ruta propia. No hay `/now`. Sale de `site_settings.now_en/now_es` (Tiptap JSON, renderizado con static-renderer) y la fecha es la del último cambio publicado.
- **D-07:** La imagen OG se **genera con `next/og`** (`ImageResponse`, viene con Next y no añade dependencias). Es tipográfica y usa los tokens: título de la página o del proyecto, "mateojaras.dev" y la fecha en mono, con Funnel Display/Geist Mono desde TTF locales. Se genera por idioma y por caso. No lleva gradientes ni imágenes decorativas.
- **D-08:** El header lleva **"Mateo Jaramillo" a la izquierda, enlazado a la home**, y a la derecha Work, About y Contact, `LangSwitch` (EN/ES en mono) y `ThemeToggle`. En móvil se mantiene en **una línea, sin menú hamburguesa**. Si no cabe a 390 px, el planner/UI-spec ajusta tamaños o abrevia, sin añadir menús. Work enlaza a la sección de proyectos de la home (`/#work`). El enlace activo es el único uso del acento en el header (regla de un acento por vista).

### Flujo de contacto
- **D-09:** Orden de la action: Zod → honeypot/tiempo (descarte silencioso) → rate limit → guardar en `contact_messages` → enviar con Resend. **Si Resend falla después de guardar, el visitante ve la confirmación normal**: el mensaje ya está en `/admin/mensajes`. El fallo se registra en el log del servidor.
- **D-10:** **Columna nueva aprobada:** `contact_messages.email_sent_at timestamp null`, con una **migración nueva** (no se toca ninguna existente). Se rellena cuando Resend confirma el envío. `/admin/mensajes` marca los mensajes sin email enviado. Se actualizan `docs/data-model.md` y `docs/decisions.md` (decisión de Teo). — **Reversibility:** one-way — es una migración aplicada en Neon `dev` y `main`, y quitarla exige otra migración.
- **D-11:** Direcciones: **From `mateojaras.dev <contacto@mateojaras.dev>`** (dominio verificado en Resend; no hace falta un buzón real) → **To: el `email` de SiteSettings**. `replyTo` = email del visitante. Cuerpo en `text` plano (sin `react:`, porque `@react-email/render` no está instalado).
- **D-12:** Rate limit: **3 envíos por IP por hora** (Upstash `slidingWindow`, clave = IP hasheada). Falla cerrado si Upstash no responde (CONT-04).
- **D-13:** La confirmación **reemplaza al formulario en el mismo lugar**: un bloque en el idioma del visitante, con el foco movido ahí y anunciado con `aria-live`. No usa toast ni ruta nueva. Los envíos descartados (honeypot, < ~3 s) ven la misma confirmación, para no avisar al bot. El rechazo por límite o por fallo de Upstash sí muestra un error claro en su idioma.

### Composición de la home
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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Alcance y requisitos
- `.planning/ROADMAP.md` §Phase 4: goal, 5 success criteria, gate, cuentas y notas de verificación
- `.planning/REQUIREMENTS.md`: CASE-01..07, SITE-01..07, CONT-01..05, SEO-01..03, MOTN-01..04, QUAL-01/02/04
- `PROJECT.md` (raíz): rutas públicas, compuertas y límites de autonomía (manda sobre `.planning/`)
- `docs/backlog.md`: lo que NO se construye (no a /projects index, /now propia, blog, ⌘K…)

### Diseño
- `DESIGN.md` §1 concepto, §3 color (un acento por vista), §4 layout (12 col, marginalia, entradas), §5 presupuesto de movimiento, §6 componentes propios (`SectionNumber`, `StatusLine`, `EntryList`, `CaseStudy`, `Marginalia`, `ThemeToggle`, `LangSwitch`, `ContactForm`), §7 copy
- `docs/copy.md`: copy en/es de hero, about, now, contacto y footer

### Datos y arquitectura
- `docs/data-model.md`: `site_settings` (incl. `calendar_url`, `now_*`, `seo_*`), `projects` (`media`, `metrics_*`, `tech_decisions_*`, `order`), `contact_messages` (+ `email_sent_at` de D-10)
- `docs/decisions.md`: registro de decisiones; añadir D-05 y D-10 como decisiones de Teo
- `.claude/CLAUDE.md` §Exact Integration Configuration: 2 (root params no disponibles en Server Actions → la action de contacto recibe `locale`), 6 (Tiptap static-renderer), 9 (Motion/GSAP), 13 (Resend + Upstash), 15 (script de tema inline, sin `next-themes`)
- `AGENTS.md` + `node_modules/next/dist/docs/`: guías de `opengraph-image`, `sitemap`, `robots`, `preventing-flash-before-hydration`, `generate-static-params`

### Fases previas
- `.planning/phases/01-identidad-y-contenido/01-CONTEXT.md`: D-01 (hero A), D-10/D-11 (métricas con fuente en la etiqueta), D-16..D-18 (fuentes y tokens)
- `.planning/phases/02-base-t-cnica/02-CONTEXT.md`: D-09 (slug desconocido o draft → `notFound()`)
- `.planning/phases/03-panel-admin-cv/03-CONTEXT.md`: D-02 (queries públicas leen solo publicado y visible), D-03 (Draft Mode con banda), D-08 (CV desde Blob), D-15 (bandeja de mensajes)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/site/hero/hero-a.tsx` + `hero-parts.tsx`: la variante A aprobada, con `h1#hero-title`
- `src/components/site/status-line.tsx`: Server Component sin reloj; la hora en vivo y el solapamiento entran como hoja de cliente aparte
- `src/components/site/section-number.tsx`, `draft-banner.tsx`, `draft-exit-form.tsx`: numeración de sección y banda de Draft Mode (fase 3)
- `src/lib/rich-text.tsx` + `src/lib/tiptap-extensions.ts`: render de Tiptap en servidor con la lista de extensiones compartida
- `src/lib/format.ts` (`formatEntryDate`, `formatMonthYear`, `formatUtcOffset`), `src/lib/i18n-fields.ts`/`bilingual.ts` (`localized()`), `src/lib/mailto.ts`
- `src/features/projects/queries.ts` (`getProjects`, `getProject`, `getPublishedSlugsCore`), `src/features/site-settings/queries.ts`, y las queries de experience, skills y education
- `src/features/contact/`: schema y actions del admin (leer/borrar). Aquí entra la action pública
- `src/lib/cache-tags.ts`: `settings`, `projects`, `project(slug)`, `experience`, `skills`, `education`
- `src/components/ui/`: button, input, textarea, field, label, tooltip (para el botón de copiar email)

### Established Patterns
- Queries con `getXCore` + wrapper `'use cache'` (patrón del plan B), locale vía `next/root-params`
- `generateStaticParams` en `[locale]` y en `[slug]` debe devolver ≥ 1 entrada (Cache Components)
- Server Actions: Zod → sesión (solo admin) → Drizzle → `updateTag` → `exportContent()`. La action pública de contacto no lleva sesión, pero sí rate limit y honeypot
- Las variables que faltan (`RESEND_API_KEY`, `UPSTASH_*`) quedan tras una comprobación con mensaje claro (`src/lib/env.ts`, `env-missing-notice.tsx`), nunca con mocks

### Integration Points
- `src/i18n/routing.ts` `pathnames`: añadir `/about` y `/contact` con sus pares en español
- `src/app/[locale]/layout.tsx`: header, footer, script de tema y fuentes
- `src/app/[locale]/page.tsx` y `projects/[slug]/page.tsx`: hoy son el esqueleto de la fase 2 y se rediseñan
- `src/components/motion/` (todavía no existe): `Reveal`, `SplitHeading`, `ScrollScene`
- `/admin/mensajes`: mostrar la marca de `email_sent_at` (D-10)

</code_context>

<specifics>
## Specific Ideas

- Cuentas (ROADMAP): la verificación DNS de Resend en Porkbun se arranca **la primera mañana** de la fase por la propagación. Pedir `RESEND_API_KEY` y `UPSTASH_REDIS_REST_URL/TOKEN` con los pasos exactos (regla de CLAUDE.md). La URL de Cal.com la carga Teo en SiteSettings. `.env.example` todavía tiene `NEXT_PUBLIC_CAL_URL`, que sobra porque el dato vive en `site_settings.calendar_url`: se limpia.
- Solo ManuJ está completo hoy. Los casos y la home renderizan lo que haya, y el gate de Lighthouse se mide sobre ManuJ.
- Research flag del ROADMAP: comprobar GSAP dentro de `<Activity>` y SplitText después de cargar las fuentes (`document.fonts.ready`) sin CLS.
- Después de cada vista: capturas con Playwright a 390, 768 y 1440 px en claro y oscuro, más `/impeccable:audit` y `/impeccable:critique`, con los hallazgos reportados antes de seguir.

</specifics>

<deferred>
## Deferred Ideas

- Página índice `/projects` (solo haría falta si la home mostrara únicamente los featured): descartada por ahora (D-14).
- Lightbox o ampliación de las capturas: descartada (D-01); se puede reconsiderar en la fase 5 si la revisión de 3 personas lo pide.

</deferred>

---

*Phase: 04-sitio-p-blico*
*Context gathered: 2026-11-22*
