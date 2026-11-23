# Roadmap: mateojaras.dev

## Overview

El camino va de la identidad y el contenido real (sin material no hay casos de estudio) a una base técnica que ya sirve páginas reales en ambos idiomas, luego al admin que publica ese contenido y genera el CV, después al sitio público donde viven los casos de estudio (el valor central) y, por último, al pulido, la revisión por tres personas y el lanzamiento en mateojaras.dev. Las 5 fases, su orden, sus días y sus compuertas los fijó Teo en `PROJECT.md` (raíz, que manda sobre este archivo); este roadmap solo las conecta con los 76 requisitos v1 de `REQUIREMENTS.md`. Ventana: 10 días hábiles + 4 de margen, con calidad por encima de la fecha.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Identidad y contenido** - Identidad aprobada por Teo y base de contenido verificable en el repo; el contenido final pasa al admin (fase 3) (días 1–2) (completed 2026-11-01)
- [x] **Phase 2: Base técnica** - Esqueleto andante desplegado: login admin, Preview en verde, seed real y decisión del plan B (días 3–4) (completed 2026-11-16)
- [x] **Phase 3: Panel admin + CV** - Teo publica todo el contenido desde `/admin` y genera el CV en PDF en/es (días 5–7) (completed 2026-11-22)
- [ ] **Phase 4: Sitio público** - Casos de estudio, home, about y contacto en en/es, con SEO y movimiento; entrega el valor central (días 8–10)
- [ ] **Phase 5: Pulido y lanzamiento** - Accesibilidad, 404, CSP en bloqueo, analytics, revisión por 3 personas y producción (días 11–14)

## Phase Details

### Phase 1: Identidad y contenido

**Goal**: Teo aprueba la identidad del sitio (DESIGN.md, tokens, fuentes, variante del hero) y el repo tiene la base de contenido verificable de los 4 proyectos, sin marcadores ni datos inventados; el contenido narrativo, las capturas y el copy final los carga Teo desde el admin en la fase 3 (re-alcance del 2026-11-01)
**Depends on**: Nothing (first phase)
**Requirements**: IDEN-01, IDEN-02, IDEN-03, IDEN-04 (IDEN-05, IDEN-06 e IDEN-07 pasaron a la fase 3 el 2026-11-01: Teo carga el contenido desde el admin)
**Success Criteria** (what must be TRUE):

  1. `DESIGN.md` dice APROBADO con las dos frases del concepto escritas por Teo, y una página de muestra renderiza los tokens OKLCH (claro y oscuro), la escala tipográfica y el tema shadcn propio con Funnel Display, Hanken Grotesk y Geist Mono servidas desde el propio dominio (ninguna petición a un CDN de fuentes)
  2. Teo ve las 3 variantes del hero renderizadas en código con datos de un fixture que cumple el contrato de `site_settings`, eligió una y la elección consta en `docs/decisions.md`
  3. *(Movido a la fase 3 el 2026-11-01, ver `docs/decisions.md`.)* Cada uno de los 4 proyectos tiene en `docs/content/`, en en y es, tagline, problema, rol, solución, resultados, 2–3 decisiones técnicas, URLs, permiso del cliente y la fuente de cada métrica, y `material/` tiene al menos 3 capturas 16:10 por proyecto (las del inventario marcadas como datos ficticios)
  4. *(Movido a la fase 3 el 2026-11-01, ver `docs/decisions.md`.)* `docs/copy.md` no tiene ningún marcador `[Teo escribe]`: hero, about, now, experiencia y contacto están escritos por Teo en en y es, y él los aprobó
  5. `assets/fonts-pdf/` contiene los TTF estáticos de las tres familias, con glifos latin-ext, listos para el CV

