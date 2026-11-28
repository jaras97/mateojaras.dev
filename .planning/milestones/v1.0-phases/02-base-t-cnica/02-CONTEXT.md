# Phase 2: Base técnica - Context

**Gathered:** 2026-11-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Esqueleto andante desplegado (días 3–4). Teo inicia sesión en `/admin` en un Preview de Vercel. Las rutas públicas `/`, `/es`, `/projects/[slug]` y `/es/proyectos/[slug]` muestran títulos reales desde Neon, prerenderizados y en el idioma correcto. CI corre `pnpm check` en cada push, el build del Preview aplica las migraciones contra Neon `dev`, hay CSP en Report-Only y la decisión go/no-go del plan B queda registrada al final del día 3.

Requisitos: BASE-01 a BASE-11 y AUTH-01 a AUTH-04. Fuera de esta fase: el CRUD del admin, Blob y el CV (fase 3), y el diseño del sitio público, SEO y movimiento (fase 4).

</domain>

<decisions>
## Implementation Decisions

### Aprobaciones de arranque (las dio Teo en esta discusión, 2026-11-15)
- **D-01:** Dependencias aprobadas, todas: `react` y `react-dom` 19.3.0 → **19.3.1**. Directas: `@tiptap/pm`, `@tiptap/static-renderer` (todos los `@tiptap/*` a la misma versión exacta), `@dnd-kit/utilities` y `server-only`. Dev: `@testing-library/dom`, `@testing-library/user-event` y `tsx`. `@types/node` de `^20` a `^24`. Se instalan en la primera tarea de la fase y se registran en `docs/decisions.md` como decisión de Teo. `@axe-core/playwright` 4.14.0 ya está instalado desde la fase 1.
- **D-02:** `docs/data-model.md` se edita en las dos cosas aprobadas, y en nada más: (1) añadir `site_settings.languages` en formato CEFR (aprobado el 2026-10-29); (2) cambiar `npx @better-auth/cli generate` por `pnpm dlx auth@1.7.14 generate --output src/db/auth-schema.ts`. El esquema y la primera migración se escriben contra el doc ya corregido. — **Reversibility:** one-way — la columna `languages` entra en la primera migración aplicada en Neon `dev` y `main`, y quitarla después exige otra migración.
- **D-03:** Se enmienda CLAUDE.md, sección "Next 16: cosas que cambiaron". `proxy.ts` aplica las reescrituras de next-intl (rutas localizadas en `/es`) **y** la comprobación optimista de la cookie en `/admin`. La validación real de la sesión es un `AuthGate` dentro de `<Suspense>` en `src/app/admin/(panel)/layout.tsx`, más `requireSession()` en cada loader, Server Action y endpoint de subida del admin. Se registra en `docs/decisions.md`.
- **D-04:** **Biome se queda en 2.4.2.** No se sube a 2.6 en esta fase.

