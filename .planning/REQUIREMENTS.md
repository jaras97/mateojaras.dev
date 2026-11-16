# Requirements: mateojaras.dev

**Defined:** 2026-10-29
**Core Value:** Los casos de estudio (`/projects/[slug]`) convencen a un cliente o reclutador de que Teo sabe decidir y entregar.

Convenciones: "Teo" es el único admin; "visitante" es cualquier cliente o reclutador. Toda ruta pública existe en `en` (`/`) y `es` (`/es`). Si falta contenido, el bloque no se renderiza.

## v1 Requirements

### Identidad y contenido (IDEN)

- [x] **IDEN-01**: DESIGN.md pasa a APROBADO con las dos frases del concepto escritas por Teo
- [x] **IDEN-02**: Tokens OKLCH (claro y oscuro), escala tipográfica y tema shadcn propio viven en `globals.css`
- [x] **IDEN-03**: Funnel Display, Hanken Grotesk y Geist Mono se sirven self-hosted con `next/font` (latin + latin-ext) y TTF estáticos para el PDF en `assets/fonts-pdf/`
- [x] **IDEN-04**: Existen 3 variantes del hero en código como componentes presentacionales tipados contra el contrato de `site_settings`, y Teo elige una
- [ ] **IDEN-05**: `docs/content/` tiene, por cada uno de los 4 proyectos, tagline, problema, rol, solución, resultados, 2–3 decisiones técnicas, URLs, permiso del cliente y la fuente de cada métrica (en/es)
- [x] **IDEN-06**: `material/` tiene al menos 3 capturas 16:10 por proyecto (el inventario con datos ficticios, marcado como tal)
- [x] **IDEN-07**: `docs/copy.md` no tiene marcadores: hero, about, now, experiencia y contacto escritos por Teo en en/es

### Base técnica (BASE)

- [ ] **BASE-01**: Esquema Drizzle de `docs/data-model.md` (más `site_settings.languages` en CEFR) aplicado por migración en Neon `dev` y `main`
- [x] **BASE-02**: Dos root layouts (`app/[locale]` y `app/admin`) y el layout del scaffold eliminado
- [ ] **BASE-03**: `proxy.ts` aplica las reescrituras de next-intl (rutas localizadas en `/es`) y la comprobación de la cookie en `/admin`
- [ ] **BASE-04**: El idioma se lee con `next/root-params` en RSC y se pasa explícito a Server Actions y Route Handlers; `/` siempre es inglés (sin detección)
- [x] **BASE-05**: Las consultas públicas usan `'use cache'` + `cacheTag` por entidad, escritas como núcleo sin caché más envoltorio cacheado, y respetan Draft Mode
- [x] **BASE-06**: `pnpm seed` carga el contenido real de `docs/content/` (al menos un proyecto publicado) y crea el único usuario admin desde variables de entorno
- [x] **BASE-07**: `exportContent()` escribe `content/*.json` en local y en Blob en producción (se omite con aviso hasta que exista el token), y el seed puede restaurar desde esos archivos
- [x] **BASE-08**: Esqueleto público: `/`, `/es`, `/projects/[slug]` y `/es/proyectos/[slug]` muestran títulos reales desde la base, prerenderizados
- [ ] **BASE-09**: Decisión go/no-go del plan B (`cacheComponents` vs ISR) al final del día 3, registrada en `docs/decisions.md`
- [ ] **BASE-10**: CI corre `pnpm check` en cada push; Vercel Preview despliega contra Neon `dev` con migraciones en el build
- [ ] **BASE-11**: CSP y cabeceras de seguridad estáticas en `next.config.ts` (sin nonce), primero en modo Report-Only

### Autenticación (AUTH)

