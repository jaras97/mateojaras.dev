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
- ✓ Identidad cerrada: DESIGN.md aprobado, tokens CSS y tema shadcn propios, variante A del hero — v1.0 (Phase 1, G7)
- ✓ Base técnica: esquema Drizzle + migraciones, Better Auth con un solo admin, next-intl con `next/root-params`, seed, CI y Preview en Vercel — v1.0 (Phase 2)
- ✓ Contenido real: entra por el admin en lugar de `docs/content/` (re-alcance de Teo en G4/G7, D-10); posicionamiento full stack + AI — v1.0 (Phases 3, 4.1, 5)
- ✓ Pulido: WCAG AA, 404 real, CSP en bloqueo, Vercel Analytics, revisión por 3 perfiles hecha por agentes (D-07; la humana sigue pendiente, D-10) — v1.0 (Phase 5)
- ✓ Lanzamiento en mateojaras.dev con el sitemap en Search Console — v1.0 (Phase 5, 2026-11-27)

### Active

(Ninguno: la v1 está entregada. Los requisitos del próximo milestone salen de `/gsd-new-milestone`.)

Candidatos conocidos para el próximo milestone (no comprometidos):
- Revisión humana del sitio (QUAL-08, D-10) y confirmación de visitas en Vercel Analytics (QUAL-07)
- Arreglos del code review de la fase 5 (CR-01, WR-01..08) en `docs/backlog.md`
- `/gsd-secure-phase 05`
- Lo que Teo promueva de `docs/backlog.md`

### Out of Scope

- Todo lo de `docs/backlog.md` (cursos, servicios, testimonios, blog, páginas genéricas, ⌘K, GitHub en vivo, contador de vistas, guestbook, changelog, demo del admin, traducción con IA, Lenis, Typst, Sentry) — protege el alcance de la v1; se revisa solo después del lanzamiento
- Precios o tarifas en cualquier parte del sitio — decisión de Teo
- Registro de usuarios o más de un admin — un solo usuario; menos superficie de ataque
- Librerías de efectos (Aceternity, Magic UI, React Bits, Cult UI), 3D, scroll suave, cursores custom — chocan con la dirección de arte
- Lorem ipsum, proyectos inventados o métricas que no estén en `docs/content/` — el portafolio pierde credibilidad

## Context

- **Estado al cierre de la v1.0 (2026-11-28):** en producción en https://mateojaras.dev. Unas 29.000 líneas de TypeScript en `src/`, 82 archivos de tests unitarios y 43 specs e2e, con el CI en verde en `main`. El stack fijado se mantuvo sin cambios de versión mayor, y Cache Components siguió activo: el plan B no hizo falta.
- El contenido vive en Neon y lo publica Teo desde `/admin`. `docs/content/` quedó como contrato y material de apoyo, y el CV v6 se generó desde el admin.
- Proyectos publicados: Prendo, Centro Estético ManuJ, Metales y Brillantes, EcoExport Costa Rica, App de Finanzas Personales y un bot de arbitraje (según lo publicado en el admin).
- Lo que más pidieron los revisores (cliente, reclutador y developer) fue demos o capturas de los paneles, testimonios, más claridad sobre para quién trabaja, y proceso o precios. Precios y testimonios siguen fuera de alcance por decisión de Teo y por el backlog.
- Deuda conocida: CR-01 y WR-01..08 del code review de la fase 5, `og:image:alt` sin localizar y la fase 5 sin SECURITY.md (ver `.planning/MILESTONES.md`, Known Gaps).
- Dirección de arte: "la bitácora de un taller", aprobada (detalle en `DESIGN.md`).
- El copy lo escribe Teo en primera persona; Claude solo corrige gramática y naturalidad.
- `docs/decisions.md` registra quién decidió qué y alimenta un futuro caso de estudio del propio portafolio.

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
| Next.js fullstack + admin propio, v1 de 5 entidades y 4 rutas | Un solo deploy, SEO nativo, el admin demuestra capacidad fullstack; el recorte protege la fecha | ✓ Good: entregado; Teo edita sin redeploy |
| Dirección "bitácora de un taller" | Identidad propia frente a la estética genérica de IA | ✓ Good: aprobada en G7; los revisores la vieron seria y sobria |
| Casos de estudio como prioridad máxima | Es lo que convence a clientes y reclutadores | ⚠️ Revisit: Prendo y ManuJ convencen, pero Metales y Brillantes es pobre y faltan demos o capturas de los paneles (revisión de la fase 5) |
| Respetar las 5 fases definidas por Teo en el roadmap | Ya tienen compuertas claras y días asignados | ✓ Good: se añadió la 4.1 (posicionamiento); fueron unos 30 días en lugar de 14, por la regla de calidad sobre fecha |
| Contenido y copy como compuerta de la fase 1 | `docs/content/` está vacío; sin contenido real no se puede probar el admin ni los casos de estudio | ⚠️ Revisit: Teo movió el contenido al admin (G4/G7); la compuerta pasó a las fases 3, 4.1 y 5 |
| `PROJECT.md` raíz manda sobre `.planning/PROJECT.md` | Evita dos fuentes de verdad divergentes | ✓ Good |
| Cache Components + next-intl con `next/root-params` (sin el plan B) | Shell estático por idioma con invalidación por tag | ✓ Good: aguantó; el 404 real necesitó trabajo extra en la fase 5 |
| Re-alcance de QUAL-08 a revisiones hechas por agentes (D-07) | No había 3 revisores humanos a tiempo | ⚠️ Revisit: la revisión humana sigue pendiente (D-10) |
| Excepción a D-18: Claude entró C-2..C-4 en el admin de producción | Teo lo autorizó ("Hazlo", 2026-11-27) | — Una sola vez; registrada en docs/decisions.md |

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
*Last updated: 2026-11-28 after v1.0 milestone*