**Plans**: 13/13 plans complete en 9 olas (8 compuertas humanas `blocking-human`)

Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Gate de calidad, tokens OKLCH y alias shadcn, tres fuentes con next/font y tema del Button
- [x] 01-03-PLAN.md — TTF estáticos del PDF con OFL y verificación; aprobaciones de arranque (G1) y legitimidad de axe

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — /lab y /lab/tokens 01–04 (color claro y oscuro, tipografía, espacio, Button), con los textos del lab en messages/en.json y messages/es.json
- [x] 01-05-PLAN.md — Contrato de contenido (Zod + paridad de cifras, métricas con etiqueta y fuente en en y es, `pnpm content:check`), guía de entrevista, registro de decisiones y DESIGN.md §2/§3

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-04-PLAN.md — Tipos de site_settings, fixture, StatusLine y /lab/tokens 05; headline y valores de Teo (G2)

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 01-06-PLAN.md — Variantes A/B/C del hero en /lab/hero y harness de comprobación en navegador

**Wave 5** *(blocked on Wave 4 completion)*

- [x] 01-07-PLAN.md — Entrevistas de los 4 proyectos (G4) transcritas a docs/content/
- [x] 01-08-PLAN.md — Evidencia de la revisión del lab: 24 capturas, axe y audit de /lab/tokens

**Wave 6** *(blocked on Wave 5 completion)*

- [x] 01-09-PLAN.md — Critique por variante y elección de variante (G3)
- [x] 01-10-PLAN.md — Capturas 16:10 en material/: webs en vivo y apps locales con datos de ejemplo (G5)

**Wave 7** *(blocked on Wave 6 completion)*

- [x] 01-11-PLAN.md — Decisiones de la revisión aplicadas, copy y frases del concepto de Teo (G6)

**Wave 8** *(blocked on Wave 7 completion)*

- [x] 01-12-PLAN.md — Script de compuerta de la fase y aprobación final de Teo (G7), con su revisión declarada de todas las capturas y liberación de las marcadas

**Wave 9** *(blocked on Wave 8 completion)*

- [x] 01-13-PLAN.md — *Omitido*: Teo aplazó al admin todo lo que este plan publicaba (G7, 2026-11-01); DESIGN.md ya se aprobó en 01-12

**UI hint**: yes
**Window**: días 1–2
**Gate**: concepto, `DESIGN.md`, copy y variante del hero aprobados por Teo; contenido real en `docs/content/` y `material/`
**Approvals**: las propias del gate (concepto, `DESIGN.md`, copy, variante del hero) y las preguntas de contenido: permiso de ManuJ y EcoExport para capturas y cifras, si el repo de la app de finanzas es público, si About menciona "contratista independiente", y confirmar la fuente de la métrica dentro de la etiqueta (sin cambio de esquema)
**Accounts**: ninguna
**Research flag**: no (patrones estándar: tokens, fuentes, componentes presentacionales)
**Notes**: Las variantes del hero son componentes presentacionales puros alimentados por un fixture, sin base de datos, para no adelantar trabajo de la fase 2. Riesgo de calendario ALTO: hoy `docs/content/` y `material/` están vacíos y `docs/copy.md` tiene marcadores. Si el contenido se retrasa, las fases 2 y 3 avanzan con lo que exista (el seed necesita al menos un proyecto completo) y solo se bloquean el gate de la fase 3 y las páginas de caso de estudio de la fase 4.

### Phase 2: Base técnica

**Goal**: Existe un esqueleto andante desplegado: Teo entra a `/admin` en un Preview de Vercel y las rutas públicas de ambos idiomas muestran contenido real de Neon, prerenderizado, con la estrategia de caché decidida
**Depends on**: Phase 1
**Requirements**: BASE-01, BASE-02, BASE-03, BASE-04, BASE-05, BASE-06, BASE-07, BASE-08, BASE-09, BASE-10, BASE-11, AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria** (what must be TRUE):

  1. En una URL de Vercel Preview (y en local), Teo inicia sesión en `/admin` con email y contraseña, sigue dentro tras recargar y puede cerrar sesión; no existe ningún camino de registro
  2. Una petición sin sesión válida a cualquier ruta, loader, Server Action o endpoint de subida del admin recibe un rechazo del servidor aunque se salte `proxy.ts`
  3. Tras `pnpm seed`, `/`, `/es`, `/projects/[slug]` y `/es/proyectos/[slug]` muestran en el Preview títulos reales desde Neon en el idioma correcto, servidos prerenderizados, y `/` sale en inglés sin importar el idioma del navegador
  4. Cada push corre `pnpm check` en CI en verde; el build del Preview aplica las migraciones contra Neon `dev` y despliega en verde, y sus respuestas llevan la CSP en Report-Only y las cabeceras de seguridad
  5. `docs/decisions.md` registra al final del día 3 el go/no-go entre `cacheComponents` e ISR, y el ciclo `exportContent()` a `content/*.json` y de vuelta por el seed restaura la base en local (en producción se omite con un aviso visible hasta que exista el token de Blob)