- [ ] **AUTH-01**: Teo inicia sesión en `/admin` con email y contraseña; el registro está deshabilitado
- [ ] **AUTH-02**: La sesión persiste entre recargas y Teo puede cerrarla
- [ ] **AUTH-03**: Cualquier ruta, loader, Server Action o endpoint de subida del admin rechaza peticiones sin sesión válida (verificado en servidor, no solo en el proxy)
- [ ] **AUTH-04**: El login funciona en las URLs de Vercel Preview y en producción

### Panel admin (ADMN)

- [ ] **ADMN-01**: La interfaz del admin está en español (locale fijo `es`)
- [ ] **ADMN-02**: Teo edita SiteSettings: titular, bio, Now (Tiptap), disponibilidad y fecha, ciudad, zona horaria, idiomas, enlaces, URL de Cal.com y SEO, en/es
- [ ] **ADMN-03**: Teo crea, edita y elimina proyectos con todos los campos del caso de estudio, incluidas las decisiones técnicas y las métricas con su fuente en la etiqueta
- [ ] **ADMN-04**: Teo crea, edita y elimina experiencias, skills y educación
- [ ] **ADMN-05**: Cada entidad de contenido tiene acciones separadas de Guardar borrador y Publicar, y un interruptor de visible
- [ ] **ADMN-06**: Teo reordena proyectos, experiencias y skills arrastrando (dnd-kit), con alternativa de teclado
- [ ] **ADMN-07**: Los campos en/es se editan lado a lado y los que faltan en español se marcan como vacíos
- [ ] **ADMN-08**: Teo sube imágenes a Vercel Blob desde el navegador (subida de cliente) y cada imagen exige alt en/es
- [ ] **ADMN-09**: El slug de un proyecto queda fijo una vez publicado
- [ ] **ADMN-10**: Cmd+S guarda el formulario actual y salir con cambios sin guardar pide confirmación
- [ ] **ADMN-11**: Teo previsualiza un borrador en su ruta pública real (Draft Mode) antes de publicarlo
- [ ] **ADMN-12**: Cada guardado invalida con `updateTag` solo las etiquetas afectadas y el cambio se ve en el sitio sin redeploy
- [ ] **ADMN-13**: Teo ve en el admin los mensajes recibidos por el formulario de contacto

### CV y JSON Resume (CV)

- [ ] **CV-01**: Teo genera desde el admin el CV en PDF en/es a partir de los datos; la copia se guarda en Blob y en `resume_versions`
- [ ] **CV-02**: `/cv/en.pdf` y `/cv/es.pdf` sirven la última copia generada
- [ ] **CV-03**: El PDF es de una columna, con capa de texto real, sin foto, y tildes y ñ correctas (verificado por un test de extracción de texto)
- [ ] **CV-04**: Teo ve el historial de PDFs generados y puede descargar cualquiera
- [ ] **CV-05**: `/resume.json` (en) y `/resume.es.json` (es) sirven el JSON Resume generado en vivo desde los mismos datos

### Casos de estudio (CASE)

- [ ] **CASE-01**: El visitante ve en `/projects/[slug]` (y `/es/proyectos/[slug]`) cabecera con fila meta en mono, resumen (problema, rol, hasta 3 métricas) e imagen de portada
- [ ] **CASE-02**: Secciones numeradas 01 Problema, 02 Mi rol, 03 Solución (con galería), 04 Resultados, 05 Decisiones técnicas; cada sección se oculta si no hay datos
- [ ] **CASE-03**: Las decisiones técnicas se muestran como notas al margen (`Marginalia`) con lo descartado, el trade-off y cómo se verificó; en móvil pasan debajo del párrafo
- [ ] **CASE-04**: El cuerpo en Tiptap se renderiza en servidor con `@tiptap/static-renderer`, sin enviar el editor al navegador
- [ ] **CASE-05**: Un proyecto sin URL pública se marca como "Herramienta interna, datos de ejemplo" y ofrece una demostración por contacto
- [ ] **CASE-06**: Al final de cada caso hay navegación al anterior/siguiente y una llamada a contacto
- [ ] **CASE-07**: Un proyecto publicado después del deploy se puede abrir sin redeploy

