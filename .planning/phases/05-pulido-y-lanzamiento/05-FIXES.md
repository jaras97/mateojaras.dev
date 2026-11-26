# 05-FIXES: resolución de los hallazgos de la revisión (plan 05-09)

Fuente: `docs/reviews.md`, tabla `## Consolidado` (31 filas, K-01 a K-31). Rama de correcciones: `phase-05-review-fixes` (desde `main`).

Reglas aplicadas: nada que toque DESIGN.md, docs/copy.md, paleta, tipografía, rutas, dependencias, modelo de datos o animación se corrige en silencio (va a una pregunta); los hechos que faltan se preguntan, no se inventan; el texto de contenido sale solo de docs/content/.

## Triage

| ID | Disposición propuesta | Motivo en una línea |
|---|---|---|
| K-01 | question (Q1) | El titular y el público objetivo son copy y posicionamiento; el hecho "para quién" lo decide Teo |
| K-02 | question (Q2) | Falta el hecho de cuándo se construyó Metales y Brillantes; `startedAt` está pendiente en docs/content |
| K-03 | question (Q3) | Faltan hechos (decisiones, rol) y material (capturas) de Metales y Brillantes |
| K-04 | question (Q3) | Faltan capturas, diagramas o repos; el texto "Te muestro una demo" es copy |
| K-05 | question (Q4) | Los años por habilidad los aprobó Teo en 04.1; cambiar la presentación toca diseño y copy |
| K-06 | fix-code | Ligaduras fi/ff del PDF desactivadas (`fontFeatureSettings`), con test del ToUnicode |
| K-07 | fix-code | README reescrito con el stack y los comandos reales; los ajustes de GitHub van a Q7 |
| K-08 | backlog | Entidad Testimonials ya está en docs/backlog.md; no hay citas reales que publicar |
| K-09 | backlog | Entidad Services ya está en docs/backlog.md; precios y condiciones son hechos que no existen en docs/content |
| K-10 | question (Q5) | El estilo de la etiqueta toca DESIGN.md y `sampleData` de Metales contradice "en uso" |
| K-11 | fix-content (C-1) | Renombrar dos habilidades en el admin: "Subagentes y skills" y "Css" |
| K-12 | fix-code + fix-content (C-2) | Alineación de las cifras en código (hecho); textos de las fuentes en el admin |
| K-13 | fix-code | Los backticks de Markdown se renderizan como `<code>` |
| K-14 | question (Q3) | Faltan cifras reales del bot; sin fuente no entran (D-10) |
| K-15 | question (Q6) | Enlace para agendar es un servicio nuevo (Cal.com); correo propio y guía de mensaje tocan copy |
| K-16 | question (Q6) | Faltan hechos: empleo a tiempo completo, reubicación, employer-of-record |
| K-17 | fix-content (C-3) + dismiss | Fecha repetida del curso de Claude Code se corrige en el admin; los cursos de Udemy los decidió Teo (D-12) |
| K-18 | question (Q3) | Falta el motivo de Supabase para el cliente; el texto actual es el que dio Teo |
| K-19 | question (Q3) | Faltan capturas del panel de ManuJ |
| K-20 | question (Q3) | Faltan cifras con fuente; sin ellas el resultado se queda cualitativo (D-10) |
| K-21 | question (Q7) | Descripción, homepage, licencia y contenido público del repo son ajustes de la cuenta de GitHub |
| K-22 | fix-code + dismiss | Doble disparo de CI corregido; migrar contra dev y el subconjunto de e2e son decisiones de QUAL-05 (05-CONTEXT) |
| K-23 | question (Q5) | Orden y fechas son contenido; miniaturas y pliegue tocan DESIGN.md (línea de backlog añadida) |
| K-24 | fix-code | CTAs como `<a>` con `buttonVariants`, sin `role="button"` |
| K-25 | backlog | Slugs localizados exigen cambiar el modelo de datos y la guardia de slugs |
| K-26 | fix-content (C-4) | Glosa de "kardex" en el caso de Prendo en inglés |
| K-27 | question (Q1) | Los títulos de puesto en inglés vienen de docs/copy.md; "Css" va en C-1 |
| K-28 | fix-code | Un solo mes se imprime una vez ("ago 2026") |
| K-29 | fix-code + dismiss | Footer a 24 px de alto; "Ask for a demo" es un enlace dentro de una frase (excepción de WCAG 2.5.8) |
| K-30 | backlog + question (Q1) | JSON-LD va a backlog; el título de /es depende de la decisión del titular |
| K-31 | dismiss | Positivo sin acción |

## Correcciones de código (rama `phase-05-review-fixes`)