**Plans**: 9/9 plans complete
Plans:
**Wave 1**

- [x] 02-01-PLAN.md — Aprobaciones de arranque en un mensaje, dependencias, borrado de /lab, D-02/D-03 en docs

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 02-02-PLAN.md — .env.local de Neon dev, esquema completo + migración 0000 aplicada en Neon dev, migrate con lock

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 02-03-PLAN.md — Tracer: seed de proyectos, queries cacheadas, /en y /es prerenderizados

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 02-04-PLAN.md — Seed completo (site_settings, experiencia, educación) y ciclo exportContent / --from-content

**Wave 5** *(blocked on Wave 4 completion)*

- [x] 02-05-PLAN.md — next-intl + proxy.ts: /, /es, /projects/[slug], /es/proyectos/[slug]

**Wave 6** *(blocked on Wave 5 completion)*

- [x] 02-06-PLAN.md — Better Auth: admin sembrado, migración 0001, /api/auth, requireSession / requireSessionForRequest

**Wave 7** *(blocked on Wave 6 completion)*

- [x] 02-07-PLAN.md — Admin: login, cáscara con AuthGate, logout, e2e del ciclo de sesión

**Wave 8** *(blocked on Wave 7 completion)*

- [x] 02-08-PLAN.md — Go/no-go del plan B al final del día 3

**Wave 9** *(blocked on Wave 8 completion)*

- [x] 02-09-PLAN.md — CSP Report-Only, CI, Vercel Preview/Production, Neon main migrado y sembrado

**Window**: días 3–4
**Gate**: login admin + Vercel Preview en verde + seed cargado + walking skeleton público + decisión del plan B al día 3
**Approvals**: todas en una sola petición al inicio de la fase: React 19.3.0 a 19.3.1 y las dependencias directas (`@tiptap/pm`, `@tiptap/static-renderer`, `@dnd-kit/utilities`, `server-only`, `@testing-library/dom`, `@testing-library/user-event`, `@axe-core/playwright`, `tsx`, `@types/node@^24`); editar `docs/data-model.md` para añadir `site_settings.languages` en CEFR (aprobado el 2026-10-29, falta el doc) y corregir el CLI de Better Auth (`auth` en vez de `@better-auth/cli`); enmendar CLAUDE.md (`proxy.ts` también aplica las reescrituras de next-intl; la sesión se valida con AuthGate en `<Suspense>` + `requireSession()`). Opcional: Biome 2.4 a 2.6
**Accounts**: ninguna externa nueva. Se generan `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` y las credenciales del admin para el seed, que Teo copia en `.env.local` y en Vercel (Production y Preview). Neon (`main`/`dev`) ya existe; se confirma Preview a `dev`, Production a `main` y la URL sin pooler para migraciones
**Research flag**: sí. next-intl + `next/root-params` + Cache Components con dos root layouts; Better Auth en URLs de Preview (`trustedOrigins`/`allowedHosts`); crear el único admin con el registro deshabilitado (helper sobre `internalAdapter`); carrera de ramas de Neon en el primer build del Preview
**Notes**: El plan B (`cacheComponents: false` + ISR) ya está pre-aprobado; las consultas se escriben como núcleo sin caché más envoltorio cacheado para que el cambio solo toque los envoltorios. `generateStaticParams` necesita la base sembrada en CI, Preview y Production. Nunca `push` contra la rama `main` de Neon.

### Phase 3: Panel admin + CV