### Sitio público (SITE)

- [ ] **SITE-01**: El visitante ve en `/` el hero elegido, la línea de estado y la lista de proyectos como entradas fechadas (sin cards)
- [ ] **SITE-02**: La línea de estado muestra disponibilidad, ciudad, UTC-5 y las horas de solapamiento con Toronto y Madrid, respetando el horario de verano
- [ ] **SITE-03**: La línea de estado muestra la hora local de Medellín en vivo (componente de cliente que no rompe el prerender)
- [ ] **SITE-04**: El visitante ve en `/about` la bio, la sección Now fechada, el stack con años (sin barras de nivel), la experiencia, la educación y los idiomas
- [ ] **SITE-05**: El visitante cambia de idioma y permanece en la página equivalente
- [ ] **SITE-06**: El visitante cambia entre tema claro y oscuro con View Transitions, sin destello al cargar, y la preferencia persiste
- [ ] **SITE-07**: El footer enlaza GitHub, LinkedIn, el CV en PDF y el código fuente del sitio
- [ ] **SITE-08**: Existe una página 404 en ambos idiomas

### Contacto (CONT)

- [ ] **CONT-01**: El visitante envía nombre, email y mensaje desde `/contact` (o `/es/contacto`) y ve la confirmación en su idioma
- [ ] **CONT-02**: El mensaje se guarda en `contact_messages` antes de enviarse y llega a Teo por Resend con `replyTo` del visitante
- [ ] **CONT-03**: Los envíos con honeypot lleno o hechos en menos de ~3 s se descartan sin avisar al bot
- [ ] **CONT-04**: Upstash limita los envíos por IP (3–5 por hora) y el límite falla cerrado si Upstash no responde
- [ ] **CONT-05**: El visitante copia el email con un botón y abre Cal.com con un enlace simple (sin embed)

### SEO e i18n (SEO)

- [ ] **SEO-01**: Cada página pública tiene título, descripción y OG en su idioma, desde SiteSettings y el contenido
- [ ] **SEO-02**: Cada página declara hreflang `en`, `es` y `x-default`
- [ ] **SEO-03**: `sitemap.xml` y `robots.txt` incluyen las rutas de ambos idiomas y excluyen `/admin`

### Movimiento (MOTN)

- [ ] **MOTN-01**: Un reveal escalonado al cargar (`<Reveal>`) sobre los bloques de primer nivel
- [ ] **MOTN-02**: El H1 del hero entra partido por palabras con SplitText, después de cargar las fuentes y sin causar CLS
- [ ] **MOTN-03**: Como máximo una escena scrubbed con ScrollTrigger por página
- [ ] **MOTN-04**: Con `prefers-reduced-motion: reduce` todo aparece sin animación; solo se animan `transform` y `opacity`

### Calidad y lanzamiento (QUAL)

- [ ] **QUAL-01**: Lighthouse móvil ≥ 95 en `/`, `/projects/[slug]`, `/about` y `/contact` en ambos idiomas, medido en el Preview de Vercel
- [ ] **QUAL-02**: LCP ≤ 2.5 s, INP ≤ 200 ms y CLS ≤ 0.1 en esas rutas
- [ ] **QUAL-03**: WCAG AA, foco visible, navegación por teclado y axe sin `serious`/`critical`
- [ ] **QUAL-04**: `/impeccable:audit` sin hallazgos críticos en cada vista pública
- [ ] **QUAL-05**: Tests e2e de Playwright para login, CRUD de proyecto y contacto
- [ ] **QUAL-06**: CSP en modo de bloqueo sin violaciones en las rutas públicas
- [ ] **QUAL-07**: Analytics instalado (con la CSP ajustada)
- [ ] **QUAL-08**: 3 personas revisan el sitio y los hallazgos se registran y resuelven
- [ ] **QUAL-09**: El sitio está en producción en mateojaras.dev