Siete correcciones independientes, todas de nivel cadena o atributo (el plan pedía parar en unas seis solo si no eran pequeñas). Un commit por hallazgo. Ninguna toca DESIGN.md, docs/copy.md, docs/data-model.md, package.json ni archivos de rutas de `src/app`.

| ID | Commit | Qué cambia | Prueba |
|---|---|---|---|
| K-24 | e4085b2 | `HeroCta` y `CaseCta` pasan de Base UI Button con `nativeButton={false}` (que añade `role="button"`) a un `<a>` con `buttonVariants({ size: "lg" })` | `hero.test.tsx`, `case-study.test.tsx` |
| K-13 | baaa92a | `InlineText` convierte `` `x` `` en `<code>` en párrafos, listas y resultados | `case-study.test.tsx` |
| K-06 | a8d90be | `fontFeatureSettings: { liga: false, clig: false }` en la página del CV. Causa: el glifo de ligadura se escribe en el ToUnicode como `<0066 0069>` y los extractores estrictos descartan letras | `cv-document.test.tsx` (inspecciona los CMaps; falló antes del cambio) |
| K-29 | fe20c41 | `inline-block py-[3px]` en los enlaces del footer (18 px a 24 px) | `site-footer.test.tsx` |
| K-28 | 9979739 | El periodo de un solo mes se imprime una vez | `case-study.test.tsx` |
| K-07 | 7ea56d0 | README con el stack, la estructura, los comandos y las variables de entorno reales | n/a |
| K-22 | c6738f8 | `push` solo en `main` y `pull_request`: una rama con PR ya no corre dos veces | n/a (se ve en el PR) |
| K-12 (parte) | fd7a99e | `justify-end` en cada cifra: los valores comparten línea sin importar el largo de la etiqueta | `case-study.test.tsx` |

Evidencia en Preview (alias de la rama `mateojaras-dev-git-phase-05-rev-6df823-mateos-projects-85710491.vercel.app`, despliegue del commit fd7a99e): `E2E_BASE_URL=<alias> pnpm exec playwright test e2e/review-fixes.spec.ts --project=chromium`: 6 de 6 en verde (K-24 y K-29 en en y es, K-13 y K-28 sobre todos los proyectos publicados en la base dev). `pnpm check` en verde en la rama antes de la última corrección (K-12), y los tests del componente después.

Límites de la evidencia: la base `dev` de la Preview puede no tener los textos con backticks ni los periodos de un mes que sí tiene producción, así que K-13 y K-28 quedan probados por test unitario y vuelven a comprobarse en producción tras el merge. K-06 se prueba por estructura del PDF en test; el CV de producción sigue siendo el PDF viejo hasta que Teo pulse "Generar CV" en el admin tras el merge.

Sin pasar por Lighthouse: ninguna corrección cambia el layout público más que 6 px en el footer.

## Contenido propuesto

Todo se edita en https://mateojaras.dev/admin. Los textos usan solo hechos de docs/content/ (y de docs/copy.md para K-17). Sin rayas largas ni cifras nuevas.

### C-1 (K-11, y "Css" de K-27) Habilidades

Pantalla: `/admin/habilidades`. Campo: `name` (un solo campo para los dos idiomas).

| Actual | Propuesto | Fuente |
|---|---|---|
| Subagentes y skills | Subagents and skills | docs/content/prendo.md, `aiTools` en: "Own audit subagents", "Own design and domain skills" |
| Css | CSS | Ortografía del lenguaje; "CSS" ya aparece así en Educación |

Nota: el nombre es un solo campo, así que el sitio en español también mostrará "Subagents and skills" (como ya muestra "Claude Code" o "MCP"). Si prefieres que ese nombre salga en español en `/es`, habría que añadir un campo localizado, que cambia el modelo de datos.

### C-2 (K-12) Cifras de Prendo

Pantalla: `/admin/proyectos/<id de Prendo>`, sección de cifras (en y es). Hoy cada etiqueta lleva la fuente pegada. Propuesta: quitar "STATE.md", "Hecho de desarrollo, no resultado de negocio" y las frases defensivas, y dejar el origen y la fecha.

| Cifra | Etiqueta en (propuesta) | Etiqueta es (propuesta) |
|---|---|---|
| 38 | Architecture decision records (ADRs) in the Prendo repository, counted on 2026-11-25 | Decisiones de arquitectura registradas (ADR) en el repositorio de Prendo, recuento del 2026-11-25 |
| 767 | Test files in the Prendo repository, counted on 2026-11-25: 461 pytest, 205 Vitest and 101 Playwright | Archivos de prueba en el repositorio de Prendo, recuento del 2026-11-25: 461 de pytest, 205 de Vitest y 101 specs de Playwright |
| 9/16 | Roadmap phases complete in the Prendo repository, on 2026-11-25 | Fases completas de la hoja de ruta en el repositorio de Prendo, al 2026-11-25 |