**Goal**: Teo administra todo el contenido del sitio desde `/admin` sin tocar código ni redeploy, y genera desde esos mismos datos un CV en PDF correcto en inglés y español
**Depends on**: Phase 2
**Requirements**: ADMN-01, ADMN-02, ADMN-03, ADMN-04, ADMN-05, ADMN-06, ADMN-07, ADMN-08, ADMN-09, ADMN-10, ADMN-11, ADMN-12, ADMN-13, CV-01, CV-02, CV-03, CV-04, CV-05, IDEN-05, IDEN-06, IDEN-07
**Success Criteria** (what must be TRUE):

  1. En un admin en español, Teo carga desde formularios (no desde el seed) el contenido real de los 4 proyectos con sus decisiones técnicas y métricas con fuente, la experiencia, las skills, la educación y SiteSettings, con los campos en/es lado a lado, los vacíos en español marcados e imágenes subidas a Blob con alt en/es
  2. Teo guarda un borrador, lo previsualiza en su ruta pública real con Draft Mode, lo publica y ve el cambio en el sitio desplegado sin redeploy; el interruptor de visible lo retira del sitio y el slug de un proyecto publicado ya no se puede editar
  3. Teo reordena proyectos, experiencias y skills arrastrando o solo con el teclado; Cmd+S guarda el formulario actual y salir con cambios sin guardar pide confirmación
  4. Teo genera el CV desde el admin; `/cv/en.pdf` y `/cv/es.pdf` sirven la última copia, de una columna, sin foto y con capa de texto en la que un test de extracción encuentra á, é, í, ó, ú y ñ intactas; el historial lista las copias anteriores y cualquiera se descarga
  5. `/resume.json` y `/resume.es.json` devuelven JSON Resume válido generado en vivo desde los mismos datos, y Teo tiene en el admin una bandeja de mensajes de contacto (vacía hasta que el formulario de la fase 4 reciba el primero)
  6. *(Desde la fase 1.)* El contenido de los 4 proyectos (IDEN-05), al menos 3 capturas 16:10 por proyecto revisadas por Teo (IDEN-06) y el copy en en/es sin marcadores ni borradores, incluidos los bullets de Sofka (IDEN-07), están cargados y aprobados por Teo desde el admin

**Plans**: 14/14 plans complete en 10 olas (2 compuertas humanas `blocking-human`)

Plans:
**Wave 1**

- [x] 03-01-PLAN.md — Aprobaciones de arranque (una petición), sonner/unpdf y primitivas shadcn, tokens, todos los textos del admin, registro de decisiones

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 03-02-PLAN.md — Hallazgos de la fase 2: seed que no pisa contenido, guarda de producción, respaldos no adivinables, CONTENT_EXPORT_DIR, política de content/

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 03-03-PLAN.md — Columna draft + migración 0002 (tarea propia), tracer de borrador/publicar de un proyecto hasta la página pública, slug fijo, capa de datos de proyectos

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 03-04-PLAN.md — Shell en español con nav numerada y checklist, lista de proyectos con reorden por teclado, visible/destacado en vivo y borrado con confirmación

**Wave 5** *(blocked on Wave 4 completion)*

- [x] 03-05-PLAN.md — Formulario completo de proyecto: kit bilingüe, repetidores, Tiptap + renderer, Cmd+S y aviso de cambios sin guardar, página de creación
- [x] 03-10-PLAN.md — Bandeja de mensajes de contacto con lector, leído/no leído y contador

**Wave 6** *(blocked on Wave 5 completion)*

- [x] 03-06-PLAN.md — Draft Mode: /api/draft, banda pública, ajustes con borrador, capturas e impeccable de la banda
- [x] 03-07-PLAN.md — Subida de imágenes a Blob con alt en/es y portada, /api/blob/upload, cambios de next.config (CSP, imágenes, trazado, rewrites)
- [x] 03-09-PLAN.md — CRUD de experiencia (bullets, relaciones) con reorden
- [x] 03-14-PLAN.md — Skills por categoría con reorden dentro de la categoría y destacado en vivo

**Wave 7** *(blocked on Wave 6 completion)*

- [x] 03-08-PLAN.md — SiteSettings con borrador y vista previa de la home, CRUD de educación