## v2 Requirements

Diferidos. Se registran pero no entran al roadmap actual.

- **V2-01**: Editor de overrides del CV (ajustes solo para el PDF)
- **V2-02**: Bloque de experiencia relacionada en el caso de estudio
- **V2-03**: Historial de slugs con redirecciones
- **V2-04**: CSP por hash (`experimental.sri`)
- Todo `docs/backlog.md` (cursos, servicios, testimonios, blog, ⌘K, GitHub en vivo, guestbook, changelog, demo del admin, traducción con IA, Lenis, Typst, Sentry)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Precios o tarifas | Decisión de Teo |
| Registro o más de un admin | Un solo usuario; menos superficie de ataque |
| CAPTCHA en contacto | Fricción; honeypot + tiempo + rate limit bastan |
| Respuesta automática por email | Ruido; Teo responde en persona |
| Visor de PDF incrustado o CV detrás de email | Fricción para el reclutador |
| Embed de Cal.com | Carga un script de terceros y pone en riesgo Lighthouse ≥ 95 |
| Carruseles, contadores animados, barras de skill | Anti-patrones de la dirección de arte |
| Historial de revisiones del contenido | El respaldo en `content/*.json` cubre la recuperación |
| Ruta propia `/now` | Now es una sección de `/about` (decisión 2026-10-29) |
| Librerías de efectos, 3D, scroll suave, cursores custom | Prohibido en CLAUDE.md y DESIGN.md |
| Métricas sin fuente o proyectos inventados | Destruye la credibilidad del caso de estudio |

## Aprobaciones pendientes (se piden en la fase indicada)

| Aprobación | Fase |
|------------|------|
| `yaml@2.9.1` como devDependency exacta (contrato de `docs/content` y, en la fase 2, el seed). Se pide en G1 (01-03); sin respuesta, no se instala | 1 |
| `@axe-core/playwright@4.14.0`: se adelanta a la fase 1 (01-08) solo si Teo lo aprueba en G1 y lo verifica en npm (01-03); si no, sigue en el lote de la fase 2 | 1 / 2 |
| Cómo llegan a la base de datos la etiqueta y la fuente en inglés de cada métrica: `docs/content` las guarda en en y es (`labelEs`/`labelEn`, `sourceEs`/`sourceEn`; decidió Teo el 2026-10-30), mientras el esquema (`metrics: {label, value}[]`, D-11) y `docs/data-model.md` no cambian en la fase 1 | 2 |
| React 19.3.0 → 19.3.1 y dependencias directas (`@tiptap/pm`, `@tiptap/static-renderer`, `@dnd-kit/utilities`, `server-only`, `@testing-library/dom`, `@testing-library/user-event`, `@axe-core/playwright` (solo si no se adelantó en G1 de la fase 1: ver la fila de arriba y `01-03-ANSWERS.md`), `tsx`, `@types/node@^24`) | 2 |
| `site_settings.languages` en `docs/data-model.md` (aprobado 2026-10-29; falta editar el doc) | 2 |
| Corregir el CLI de Better Auth en `docs/data-model.md` (`auth` en vez de `@better-auth/cli`) | 2 |
| Enmendar CLAUDE.md: `proxy.ts` también aplica las reescrituras de next-intl; validación de sesión con AuthGate en `<Suspense>` + `requireSession()` | 2 |
| Rutas nuevas `/cv/en.pdf`, `/cv/es.pdf`, `/resume.es.json` y endpoints internos | 3 |
| `@vercel/analytics` (y el servicio) | 5 |

## Traceability

Cada requisito v1 está en exactamente una fase de `.planning/ROADMAP.md`.