### Defaults de Claude (Teo no eligió discutirlos; puede vetarlos al revisar este archivo)
- **D-05 · Seed y contenido pendiente:** el seed lee `docs/content/*.md` y guarda solo los campos verificables. Los campos de `pendingFields` quedan `null` y nunca se rellenan con texto. ManuJ y EcoExport (`clientPermission: true`) se siembran como `published`. Inventario y Finanzas, que no tienen permiso confirmado, se siembran como `draft`. Las imágenes (`coverImage`, `media`) no se siembran porque `material/` no está versionado y Blob llega en la fase 3. `site_settings` se siembra con los valores reales del fixture de G2 (open, `availableFrom` null, `Medellín, Colombia`, `UTC-5`) y los idiomas que ya constan en PROJECT.md (español nativo, inglés B2). Experiencia y educación se siembran solo con los hechos de PROJECT.md (Sofka ago-2021 a ago-2025 y freelance desde sep-2025; U. de Antioquia y Sofka U), con los bullets de Sofka en `null`. Skills solo si el dato está en `docs/content/`. El texto en inglés en `draft-translation` se siembra tal cual: el esqueleto solo muestra títulos, y la aprobación de esos textos es de la fase 3.
- **D-06 · Dónde corre el seed:** el seed nunca se ejecuta dentro del build. Teo lo corre a mano desde local con `pnpm seed` contra Neon `dev` (Preview y CI). Para `main` se corre una sola vez, a propósito, antes del primer deploy de Production. El build solo aplica las migraciones (`DATABASE_URL_UNPOOLED`). Nunca se usa `drizzle-kit push` contra `main`. Las credenciales del admin (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) viven solo en `.env.local`, porque solo el seed las usa, y no se cargan en Vercel.
- **D-07 · Entornos:** el gate de la fase es el Preview. Production puede desplegarse en su URL `*.vercel.app` para probar AUTH-04, pero **`mateojaras.dev` no se apunta al proyecto hasta el lanzamiento (fase 5)**. Preview usa la rama `dev` de Neon y Production la rama `main`: se verifica en la integración Neon–Vercel antes del primer build. El build de CI (GitHub Actions) corre contra Neon `dev` con `DATABASE_URL` como secret del repo. Cuando haga falta, se le pide a Teo con los pasos exactos (regla de cuentas de CLAUDE.md).
- **D-08 · Admin mínimo:** `/admin/login` es un formulario de email y contraseña (shadcn + RHF + Zod) con los tokens de DESIGN.md, sin diseño extra. Después del login, `/admin` es una cáscara: cabecera con el nombre, botón "Cerrar sesión" y un panel vacío. La navegación y el CRUD son de la fase 3. La UI del admin va en español, con `getTranslations({ locale: 'es' })` explícito y los textos en `messages/es.json` (y su par en `messages/en.json` por paridad). Esta decisión se registra en `docs/decisions.md`.
- **D-09 · Esqueleto público:** las cuatro rutas renderizan solo lo que pide BASE-08 (título real y lista de proyectos publicados) con tokens y tipografía, sin el diseño de la fase 4. Lo que no tiene contenido no se renderiza. Un slug desconocido o en `draft` da `notFound()`.
- **D-10 · `/lab`:** se borra en la primera tarea de la fase, como ya se decidió el 2026-10-30 en `docs/decisions.md`. Los componentes de `src/components/site/` (hero A, StatusLine) se conservan para la fase 4.

### Claude's Discretion
- Driver de Neon (`neon-http` + `db.batch()`), estructura de `src/db/`, `src/lib/auth.ts`, el helper de creación del admin sobre `internalAdapter`, y los nombres de los archivos.
- Cómo se hace la prueba go/no-go del plan B el día 3 (qué rutas, qué señales) y el formato del registro, siempre que quede en `docs/decisions.md` al final del día 3.
- El contenido exacto de la CSP en Report-Only y las cabeceras de seguridad, sin nonce.
- El formato de `content/*.json` y el modo `--from-content` del seed, siempre que el ciclo export → seed restaure la base en local.
- La configuración de Better Auth para las URLs de Preview (`trustedOrigins`/`allowedHosts`).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Alcance y reglas
- `PROJECT.md` (raíz): manda sobre `.planning/`. Fases, compuertas, prohibiciones, límites de autonomía y variables de entorno.
- `CLAUDE.md` (raíz): convenciones, regla de cuentas y claves, seguridad y verificación. Se enmienda según D-03.
- `.claude/CLAUDE.md`: investigación del stack. Lo más útil está en §2 (next-intl + root params), §3 (proxy), §4 (Better Auth), §5 (Drizzle/Neon), "Stack Patterns by Variant" (plan B) y "What NOT to Use".
- `AGENTS.md` y `node_modules/next/dist/docs/`: hay que leerlos antes de escribir código de Next 16.4. En particular `next-root-params.md`, `authentication-with-cache-components.md`, `generate-static-params.md`, `updateTag.md`, `content-security-policy.md`, `caching-without-cache-components.md` y `proxy.md`.
- `.planning/REQUIREMENTS.md`: BASE-01 a BASE-11 y AUTH-01 a AUTH-04.
- `.planning/ROADMAP.md` (Phase 2): criterios de éxito, gate, aprobaciones, cuentas, research flag y notas.