**Wave 8** *(blocked on Wave 7 completion)*

- [x] 03-11-PLAN.md — CV: CvData, react-pdf con fuentes estáticas, generar en/es a Blob, /cv/{en,es}.pdf, historial y spike en Preview

**Wave 9** *(blocked on Wave 8 completion)*

- [x] 03-12-PLAN.md — JSON Resume en vivo en /resume.json y /resume.es.json

**Wave 10** *(blocked on Wave 9 completion)*

- [x] 03-13-PLAN.md — Despliegue a producción y sesión de carga de Teo (D-09), compuerta en producción

**UI hint**: yes
**Window**: días 5–7
**Gate**: contenido real cargado desde el admin + PDF con tildes y ñ correctas en ambos idiomas
**Approvals**: rutas nuevas `/cv/en.pdf`, `/cv/es.pdf`, `/resume.es.json` y los endpoints internos (`/api/cv/[lang]`, `/api/resume/[lang]`, `/api/blob/upload`); confirmar que el CV público es la copia generada y guardada en Blob (snapshot) y no un render en vivo, y registrarlo en `docs/decisions.md`
**Accounts**: Vercel Blob (`BLOB_READ_WRITE_TOKEN`), pedido al inicio de la fase; cuando llega, `exportContent()` empieza a respaldar en Blob en producción
**Research flag**: sí. `@react-pdf/renderer` 4.9 con React 19.3 y el trazado de fuentes en Vercel (spike el día 5); entrada exacta de `@tiptap/static-renderer`; recetas de TanStack Table v9 (la DataTable de shadcn es v8); Draft Mode con `'use cache'`
**Notes**: El gate depende de que el contenido de la fase 1 esté completo. Las subidas de imágenes son de cliente por el límite de 4.5 MB de las funciones. El PDF usa los TTF estáticos de `assets/fonts-pdf/` con `outputFileTracingIncludes` y sin guionado inglés sobre texto en español.

### Phase 4: Sitio público

**Goal**: Un cliente o reclutador lee en inglés o español un caso de estudio que le muestra qué problema había, qué hizo Teo, qué resultado tuvo y qué decidió técnicamente y por qué, y desde ahí puede contactarlo; aquí se entrega el valor central
**Depends on**: Phase 3
**Requirements**: CASE-01, CASE-02, CASE-03, CASE-04, CASE-05, CASE-06, CASE-07, SITE-01, SITE-02, SITE-03, SITE-04, SITE-05, SITE-06, SITE-07, CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, SEO-01, SEO-02, SEO-03, MOTN-01, MOTN-02, MOTN-03, MOTN-04, QUAL-01, QUAL-02, QUAL-04
**Success Criteria** (what must be TRUE):

  1. En `/projects/[slug]` y `/es/proyectos/[slug]` el visitante lee cabecera con fila meta en mono, resumen con hasta 3 métricas con su fuente, portada, secciones 01 a 05 (las vacías no aparecen) y las decisiones técnicas como notas al margen (debajo del párrafo en móvil); el inventario se presenta como "Herramienta interna, datos de ejemplo" con demostración por contacto; cada caso cierra con anterior/siguiente y llamada a contacto, y un proyecto publicado después del deploy se abre sin redeploy
  2. En `/` el visitante ve el hero elegido, la línea de estado (disponibilidad, Medellín, UTC-5, hora local en vivo y solapamiento con Toronto y Madrid correcto en horario de verano) y los proyectos como entradas fechadas; en `/about` ve bio, Now fechada, stack con años, experiencia, educación e idiomas; cambia de idioma sin perder la página, cambia de tema con View Transitions sin destello al cargar y la preferencia persiste; el footer enlaza GitHub, LinkedIn, el CV y el código fuente
  3. Desde `/contact` o `/es/contacto` el visitante envía nombre, email y mensaje y ve la confirmación en su idioma; el mensaje queda guardado y llega a Teo por Resend con el `replyTo` del visitante; un honeypot lleno o un envío en menos de ~3 s se descarta en silencio, pasar el límite por IP se rechaza y, si Upstash no responde, también; el botón copia el email y el enlace abre Cal.com
  4. Cada página pública tiene título, descripción, OG y hreflang (`en`, `es`, `x-default`) en su idioma, y `sitemap.xml` y `robots.txt` listan ambos idiomas sin `/admin`; el movimiento se limita a un reveal escalonado, el H1 del hero partido por palabras sin CLS y como máximo una escena scrubbed por página, y con `prefers-reduced-motion: reduce` todo aparece sin animación
  5. `/impeccable:audit` no reporta hallazgos críticos en ninguna vista pública, y Lighthouse móvil da ≥ 95 con LCP ≤ 2.5 s, INP ≤ 200 ms y CLS ≤ 0.1 en `/`, `/projects/[slug]`, `/about` y `/contact` en ambos idiomas, medido en el Preview de Vercel

