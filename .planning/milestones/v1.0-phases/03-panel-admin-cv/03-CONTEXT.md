# Phase 3: Panel admin + CV - Context

**Gathered:** 2026-11-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Días 5–7. Teo administra todo el contenido del sitio desde `/admin` (en español), sin tocar código ni redeploy: SiteSettings, proyectos, experiencia, skills y educación, con borrador/publicar, visible, reordenar, en/es lado a lado, subida de imágenes a Blob, Draft Mode, Cmd+S y aviso de cambios sin guardar. Desde los mismos datos genera el CV en PDF en/es (snapshot en Blob + `resume_versions`), sirve `/cv/{en,es}.pdf` y `/resume{,.es}.json`, y tiene una bandeja de mensajes de contacto. La fase cierra con el contenido real cargado por Teo desde el admin (IDEN-05/06/07).

Requisitos: ADMN-01 a ADMN-13, CV-01 a CV-05, IDEN-05, IDEN-06, IDEN-07. Fuera de esta fase: el diseño público de los casos de estudio, SEO y movimiento (fase 4), el formulario de contacto con Resend/Upstash (fase 4; aquí solo la bandeja), y todo lo de `docs/backlog.md`.

</domain>

<decisions>
## Implementation Decisions

### Borrador y publicación
- **D-01:** Editar algo ya publicado y pulsar "Guardar borrador" **no toca el sitio público**: sigue la versión publicada y los cambios salen solo con "Publicar". Requiere guardar los cambios pendientes aparte de la versión publicada (columnas de borrador o un JSON de cambios pendientes por fila; el mecanismo lo elige el planner). Teo aprueba el cambio en `docs/data-model.md` y la migración nueva (eligió la opción que lo decía explícitamente). Se registra en `docs/decisions.md` como decisión de Teo. — **Reversibility:** one-way — añade columnas y una migración aplicada en Neon `dev` y `main`; quitarlas exige otra migración y reescribir queries y actions.
- **D-02:** El flujo borrador/publicar aplica a **todas** las entidades de contenido: proyectos, experiencia, skills, educación y SiteSettings (ADMN-05). Ojo: `site_settings` hoy no tiene `status`; entra en el mismo cambio de esquema de D-01. Las queries públicas siguen leyendo solo lo publicado y visible.
- **D-03:** Draft Mode (ADMN-11): botón "Previsualizar" en el formulario que abre en pestaña nueva la ruta pública real (`/projects/[slug]` o `/es/proyectos/[slug]`, y la home para SiteSettings) con el borrador y una banda visible "Vista previa" con salida. Ruta interna `/api/draft` para activar y desactivar (aprobada en D-13). Sin panel lado a lado ni iframe.

### CV
- **D-04:** Hasta **2 páginas**, una columna, sin foto, capa de texto real (CV-03).
- **D-05:** Proyectos en el CV: **solo los marcados `featured`** (columna existente), publicados y visibles.
- **D-06:** El resumen que abre el CV es el **titular + bio de SiteSettings**. Una sola fuente de verdad.
- **D-07:** **Sin overrides en v1.** El PDF sale tal cual de los datos; la columna `resume_versions.overrides` queda sin UI (no se borra).
- **D-08:** El CV público es la **copia generada y guardada en Blob** (snapshot), no un render en vivo. Se genera a mano desde `/admin/cv`; `/cv/en.pdf` y `/cv/es.pdf` sirven la última versión; el historial lista y descarga todas (CV-04). Rutas versionadas en Blob (`resume/<locale>/v<n>.pdf`), nunca sobrescritas. Aprobado por Teo; se registra en `docs/decisions.md`.

### Cierre de la fase con contenido real
- **D-09:** El último plan es una **sesión de carga de Teo** (checkpoint humano bloqueante): él carga desde los formularios los 4 proyectos (narrativa, decisiones técnicas, métricas con fuente), los bullets de Sofka, las capturas 16:10 con alt en/es, el copy en/es, y genera el CV. La fase cierra cuando Teo dice "listo". El gate del ROADMAP no cambia. Los planes anteriores construyen y verifican el admin sobre los datos del seed.
- **D-10:** Inventario y Finanzas siguen en `draft`. Teo decide en la sesión de carga si los publica o los deja ocultos; nada se publica sin su sí. El código no asume ninguno de los dos casos.

### Experiencia de edición
- **D-11:** El formulario de proyecto es **una sola página con secciones numeradas** (01 Básico, 02 Caso, 03 Decisiones, 04 Métricas, 05 Media, o similar) y un índice lateral, en línea con "la bitácora de un taller". Cmd+S guarda el formulario entero (ADMN-10). Las demás entidades siguen el mismo patrón, más corto.
- **D-12:** Campos bilingües en **dos columnas: ES a la izquierda, EN a la derecha**; en móvil se apilan (ES primero). Un campo ES vacío muestra la marca "Falta ES" (ADMN-07).
- **D-14:** Eliminar proyectos, experiencias, skills y educación es **borrado definitivo con confirmación** (diálogo donde Teo escribe el nombre). La recuperación es el export a `content/*.json` / Blob.
- **D-15:** Bandeja de mensajes (ADMN-13): lista con lo más reciente arriba, leer, marcar leído/no leído (con `read_at`) y eliminar, y contador de no leídos en la navegación. Vacía hasta la fase 4.

