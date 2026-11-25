# mateojaras.dev

> Fuente de verdad: `PROJECT.md` en la raíz del repo (más `CLAUDE.md`, `DESIGN.md`, `docs/data-model.md`, `docs/backlog.md`). Este archivo lo resume en el formato de GSD. Si algo choca, gana el de la raíz.

## What This Is

Portafolio bilingüe (inglés en `/`, español en `/es`) de Mateo Jaramillo (Teo), AI full stack developer de Medellín (UTC-5) con 5+ años en React/Next.js: 4 años como desarrollador frontend en Sofka (2021–2025) y freelance desde sep-2025 con productos full stack. Está dirigido a clientes freelance y reclutadores, con foco en Canadá y Europa. Incluye un panel admin propio en `/admin` para editar todo el contenido sin redeploy, y genera el CV en PDF (en/es) desde los mismos datos.

## Core Value

Los casos de estudio (`/projects/[slug]`) tienen que convencer a un cliente o reclutador de que Teo sabe decidir y entregar: qué problema había, qué hizo él, qué resultado tuvo, qué decidió técnicamente y por qué. Si a día 14 solo una cosa puede quedar impecable, es esta; el resto puede ser sobrio.

## Requirements

### Validated

- ✓ Scaffold de Next.js 16.4 con App Router, Tailwind v4, shadcn/ui inicializado y Biome — existente (commit 2fa9f24)
- ✓ Admin en `/admin` para SiteSettings, Skills, Experience, Projects (con tech decisions), Education y Resume, con draft/published, visible y orden — Phase 3
- ✓ CV en PDF en/es generado desde los datos (tildes y ñ correctas) y `/resume.json` (JSON Resume) — Phase 3 (generado en Neon main, UAT 2026-11-22)
- ✓ Sitio público: `/`, `/projects/[slug]`, `/about` (+ `/now` corta), `/contact` y sus versiones en `/es` (`/es/proyectos/[slug]`, `/es/sobre-mi`, `/es/contacto`) — Phase 4 (UAT 2026-11-24)
- ✓ Casos de estudio con notas al margen (`Marginalia`) sobre decisiones técnicas — Phase 4 (UAT 2026-11-24)
- ✓ Línea de estado viva en el hero (disponibilidad, ciudad, UTC-5, overlap con Toronto y Madrid) editable desde el admin — Phase 4 (UAT 2026-11-24)
- ✓ Formulario de contacto con Resend, rate limit de Upstash y honeypot; enlace a Cal.com — Phase 4 (UAT 2026-11-24)
- ✓ SEO por idioma: hreflang, OG, metadatos desde SiteSettings — Phase 4 (UAT 2026-11-24)
- ✓ Movimiento dentro del presupuesto (reveal, SplitHeading, 1–2 escenas GSAP, tema con View Transitions) y respeto de `prefers-reduced-motion` — Phase 4 (UAT 2026-11-24)

### Active

- [ ] Identidad cerrada: DESIGN.md aprobado (concepto en palabras de Teo), tokens CSS y tema shadcn propios, variante del hero elegida entre 3 en código
- [ ] Contenido real en el repo: capturas, URLs, métricas y textos en/es de los 4 proyectos en `docs/content/` y `material/`, y `docs/copy.md` sin marcadores
- [ ] Base técnica: esquema Drizzle + migración, Better Auth con un solo admin, next-intl con locale desde `next/root-params`, seed con contenido real, CI y preview en Vercel
- [ ] Pulido: a11y WCAG AA, 404, analytics, revisión por 3 personas

### Out of Scope

- Todo lo de `docs/backlog.md` (cursos, servicios, testimonios, blog, páginas genéricas, ⌘K, GitHub en vivo, contador de vistas, guestbook, changelog, demo del admin, traducción con IA, Lenis, Typst, Sentry) — protege el alcance de la v1; se revisa solo después del lanzamiento
- Precios o tarifas en cualquier parte del sitio — decisión de Teo
- Registro de usuarios o más de un admin — un solo usuario; menos superficie de ataque
- Librerías de efectos (Aceternity, Magic UI, React Bits, Cult UI), 3D, scroll suave, cursores custom — chocan con la dirección de arte
- Lorem ipsum, proyectos inventados o métricas que no estén en `docs/content/` — el portafolio pierde credibilidad