**Plans**: 14/14 plans executed; 04-13 y 04-14 cierran los gaps de la verificación (CR-01, WR-02, WR-03)
Plans:
**Wave 1**

- [x] 04-01-PLAN.md — Tracer de rutas /about y /contact con un solo main, todos los textos de la fase y decisiones
- [x] 04-12-PLAN.md — Primitivas compartidas: Reveal y CSS de la fase, PageSection, SegmentLine, CopyEmail, texto plano, siteUrl
- [x] 04-02-PLAN.md — Petición única a Teo: DNS y clave de Resend, Upstash, URL de Cal.com, método de Lighthouse, contenido de ManuJ

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 04-03-PLAN.md — Header con nav y LangSwitch, tema sin destello con View Transitions, footer
- [x] 04-04-PLAN.md — Caso de estudio completo: cabecera, métricas, portada, 01–05, Marginalia, galería con pies, anterior/siguiente y CTA
- [x] 04-06-PLAN.md — Formulario de contacto con honeypot, tiempo y límite que falla cerrado; columna email_sent_at (migración 0003) y marca en /admin/mensajes

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 04-05-PLAN.md — Escena scrubbed del número de sección, capturas e impeccable del caso
- [x] 04-07-PLAN.md — Otras vías de contacto (copiar email, Cal.com), confirmación segura con Activity, envío real, capturas e impeccable
- [x] 04-08-PLAN.md — Home: entradas fechadas, hora en vivo y solapamiento con horario de verano, SplitText del H1, capturas e impeccable
- [x] 04-09-PLAN.md — About con Now fechada, stack con años, experiencia, educación e idiomas, capturas e impeccable

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 04-10-PLAN.md — SEO: metadatos, hreflang, imágenes OG por página y caso, sitemap y robots

**Wave 5** *(blocked on Wave 4 completion)*

- [x] 04-11-PLAN.md — Compuerta: Lighthouse móvil en el Preview, plan B de SplitText si hace falta, reduced motion, teclado, acento e impeccable de todas las vistas

**Gap closure** *(after Wave 5)*

- [x] 04-13-PLAN.md — CR-01: el formulario de contacto sobrevive a un fallo de la Server Action (alerta con mailto) y error.tsx localizado en [locale] con reintento y mailto
- [x] 04-14-PLAN.md — WR-02 par completo de credenciales Upstash, WR-03 capturedAt imposible no rompe el caso, trazabilidad de REQUIREMENTS.md (depende de 04-13)

**UI hint**: yes
**Window**: días 8–10
**Gate**: impeccable sin críticos + Lighthouse móvil ≥ 95
**Approvals**: ninguna de la tabla de aprobaciones; cualquier animación fuera del presupuesto o servicio externo adicional se pregunta antes de escribirlo
**Accounts**: Resend (`RESEND_API_KEY` y verificación del dominio en Porkbun, que se arranca la primera mañana por la propagación DNS), Upstash (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) y Cal.com (URL del evento, que Teo carga en SiteSettings desde el admin)
**Research flag**: no en general (patrones documentados); solo comprobar GSAP dentro de `<Activity>` y SplitText después de cargar las fuentes
**Notes**: Después de cada vista: capturas con Playwright en 390, 768 y 1440 px en claro y oscuro, `/impeccable:audit` y `/impeccable:critique`, con hallazgos reportados antes de seguir. La hora en vivo es una hoja de cliente; el shell prerenderizado solo usa datos guardados. Los casos de estudio van primero: si el tiempo aprieta, el resto queda sobrio.