La duda "¿lo generó un agente?" ya la contesta la sección de decisiones técnicas (herramientas de IA y validación) sin cambiar nada.

### C-3 (K-17) Educación, fecha repetida

Pantalla: `/admin/educacion`, fila "AI Coder: Complete Claude Code & Coding Agents Course". Campo: estado (en y es).

| Campo | Actual | Propuesto |
|---|---|---|
| status en | Completed Nov 2026 · 16.5 h | Completed · 16.5 h |
| status es | Completado nov 2026 · 16.5 h | Completado · 16.5 h |

La fecha ya sale arriba, del campo de fin (2026-11).

### C-4 (K-26) Glosa de "kardex"

Pantalla: `/admin/proyectos/<id de Prendo>`, decisiones técnicas en. Solo el inglés; en español el término es corriente.

| Campo | Actual | Propuesto |
|---|---|---|
| título de la decisión (en) | Stock derived from the kardex | Stock derived from the kardex (the log of inventory movements) |

Fuente: docs/content/prendo.md, "El inventario ... se calcula a partir de los movimientos del kardex". Confirma que esa definición es la correcta. "compraventas" ya se explica en el subtítulo de Prendo ("pawn shops with a store"); "third parties" queda como está porque docs/content no dice qué agrupa ese módulo.

## Preguntas para Teo

Q1 (K-01, K-27, K-30): ¿para quién trabajas y cómo lo dice el titular? Hoy: "I'm an AI full stack developer: I build complete products, from the database to the interface, with agents and tests." El único hecho de docs/copy.md sobre el público es "Busco proyectos con un problema claro y alguien que decida del otro lado". "Pequeños negocios de LatAm" lo infirieron los revisores. Esto toca docs/copy.md. En `/es` el titular y el título SEO llevan "AI full stack developer" en inglés, y la página sobre mí muestra los cargos en inglés ("Freelance · AI Full Stack Developer", "Mid-Senior Frontend Developer"): ¿se traducen en `/es` o los dejas en inglés?

Q2 (K-02): Metales y Brillantes "lleva más de 18 meses en uso" y aparece bajo Freelance, que empieza en sep 2025 (unos 14 meses). ¿Cuándo empezó a usarse y en qué rol lo construiste (estabas en Sofka)? Con ese hecho se corrige la frase o se mueve la viñeta.

Q3 (K-03, K-04, K-14, K-18, K-19, K-20): hechos y material que faltan. Metales y Brillantes: tu rol, decisiones técnicas y capturas (con el permiso del cliente). Prendo, bot y Metales: capturas o diagramas, y si prefieres cambiar "Te muestro una demo con datos de ejemplo" (copy). Bot: cifras reales (costo por anuncio, tasa de filtro, aciertos) o confirmar que se queda cualitativo. ManuJ: capturas del panel, el motivo de elegir Supabase pensando en el cliente (costo, mantenimiento) y cualquier cifra antes y después con fuente. Sin esto no se tocan.

Q4 (K-05): todas las habilidades de backend, AI y herramientas dicen "1 año" junto a 5 de frontend. Opciones: (a) dejarlo (es verdad), (b) ocultar los años de las de 1 año, (c) mostrar proyectos por habilidad. (b) y (c) tocan la presentación.

Q5 (K-10, K-23): (a) la etiqueta "Internal tool, sample data" se lee como una tecnología: cambiar su estilo toca DESIGN.md; (b) en docs/content Metales y Brillantes tiene `sampleData: true` pero "en uso hace 18 meses": ¿son datos de ejemplo la demo, o la etiqueta sobra? (c) el orden (oct, ago, oct) lo manda la columna de orden en el admin y tres proyectos no tienen fecha: dime las fechas o el orden. (d) miniaturas y un proyecto sobre el pliegue: añadí una línea a docs/backlog.md.

Q6 (K-15, K-16): enlace para agendar (Cal.com es una cuenta nueva, fase 4 del plan original: ¿la creamos o no?), correo propio (¿existe un buzón en mateojaras.dev?), una línea de guía en el formulario (presupuesto, plazo) y señal de que se aceptan ofertas de empleo: tocan docs/copy.md. Disponibilidad: ¿tiempo completo o solo contrato, reubicación, employer-of-record?

Q7 (K-21, K-07): ajustes de GitHub que haces tú: descripción, homepage `https://mateojaras.dev` (hoy apunta a mateojaras-dev.vercel.app) y licencia (¿cuál, o ninguna?). Además, el repo es público con `.planning/`, `.agents/`, `.claude/`: ¿se queda así?

## Respuestas de Teo

(pendiente)