| Requirement | Phase | Status |
|-------------|-------|--------|
| IDEN-01 | Phase 1 | Complete |
| IDEN-02 | Phase 1 | Complete |
| IDEN-03 | Phase 1 | Complete |
| IDEN-04 | Phase 1 | Complete |
| IDEN-05 | Phase 3 | Pending |
| IDEN-06 | Phase 3 | Complete |
| IDEN-07 | Phase 3 | Complete |
| BASE-01 | Phase 2 | Pending |
| BASE-02 | Phase 2 | Complete |
| BASE-03 | Phase 2 | Pending |
| BASE-04 | Phase 2 | Pending |
| BASE-05 | Phase 2 | Complete |
| BASE-06 | Phase 2 | Complete |
| BASE-07 | Phase 2 | Complete |
| BASE-08 | Phase 2 | Complete |
| BASE-09 | Phase 2 | Pending |
| BASE-10 | Phase 2 | Pending |
| BASE-11 | Phase 2 | Pending |
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| ADMN-01 | Phase 3 | Pending |
| ADMN-02 | Phase 3 | Pending |
| ADMN-03 | Phase 3 | Pending |
| ADMN-04 | Phase 3 | Pending |
| ADMN-05 | Phase 3 | Pending |
| ADMN-06 | Phase 3 | Pending |
| ADMN-07 | Phase 3 | Pending |
| ADMN-08 | Phase 3 | Pending |
| ADMN-09 | Phase 3 | Pending |
| ADMN-10 | Phase 3 | Pending |
| ADMN-11 | Phase 3 | Pending |
| ADMN-12 | Phase 3 | Pending |
| ADMN-13 | Phase 3 | Pending |
| CV-01 | Phase 3 | Pending |
| CV-02 | Phase 3 | Pending |
| CV-03 | Phase 3 | Pending |
| CV-04 | Phase 3 | Pending |
| CV-05 | Phase 3 | Pending |
| CASE-01 | Phase 4 | Pending |
| CASE-02 | Phase 4 | Pending |
| CASE-03 | Phase 4 | Pending |
| CASE-04 | Phase 4 | Pending |
| CASE-05 | Phase 4 | Pending |
| CASE-06 | Phase 4 | Pending |
| CASE-07 | Phase 4 | Pending |
| SITE-01 | Phase 4 | Pending |
| SITE-02 | Phase 4 | Pending |
| SITE-03 | Phase 4 | Pending |
| SITE-04 | Phase 4 | Pending |
| SITE-05 | Phase 4 | Pending |
| SITE-06 | Phase 4 | Pending |
| SITE-07 | Phase 4 | Pending |
| SITE-08 | Phase 5 | Pending |
| CONT-01 | Phase 4 | Pending |
| CONT-02 | Phase 4 | Pending |
| CONT-03 | Phase 4 | Pending |
| CONT-04 | Phase 4 | Pending |
| CONT-05 | Phase 4 | Pending |
| SEO-01 | Phase 4 | Pending |
| SEO-02 | Phase 4 | Pending |
| SEO-03 | Phase 4 | Pending |
| MOTN-01 | Phase 4 | Pending |
| MOTN-02 | Phase 4 | Pending |
| MOTN-03 | Phase 4 | Pending |
| MOTN-04 | Phase 4 | Pending |
| QUAL-01 | Phase 4 | Pending |
| QUAL-02 | Phase 4 | Pending |
| QUAL-03 | Phase 5 | Pending |
| QUAL-04 | Phase 4 | Pending |
| QUAL-05 | Phase 5 | Pending |
| QUAL-06 | Phase 5 | Pending |
| QUAL-07 | Phase 5 | Pending |
| QUAL-08 | Phase 5 | Pending |
| QUAL-09 | Phase 5 | Pending |

**Coverage:**

- v1 requirements: 76 total
- Mapped to phases: 76 (fase 1: 7, fase 2: 15, fase 3: 18, fase 4: 29, fase 5: 7)
- Unmapped: 0

---
*Requirements defined: 2026-10-29*
*Last updated: 2026-10-29 after roadmap creation (traceability)*
