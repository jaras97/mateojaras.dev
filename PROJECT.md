# Proyecto: Portafolio de Mateo Jaramillo Quiroga (mateojaras.dev)

## Quién soy y para quién es
Soy Mateo Jaramillo, desarrollador frontend con 5+ años (React, Next.js, TypeScript), 4 años en Sofka Technologies (ago-2021 a ago-2025, Mid-Senior) y freelance desde sep-2025 construyendo apps fullstack con IA como herramienta. Vivo en Medellín, Colombia (UTC-5). Audiencia: clientes freelance y reclutadores, con foco en Canadá y Europa y apertura a trabajo local. Inglés por defecto en la raíz (/), español en /es. Dominio: mateojaras.dev. Contacto: mateojaras@gmail.com · github.com/jaras97 · linkedin.com/in/mateo-jaramilloquiroga.

## Objetivo de la v1 (2 semanas, tiempo completo)
Un portafolio minimalista, con vida y claramente humano, con un panel administrativo propio en /admin desde el que edito el contenido sin redeploy. La v1 tiene exactamente:
- 5 entidades: SiteSettings, Project, Experience, Skill, Resume (más Education como tabla mínima)
- 4 rutas públicas: /, /projects/[slug], /about, /contact (+ /now corta desde SiteSettings), y sus versiones en /es (/es/proyectos/[slug], /es/sobre-mi, /es/contacto)
- CV en PDF en/es generado desde los datos + /resume.json (JSON Resume)
- Formulario de contacto (Resend, rate limit) y enlace a Cal.com; sin precios ni tarifas en ningún lado
Todo lo demás (cursos, servicios, testimonios, blog, ⌘K, GitHub en vivo, guestbook, changelog, demo read-only del admin, Lenis) está en docs/backlog.md y NO se construye hasta que la v1 esté publicada.

## Contenido real (ya existe, nunca lorem ipsum)
docs/content/ contiene capturas, URLs, métricas y textos en/es de: Centro Estético ManuJ (centroesteticomanuj.com; Next.js, Tailwind, Cloudinary, agendamiento), EcoExport Costa Rica (ecoexportcostarica.com/es; multilingüe, catálogo, SEO), Sistema de Gestión de Inventario (Next.js, PostgreSQL, roles, reportes), App de Finanzas Personales (Next.js, FastAPI, PostgreSQL). Experiencia: Sofka 2021–2025 y freelance 2025–hoy. Educación: U. de Antioquia (Ing. de Telecomunicaciones, 8.º semestre), Sofka U (2021). Idiomas: español nativo, inglés B2. scripts/seed.ts carga todo esto en la base de datos.

## Stack y configuración (versiones fijadas en package.json; cambiar solo si falla una compuerta)
Next.js 16.4 (App Router, cacheComponents: true, next/root-params para el locale, React Compiler, Turbopack) · React 19.3 · TypeScript estricto · Tailwind v4 + shadcn/ui con tema propio (tweakcn) · Drizzle ORM + Neon Postgres · Better Auth (un solo admin, sin registro; proxy.ts solo comprueba la cookie; auth.api.getSession en app/admin/layout.tsx y en cada Server Action) · Tiptap (JSON) · Vercel Blob · @react-pdf/renderer (fuentes TTF estáticas en /assets/fonts-pdf, serverExternalPackages, outputFileTracingIncludes) · next-intl con locale desde next/root-params + hasLocale/notFound() · Motion + GSAP (ScrollTrigger, SplitText); scroll nativo, sin Lenis · React Hook Form + Zod · TanStack Table · dnd-kit · Resend · Upstash Ratelimit.
Invalidación: updateTag(tag) en las Server Actions del admin; revalidateTag(tag, 'max').
Plan B si Cache Components + next-intl da problemas el día 3: cacheComponents: false + ISR.
Tests: Vitest + React Testing Library; Playwright para login, CRUD de Project y contacto. Lint y formato: Biome. Hosting: Vercel. Repo público en GitHub desde el día 1.

## Variables de entorno y cuentas
Ya listas: dominio mateojaras.dev, repo público, Neon creado desde Vercel (DATABASE_URL de main y dev). BETTER_AUTH_SECRET y BETTER_AUTH_URL se generan en la fase 2.
Se piden sobre la marcha, en la fase que las necesita (ver CLAUDE.md): BLOB_READ_WRITE_TOKEN (fase 3), RESEND_API_KEY y UPSTASH_REDIS_REST_URL/TOKEN (fase 4), URL de Cal.com (fase 4), analytics (fase 5). ANTHROPIC_API_KEY es backlog. Todo documentado en .env.example.