### Phase 5: Pulido y lanzamiento

**Goal**: El sitio es accesible, está medido, lo revisaron tres personas reales y está en producción en mateojaras.dev
**Depends on**: Phase 4
**Requirements**: SITE-08, QUAL-03, QUAL-05, QUAL-06, QUAL-07, QUAL-08, QUAL-09
**Success Criteria** (what must be TRUE):

  1. Solo con teclado, y con `prefers-reduced-motion` activo, un visitante recorre todas las rutas públicas en ambos idiomas con foco visible, axe no reporta problemas `serious` ni `critical` (WCAG AA), y una URL inexistente muestra la página 404 en el idioma del visitante
  2. Los tests e2e de Playwright de login, CRUD de proyecto y contacto pasan en CI
  3. La CSP está en modo de bloqueo sin violaciones en las rutas públicas y analytics registra visitas con esa CSP activa, sin que los resultados de Lighthouse de la fase 4 bajen de 95
  4. Tres personas revisaron el sitio, y sus hallazgos están registrados y resueltos
  5. mateojaras.dev sirve el sitio de producción en ambos idiomas contra la rama `main` de Neon

**Plans**: TBD
**Window**: días 11–12 pulido; días 13–14 margen y lanzamiento
**Gate**: revisión por 3 personas hecha + sitio en producción
**Approvals**: `@vercel/analytics` (y opcionalmente `@vercel/speed-insights`) y el servicio de analytics
**Accounts**: analytics; Google Search Console en el lanzamiento; DNS de mateojaras.dev en Porkbun apuntando a Vercel
**Research flag**: no (auditorías)
**Notes**: El 404 sigue `DESIGN.md` y pasa por las mismas capturas y auditorías que las demás vistas públicas. La pasada de reduced motion confirma lo construido en la fase 4.

## Coverage

76 de 76 requisitos v1 mapeados, cada uno a una sola fase.

| Phase | Requirements | Count |
|-------|--------------|-------|
| 1. Identidad y contenido | IDEN-01 a IDEN-04 | 4 |
| 2. Base técnica | BASE-01 a BASE-11, AUTH-01 a AUTH-04 | 15 |
| 3. Panel admin + CV | ADMN-01 a ADMN-13, CV-01 a CV-05, IDEN-05 a IDEN-07 | 21 |
| 4. Sitio público | CASE-01 a CASE-07, SITE-01 a SITE-07, CONT-01 a CONT-05, SEO-01 a SEO-03, MOTN-01 a MOTN-04, QUAL-01, QUAL-02, QUAL-04 | 29 |
| 5. Pulido y lanzamiento | SITE-08, QUAL-03, QUAL-05, QUAL-06, QUAL-07, QUAL-08, QUAL-09 | 7 |

Ubicaciones que se apartan de la agrupación por categoría:

- QUAL-01, QUAL-02 y QUAL-04 (Lighthouse, Web Vitals, impeccable) van en la fase 4 porque son literalmente su compuerta; la fase 5 solo comprueba que no retrocedan tras activar analytics y la CSP en bloqueo.
- SITE-08 (404) va en la fase 5 porque `PROJECT.md` raíz lo pone en Pulido.
- ADMN-13 (bandeja de mensajes) se construye en la fase 3 con el resto del admin; se ve con datos reales cuando el formulario de la fase 4 recibe el primer mensaje.
- MOTN-04 (reduced motion) se construye en la fase 4 junto a cada animación, como exige CLAUDE.md; la fase 5 lo vuelve a verificar en la pasada de accesibilidad.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Identidad y contenido | 13/13 | Complete    | 2026-11-01 |
| 2. Base técnica | 9/9 | Complete    | 2026-11-16 |
| 3. Panel admin + CV | 14/14 | Complete    | 2026-11-22 |
| 4. Sitio público | 14/14 | In Progress | - |
| 5. Pulido y lanzamiento | 0/TBD | Not started | - |
