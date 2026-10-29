# mateojaras.dev — reglas del proyecto

Portafolio de Mateo Jaramillo (frontend, React/Next, Medellín, UTC-5). Sitio público en inglés (`/`) y español (`/es`) + panel admin propio en `/admin`. Lee `DESIGN.md` antes de tocar cualquier UI y `docs/data-model.md` antes de tocar datos. El alcance de la v1 está en `PROJECT.md`; lo que NO se hace está en `docs/backlog.md`.

## Antes de escribir código de Next.js
Lee `AGENTS.md` (lo genera Next 16.4) y la guía relevante en `node_modules/next/dist/docs/`. Ante cualquier duda de API, consulta context7. No edites el bloque `nextjs-agent-rules` de AGENTS.md.

## Skills del proyecto
En `.claude/skills/`: impeccable (auditoría de diseño; sus hooks corren al editar UI), web-design-guidelines, vercel-react-best-practices, vercel-react-view-transitions, vercel-composition-patterns, writing-guidelines, deploy-to-vercel, vercel-optimize. Ignora vercel-react-native-skills (no aplica).

## Stack (fijado; no cambies versiones mayores sin preguntar)
Next.js 16.4 (App Router, `cacheComponents: true`, React Compiler, Turbopack) · React 19.3 · TypeScript estricto · Tailwind v4 + shadcn/ui (tema propio en `globals.css`) · Drizzle ORM + Neon Postgres · Better Auth · next-intl (`next/root-params`) · Tiptap · Vercel Blob · @react-pdf/renderer · Motion + GSAP · React Hook Form + Zod · TanStack Table · dnd-kit · Resend · Upstash Ratelimit · Vitest + RTL · Playwright · Biome · pnpm.

## Comandos
- `pnpm dev` · `pnpm build` · `pnpm start`
- `pnpm check` = typecheck + lint + test + build (debe pasar antes de cada commit de cierre)
- `pnpm test` (vitest) · `pnpm test:e2e` (playwright) · `pnpm lint` (biome) · `pnpm format`
- `pnpm db:generate` · `pnpm db:migrate` · `pnpm db:studio` · `pnpm seed` · `pnpm export:content`

## Next 16: cosas que cambiaron (consulta context7 ante la duda)
- `proxy.ts` reemplaza a `middleware.ts`; ahí solo se comprueba la cookie de sesión y se redirige. La validación real es `auth.api.getSession()` en `src/app/admin/layout.tsx` y en cada Server Action.
- `params`, `searchParams`, `cookies()`, `headers()` son async.
- `revalidateTag(tag, 'max')` lleva perfil; en Server Actions usa `updateTag(tag)` para read-your-writes.
- Con `cacheComponents`, lo que lleva `'use cache'` no puede leer `headers()`: el locale llega por `next/root-params`.
- `next lint` ya no existe: usamos Biome.

## Arquitectura y convenciones
- Organización por feature: `src/features/<entidad>/{schema.ts, queries.ts, actions.ts, validation.ts, components/}`.
- Server Components por defecto; `'use client'` solo en hojas interactivas (editor, tablas, motion).
- Toda mutación es una Server Action en `actions.ts`: valida con Zod → verifica sesión → escribe con Drizzle → `updateTag` → `exportContent()`.
- Consultas públicas en `queries.ts` con `'use cache'` + `cacheTag` (tags en `src/lib/cache-tags.ts`).
- Tablas `snake_case`, código `camelCase`. Campos localizados como `title_en` / `title_es`; en UI siempre `localized(row, 'title', locale)`.
- Textos de interfaz (botones, labels) en `messages/en.json` y `messages/es.json`; el contenido vive en la base de datos, nunca en componentes.
- Si falta contenido, el componente no se renderiza. Prohibido lorem ipsum, proyectos inventados o métricas que no estén en `docs/content/`.
- Un commit por tarea, mensaje convencional (`feat(admin): ...`, `fix(site): ...`). Nada de commits "wip".
- Tests junto al código (`*.test.ts(x)`), e2e en `e2e/`. Prueba comportamiento, no implementación.

## Diseño (resumen; detalle en DESIGN.md)
- Concepto: "la bitácora de un taller". Tipografía: Funnel Display + Hanken Grotesk + Geist Mono. Un solo acento (terracota). Tema claro por defecto.
- PROHIBIDO: Inter, Roboto, Arial, Open Sans, Lato, Space Grotesk, Satoshi, system fonts; gradientes (de fondo o en texto); glassmorphism; hero + 3 cards iguales con sombra; iconos en tiles redondeados; grid decorativo de fondo; marquees, shimmer buttons, number tickers, dots pulsantes, cursores custom; Aceternity UI, Magic UI, React Bits y cualquier librería de "efectos"; copy tipo "Build faster. Ship smarter."; em-dashes en el copy; emojis en la UI.
- Presupuesto de movimiento: un reveal escalonado al cargar, hover states precisos, 1–2 escenas scrubbed con GSAP, cambio de tema con View Transitions. Solo `transform` y `opacity`. Todo respeta `prefers-reduced-motion`. Scroll nativo (sin Lenis). Sin 3D.
- GSAP solo dentro de `src/components/motion/`. Motion (`motion/react`) para enter/exit y layout.

## Cómo verificar tu trabajo
- Después de cada vista pública: capturas con Playwright MCP en 390, 768 y 1440 px (claro y oscuro), `/impeccable:audit` y `/impeccable:critique`. Reporta hallazgos antes de seguir.
- Después de cada cambio de datos: `pnpm test` y un e2e del flujo afectado.
- Rendimiento: Lighthouse móvil ≥ 95 en `/`, `/projects/[slug]`, `/about`, `/contact` (en y es). LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.
- Accesibilidad: WCAG AA, foco visible, navegable por teclado, axe sin `serious`/`critical`.

## Límites de autonomía
Decides solo: estructura interna de componentes, nombres, tests, refactors sin cambio visual.
PREGUNTA ANTES de: añadir o cambiar dependencias; tocar `DESIGN.md`, `docs/copy.md` o la paleta/tipografía; cambiar `docs/data-model.md` o una migración existente; añadir rutas; cualquier animación fuera del presupuesto; cualquier servicio externo nuevo; cualquier cosa del backlog.
Registra en `docs/decisions.md` cada decisión no trivial: qué decidiste tú, qué decidí yo, por qué.

## Cuentas y claves: se piden cuando hacen falta, no antes
Ya existen: dominio mateojaras.dev (Porkbun), repo público en GitHub, base Neon creada desde Vercel (ramas `main` y `dev`).
Todavía NO existen y se crean en la fase que los necesita: Vercel Blob (fase 3, imágenes), Resend y Upstash (fase 4, contacto), Cal.com (fase 4), analytics (fase 5), Search Console (lanzamiento). `ANTHROPIC_API_KEY` es backlog.
Regla: cuando una tarea necesite una variable que no está en `.env.local`, DETENTE antes de escribir código que dependa de ella y pídele a Teo exactamente: (1) qué servicio crear, (2) los pasos en su dashboard, (3) qué variable copiar y dónde (`.env.local` y Vercel → Settings → Environment Variables, en Production y Preview). Mientras tanto, deja el código detrás de una comprobación de la variable con un mensaje claro, nunca con un valor inventado ni un mock silencioso. Al recibir la clave, actualiza `.env.example` si falta y sigue.

## Seguridad
Nunca escribas claves en archivos versionados. Un solo usuario admin; registro deshabilitado. Rate limit (Upstash) y honeypot en el formulario público. Validación Zod en servidor siempre. CSP y cabeceras de seguridad en `next.config.ts`.