## Modelo de datos y convenciones
Esquema en docs/data-model.md (Drizzle, snake_case en tablas, camelCase en TS). Entidades de contenido con visible, order, status (draft/published) y columnas _en/_es. Project incluye tech_decisions {decisions[], tradeoffs, validation, aiTools[]}. Cada publicación exporta content/*.json como respaldo.
Estructura: src/app/[locale]/(site)/..., src/app/admin/..., src/features/<entidad>/{schema.ts, queries.ts, actions.ts, validation.ts, components/}, src/lib/, src/components/{ui,site,admin,motion}/.

## Dirección de arte (DESIGN.md; no se cambia sin preguntarme)
Concepto: "la bitácora de un taller": secciones numeradas (01, 02...), entradas con fecha, una línea de estado viva en el hero (disponibilidad, ciudad, UTC-5, overlap con Toronto y Madrid) que sale del admin, notas al margen con decisiones técnicas en los casos de estudio. Tipografía: Funnel Display (títulos) + Hanken Grotesk (texto) + Geist Mono (fechas, estados, código), self-hosted con next/font. Paleta OKLCH: fondo oklch(0.985 0.006 80), tinta oklch(0.24 0.03 260), acento único terracota oklch(0.66 0.17 40); modo oscuro con fondo oklch(0.17 0.01 260) y el mismo acento; tema claro por defecto, oscuro por preferencia del sistema. Layout editorial en grid de 12 columnas con ritmo propio; navegación mínima. Copy en primera persona en docs/copy.md (en y es), escrito por mí; tú solo corriges.
Presupuesto de movimiento: un reveal escalonado al cargar, hover states precisos, 1–2 momentos scrubbed con GSAP, transición de tema con View Transitions. Siempre prefers-reduced-motion; solo transform y opacity. Sin 3D.
Referencias (estructura, no estética): eduardbodak.com, finethought.com.au, antfu.me.

## Prohibido (tells de diseño IA)
Inter, Roboto, Arial, Open Sans, Lato, Space Grotesk, Satoshi, system fonts; gradientes morado/azul o texto con gradiente; glassmorphism; hero + 3 cards iguales con sombra suave; iconos en tiles redondeados; grid decorativo; marquees, shimmer buttons, number tickers, dots pulsantes; Aceternity UI; copy tipo "Build faster. Ship smarter."; em-dashes en el copy. Nunca instales librerías de efectos ni cambies fuentes/paleta sin preguntarme.

## Definición de hecho y compuertas
Lighthouse móvil ≥ 95 en las 4 rutas en ambos idiomas; LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1; WCAG AA; sin hallazgos críticos en /impeccable:audit; typecheck, lint, tests y build en verde en CI; PDF del CV con tildes y ñ correctas en ambos idiomas; hreflang y OG por idioma; contenido real cargado solo desde el admin (nada hardcodeado en componentes).

## Herramientas de trabajo
GSD Core para fases. MCPs activos: Context7, Next.js DevTools, Playwright, shadcn. Plugins: frontend-design, context7, playwright, ralph-loop, code-review, typescript-lsp, security-guidance. Skills: impeccable, web-design-guidelines, react-best-practices, react-view-transitions. ralph-loop solo con criterios verificables (lint, tests, build, Lighthouse). Al terminar cada vista: /impeccable:audit + captura con Playwright.

## Fases (10 días hábiles + 4 de margen)
1. Días 1–2 · Identidad y contenido: inventario, copy en/es, DESIGN.md, tokens CSS, tema shadcn, 3 variantes del hero en código → compuerta: concepto, DESIGN.md, copy y variante del hero aprobados por mí
2. Días 3–4 · Base técnica: esquema + migración, Better Auth, next-intl, seed, CI, Vercel → compuerta: login admin + preview de Vercel en verde + seed cargado
3. Días 5–7 · Panel admin (settings, skills, experience, projects, resume) → compuerta: contenido real desde el admin + PDF con acentos
4. Días 8–10 · Sitio público (home, project, about/now/contact, seo, motion) → compuerta: impeccable sin críticos + Lighthouse móvil ≥ 95
5. Días 11–12 · Pulido (a11y, reduced motion, analytics, 404, revisión por 3 personas) → compuerta: revisión hecha; días 13–14 margen y lanzamiento
6. Backlog (docs/backlog.md), solo después de la v1

## Límites de autonomía
Decides solo: estructura interna de componentes, nombres, tests, refactors sin cambio visual.
Preguntas antes de: añadir dependencias, tocar DESIGN.md o el copy, cambiar el esquema de BD, añadir rutas, cualquier animación nueva fuera del presupuesto, cualquier servicio externo.
Un commit por tarea; PR por fase con preview; registra en docs/decisions.md qué decidiste tú y qué decidí yo (ese registro alimenta el caso de estudio del propio portafolio).
