# 04-LIGHTHOUSE: Lighthouse movil sobre el Preview de Vercel

## Medicion

- Preview medido (final): https://mateojaras-ef0gbt49z-mateos-projects-85710491.vercel.app
- Commit del codigo desplegado: `b952ade` (working tree con un cambio solo de docs/decisions.md, sin efecto en el render)
- Metodo: **a** (04-02 Lectura E). `pnpm dlx lighthouse` con `--preset=perf --form-factor=mobile`, throttling simulado por defecto de Lighthouse, cabecera de bypass de proteccion de Vercel leida por `scripts/lighthouse-preview.mjs` desde el entorno local (el secreto no se imprime ni se guarda; ver T-04-28). `?__vercel_toolbar=0` en cada URL.
- Cada fila es la mediana de 3 ejecuciones. Fecha: 2026-11-23. INP se aproxima con TBT (lab), segun el supuesto del plan.
- Contenido: ManuJ (`centro-estetico-manuj`) ya tiene tagline, problem y portada; EcoExport esta publicado pero sin completar. Se mide lo que existe. El respaldo "caso poblado" queda `human_needed`.
- Estado de BD antes de medir: `e2e-stale-probe` ya no existe en la rama dev (comprobado con `scripts/project-status.mjs`), nada que pasar a borrador.

## Tabla final (8 URLs)

| URL | Performance | LCP (s) | CLS | TBT (ms) | Metodo | Fecha |
|---|---|---|---|---|---|---|
| https://mateojaras-ef0gbt49z-mateos-projects-85710491.vercel.app/ | 96 | 2.21 | 0 | 18 | a | 2026-11-23 |
| https://mateojaras-ef0gbt49z-mateos-projects-85710491.vercel.app/projects/centro-estetico-manuj | 96 | 2.26 | 0 | 19 | a | 2026-11-23 |
| https://mateojaras-ef0gbt49z-mateos-projects-85710491.vercel.app/about | 97 | 2.20 | 0 | 20 | a | 2026-11-23 |
| https://mateojaras-ef0gbt49z-mateos-projects-85710491.vercel.app/contact | 96 | 2.24 | 0 | 20 | a | 2026-11-23 |
| https://mateojaras-ef0gbt49z-mateos-projects-85710491.vercel.app/es | 96 | 2.19 | 0 | 30 | a | 2026-11-23 |
| https://mateojaras-ef0gbt49z-mateos-projects-85710491.vercel.app/es/proyectos/centro-estetico-manuj | 96 | 2.28 | 0 | 22 | a | 2026-11-23 |
| https://mateojaras-ef0gbt49z-mateos-projects-85710491.vercel.app/es/sobre-mi | 96 | 2.26 | 0 | 18 | a | 2026-11-23 |
| https://mateojaras-ef0gbt49z-mateos-projects-85710491.vercel.app/es/contacto | 97 | 2.18 | 0 | 20 | a | 2026-11-23 |

Elemento LCP (una ejecucion de comprobacion): `/` y `/es` = `h1#hero-title`; caso = `img.object-cover` de la portada (fuera de Reveal, Pitfall 9: se mantiene); `/about` y `/contact` = el parrafo de entrada (`p.mt-8`). Desglose de `/`: TTFB ~0.8 s del Preview, resto render del primer pintado; FCP = LCP en todas las rutas.

## Medicion previa (antes de P4)

Preview `https://mateojaras-kob668dv8-mateos-projects-85710491.vercel.app`, commit `a51dbb3`, mismo metodo, mediana de 3.

| URL | Performance | LCP (s) | CLS | TBT (ms) | Metodo | Fecha |
|---|---|---|---|---|---|---|
| (previo) / | 81 | 4.66 | 0 | 21 | a | 2026-11-23 |
| (previo) /es | 81 | 4.67 | 0 | 25 | a | 2026-11-23 |
| (previo) /projects/centro-estetico-manuj | 96 | 2.26 | 0 | 22 | a | 2026-11-23 |
| (previo) /about | 96 | 2.25 | 0 | 22 | a | 2026-11-23 |
| (previo) /contact | 96 | 2.21 | 0 | 20 | a | 2026-11-23 |
| (previo) /es/proyectos/centro-estetico-manuj | 96 | 2.19 | 0 | 17 | a | 2026-11-23 |
| (previo) /es/sobre-mi | 96 | 2.25 | 0 | 18 | a | 2026-11-23 |
| (previo) /es/contacto | 97 | 2.17 | 0 | 21 | a | 2026-11-23 |

La home fallaba por LCP: el H1 se mantenia oculto hasta que cargaban GSAP y SplitText. Se aplico el Plan B P4 (palabras partidas en el servidor, keyframes CSS, sin JS); LCP bajo a 2.21 s y el rendimiento a 96. Las demas rutas ya cumplian antes y no cambiaron.