### Aprobaciones de la fase (dadas por Teo en esta discusión)
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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Alcance y reglas
- `PROJECT.md` (raíz): manda sobre `.planning/`. Fases, compuertas, prohibiciones, autonomía y variables de entorno.
- `CLAUDE.md` (raíz): convenciones (mutación = Server Action con Zod → sesión → Drizzle → `updateTag` → `exportContent()`), regla de cuentas y claves, seguridad, verificación.
- `.claude/CLAUDE.md`: investigación del stack. §4 (Better Auth / `requireSession()`), §6 (Tiptap + static-renderer), §7 (@react-pdf/renderer, fuentes, `renderToBuffer`, hyphenation), §8 (Vercel Blob, client upload, `onBeforeGenerateToken`), §10 (RHF + Zod + React Compiler), §11 (TanStack Table v9), §12 (dnd-kit), "What NOT to Use".
- `AGENTS.md` y `node_modules/next/dist/docs/`: leer antes de escribir código de Next 16.4. En especial Draft Mode con `'use cache'`/Cache Components, `updateTag.md`, `authentication-with-cache-components.md`, route handlers y `serverExternalPackages`/`outputFileTracingIncludes`.
- `.planning/REQUIREMENTS.md`: ADMN-01..13, CV-01..05, IDEN-05..07.
- `.planning/ROADMAP.md` (Phase 3): criterios de éxito, gate, aprobaciones, cuentas, research flag y notas.

### Datos y contenido
- `docs/data-model.md`: esquema, helpers (`localized`, `tags`), reglas de queries/actions/export. Se edita según D-01/D-02 (aprobado).
- `docs/content/README.md` y `docs/content/*.md`: contrato y hechos de los 4 proyectos (lo verificable ya sembrado; la narrativa la carga Teo).
- `docs/copy.md`: copy en/es aceptado en G6 (traducciones EN en `draft-translation` hasta que Teo las apruebe).
- `docs/decisions.md`: registro; aquí entran D-01, D-08, D-13, D-16 y la llegada del token de Blob.
- `docs/backlog.md`: lo que no se construye (p. ej. "traducir con IA", demo read-only del admin).
- `DESIGN.md` (APROBADO): tokens, tipografía y prohibiciones para el admin y el PDF.

### Prior phase context
- `.planning/phases/02-base-t-cnica/02-CONTEXT.md`: D-05 (seed y pendingFields), D-06 (seed nunca en build), D-08 (admin en español, `getTranslations({ locale: 'es' })`).
- `.planning/phases/01-identidad-y-contenido/01-CONTEXT.md`: G7 (Teo carga contenido, capturas, alt y traducciones desde el admin).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/admin/(panel)/layout.tsx` + `_components/auth-gate.tsx`: AuthGate en `<Suspense>`; la navegación del admin se monta aquí.
- `src/lib/dal.ts` (`requireSession()`), `src/lib/auth.ts`: sesión para cada loader, action y `/api/blob/upload`.
- `src/lib/cache-tags.ts`: `settings`, `projects`, `project(slug)`, `experience`, `skills`, `resume` (añadir `education` si hace falta).
- `src/lib/content-export.ts`: `exportContent()` ya escribe local y a Blob (`put`) en producción; allowlist de 9 tablas (contact_messages excluida).
- `src/lib/i18n-fields.ts` (`localized`), `src/lib/format.ts`, `src/lib/messages.ts` (paridad de claves en/es con test).
- `src/features/*/schema.ts`: todas las tablas ya existen (incl. `resume_versions`, `contact_messages`); `src/features/projects/queries.ts` y `site-settings/queries.ts` son el patrón de query pública cacheada.
- `src/app/admin/login/login-form.tsx` + `zod-jitless.ts`: patrón RHF + Zod ya probado bajo React Compiler.
- `src/components/ui/{button,input,label}.tsx`: tema propio; el resto se añade con shadcn (D-16).
- `assets/fonts-pdf/`: Funnel Display (Bold, SemiBold), Hanken Grotesk (Regular, Bold, Italic), Geist Mono Regular, con OFL.

### Established Patterns
- Feature folders `src/features/<entidad>/{schema,queries,actions,validation}.ts` + `components/`.
- `pnpm check` = typecheck + lint + test + build; e2e en `e2e/` contra `pnpm build && pnpm start` con Neon `dev` sembrado.
- Cache Components activo (GO del plan B): las queries públicas con `'use cache'` + `cacheTag`; lo de sesión dentro de `<Suspense>`.

### Integration Points
- Esquema: nuevas columnas de borrador (D-01/D-02) → `pnpm db:generate` + migración 0002; `content-export` y `seed --from-content` deben seguir haciendo el ciclo sin pérdida.
- `next.config.ts`: `outputFileTracingIncludes` para `assets/fonts-pdf/**` en las rutas del CV; CSP debe permitir el host de Blob en `img-src`/`connect-src`.
- Rutas públicas existentes (`src/app/[locale]/page.tsx`, `projects/[slug]/page.tsx`) deben respetar Draft Mode (D-03).

</code_context>

<specifics>
## Specific Ideas

- El test de extracción del PDF busca á, é, í, ó, ú y ñ intactas en ambos idiomas (gate de la fase).
- `/resume.json` y `/resume.es.json` se generan en vivo (no snapshot) y validan contra el esquema JSON Resume.
- Hace falta e2e de: crear/editar/publicar un proyecto con su efecto en el sitio sin redeploy, slug bloqueado tras publicar (ADMN-09), reordenar con teclado (ADMN-06), Cmd+S y confirmación al salir con cambios (ADMN-10), y rechazo sin sesión de actions y de `/api/blob/upload`.

</specifics>

<deferred>
## Deferred Ideas

- Overrides solo para el PDF (columna `resume_versions.overrides`): fuera de v1 (D-07); revisable después.
- Panel de vista previa lado a lado (iframe) en el admin: descartado en favor de pestaña nueva (D-03).

</deferred>

---

*Phase: 03-panel-admin-cv*
*Context gathered: 2026-11-16*