## Context

- Repo casi vacío: solo el scaffold y los archivos de contexto (`CLAUDE.md`, `DESIGN.md`, `docs/`). El código empieza de cero.
- `PROJECT.md` raíz afirma que `docs/content/` ya tiene el material de los 4 proyectos, pero al 2026-10-29 la carpeta solo tiene `.gitkeep`, `material/` está vacía y `docs/copy.md` sigue con marcadores `[Teo escribe]`. Cargarlo es trabajo de la fase 1 y bloquea la fase 3.
- Proyectos a mostrar: Centro Estético ManuJ (centroesteticomanuj.com), EcoExport Costa Rica (ecoexportcostarica.com/es), Sistema de Gestión de Inventario (sin URL pública), App de Finanzas Personales (Next.js + FastAPI + PostgreSQL).
- Dirección de arte: "la bitácora de un taller". Secciones numeradas, entradas con fecha, Funnel Display + Hanken Grotesk + Geist Mono, un solo acento terracota en OKLCH, tema claro por defecto. Detalle en `DESIGN.md` (estado: PROPUESTA hasta que Teo lo apruebe).
- El copy lo escribe Teo en primera persona; Claude solo corrige gramática y naturalidad.
- `docs/decisions.md` registra quién decidió qué; alimenta un futuro caso de estudio del propio portafolio.
- Referencias de estructura: eduardbodak.com, finethought.com.au, antfu.me.

## Constraints

- **Tech stack**: Next.js 16.4 (cacheComponents, React Compiler, Turbopack), React 19.3, TS estricto, Tailwind v4 + shadcn, Drizzle + Neon, Better Auth, next-intl, Tiptap, Vercel Blob, @react-pdf/renderer, Motion + GSAP, RHF + Zod, TanStack Table, dnd-kit, Resend, Upstash, Vitest + RTL, Playwright, Biome, pnpm — fijado; no cambiar versiones mayores sin preguntar
- **Plan B de caché**: si Cache Components + next-intl da problemas el día 3, pasar a `cacheComponents: false` + ISR — decidido de antemano para no perder días
- **Timeline**: 10 días hábiles + 4 de margen como objetivo, sin fecha dura externa — Teo prefiere calidad a cumplir una fecha
- **Cuentas**: Blob (fase 3), Resend/Upstash/Cal.com (fase 4), analytics (fase 5) se crean en la fase que los necesita; el código queda detrás de una comprobación de la variable, nunca con valores inventados
- **Performance**: Lighthouse móvil ≥ 95 en `/`, `/projects/[slug]`, `/about`, `/contact` (en y es); LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1
- **Accesibilidad**: WCAG AA, foco visible, teclado, axe sin `serious`/`critical`
- **Seguridad**: claves nunca versionadas; validación Zod en servidor; sesión verificada en layout de admin y en cada Server Action; CSP y cabeceras en `next.config.ts`
- **Autonomía**: preguntar antes de añadir dependencias, tocar DESIGN.md/copy/paleta/tipografía, cambiar el modelo de datos o una migración, añadir rutas, animaciones fuera del presupuesto o servicios externos

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js fullstack + admin propio, v1 de 5 entidades y 4 rutas | Un solo deploy, SEO nativo, el admin demuestra capacidad fullstack; el recorte protege la fecha | — Pending |
| Dirección "bitácora de un taller" | Identidad propia frente a la estética genérica de IA | — Pending (aprobación de Teo en fase 1) |
| Casos de estudio como prioridad máxima | Es lo que convence a clientes y reclutadores | — Pending |
| Respetar las 5 fases definidas por Teo en el roadmap | Ya tienen compuertas claras y días asignados | — Pending |
| Contenido y copy como compuerta de la fase 1 | `docs/content/` está vacío; sin contenido real no se puede probar el admin ni los casos de estudio | — Pending |
| `PROJECT.md` raíz manda sobre `.planning/PROJECT.md` | Evita dos fuentes de verdad divergentes | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-11-24 after Phase 4*