### Datos y contenido
- `docs/data-model.md`: esquema Drizzle, helpers (`localized`, `tags`) y reglas de queries, actions y export. Se edita según D-02.
- `docs/content/README.md`: contrato de los archivos de proyecto (`pendingFields`, `clientPermission`, etc.) que lee el seed.
- `docs/content/*.md`: los 4 proyectos, la entrada del seed.
- `src/features/projects/content-schema.ts` y `content-file.ts`: el parser y el Zod del contrato, reutilizables en el seed.
- `src/features/site-settings/fixture.ts` y `types.ts`: los valores de G2 y el tipo de `site_settings`.

### Registro
- `docs/decisions.md`: aquí se registran D-01 a D-04 (decisiones de Teo), D-08 (idioma del admin), la decisión go/no-go del plan B y el borrado de `/lab`.
- `docs/backlog.md`: lo que no se construye.
- `DESIGN.md`: tokens y tipografía del login y del esqueleto (APROBADO el 2026-11-01).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/i18n-fields.ts` (`localized`, con tests): se usa tal cual en las páginas.
- `src/lib/messages.ts` + `messages/{en,es}.json`: base para la integración con next-intl.
- `src/app/fonts.ts`: `fontVariables` de las tres familias. Se carga en cada root layout (`[locale]` y `admin`).
- `src/components/ui/button.tsx`: el Button con el tema propio, para el login y el logout.
- `src/features/projects/content-schema.ts` / `content-file.ts`: leen y validan `docs/content/*.md`, la base del seed.
- `src/features/site-settings/types.ts` / `fixture.ts`: el tipo y los valores reales de `site_settings`.

### Established Patterns
- Organización por feature: `src/features/<entidad>/{schema,queries,actions,validation}.ts`.
- Tests junto al código con Vitest; `pnpm check` = typecheck + lint + test + build.
- `next.config.ts` ya tiene `cacheComponents`, `partialPrefetching`, `reactCompiler` y el loader de Tailwind para Turbopack.

### Integration Points
- `src/app/layout.tsx` y `src/app/page.tsx` del scaffold se eliminan y se sustituyen por `src/app/[locale]/layout.tsx` y `src/app/admin/layout.tsx` (BASE-02).
- `src/app/lab/` se borra (D-10).
- Archivos nuevos: `proxy.ts`, `drizzle.config.ts`, `src/db/`, `src/lib/auth.ts`, `src/lib/cache-tags.ts`, `scripts/seed.ts`, `scripts/export-content.ts`, `.github/workflows/` y `e2e/`.
- `.env.example` ya lista `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BETTER_AUTH_SECRET` y `BETTER_AUTH_URL`. Falta añadir `ADMIN_EMAIL` y `ADMIN_PASSWORD` (solo para el seed).

</code_context>

<specifics>
## Specific Ideas

- `/` sale siempre en inglés, sin detección por `Accept-Language` (BASE-04).
- El export a Blob en producción se omite con un aviso visible hasta que exista `BLOB_READ_WRITE_TOKEN` (fase 3). Nunca se usa un mock silencioso.
- Hace falta un e2e del login (iniciar sesión, recargar, cerrar sesión) y una prueba de rechazo sin sesión de un loader o una Server Action del admin (AUTH-03).

</specifics>

<deferred>
## Deferred Ideas

- Biome 2.4 → 2.6: se descartó para esta fase (D-04). Se puede revisar en el pulido de la fase 5.

</deferred>

---

*Phase: 02-base-tecnica*
*Context gathered: 2026-11-15*
