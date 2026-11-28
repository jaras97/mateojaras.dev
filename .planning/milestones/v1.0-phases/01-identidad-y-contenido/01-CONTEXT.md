# Phase 1: Identidad y contenido - Context

**Gathered:** 2026-10-30
**Status:** Ready for planning

<domain>
## Phase Boundary

La fase entrega la identidad aprobada por Teo y el contenido real dentro del repo:
- `DESIGN.md` en APROBADO, con las dos frases del concepto escritas por Teo.
- Tokens OKLCH (claro y oscuro), escala tipográfica y tema shadcn propio en `globals.css`.
- Funnel Display, Hanken Grotesk y Geist Mono servidas desde el propio dominio, y TTF estáticos para el PDF en `assets/fonts-pdf/`.
- 3 variantes del hero en código, con datos de un fixture tipado contra `site_settings`. Teo elige una y la elección se registra en `docs/decisions.md`.
- Los 4 proyectos completos en `docs/content/` (en/es).
- Al menos 3 capturas 16:10 por proyecto en `material/`.
- `docs/copy.md` sin marcadores.

Requisitos: IDEN-01 a IDEN-07. Fuera de alcance: base de datos, next-intl, auth, movimiento (GSAP/Motion) y cualquier ruta pública definitiva. Todo eso pertenece a las fases 2 a 4.

</domain>

<decisions>
## Implementation Decisions

### Variantes del hero
- **D-01:** Las 3 variantes exploran **jerarquías distintas**, no densidades del mismo layout:
  - **A:** headline display grande arriba y la línea de estado debajo.
  - **B:** la página abre con la línea de estado en mono, como la primera entrada de una bitácora con fecha, disponibilidad y UTC-5; una regla de separación y el headline debajo.
  - **C:** índice editorial, con el headline en las columnas principales y las secciones numeradas (01 Work, 02 About, 03 Contact) en la columna del margen.
  Ninguna lleva dots pulsantes ni indicadores animados. Si hay un punto de estado, es estático (regla de CLAUDE.md).
- **D-02:** Las variantes y la página de muestra de tokens viven en una **ruta temporal `/lab`** (`/lab/hero`, `/lab/tokens`). Teo la aprobó en esta discusión. Se borra cuando Teo elige la variante (antes de cerrar la fase o al principio de la fase 2). No es una ruta pública: queda fuera del futuro `[locale]`, sin enlaces y con `noindex`. — **Reversibility:** reversible — es temporal y nada depende de ella.
- **D-03:** El fixture usa el **headline real de Teo** (en/es). Teo lo escribe antes de construir las variantes. Mientras tanto se usa el ejemplo de `docs/copy.md`, marcado como borrador en el fixture. El fixture cumple el tipo de `site_settings` de `docs/data-model.md` (`headlineEn/Es`, `availabilityStatus`, `availableFrom`, `timezone`, `location`...). No se inventan datos: los campos que aún no existan se dejan vacíos y el componente no los renderiza.
- **D-04:** Las variantes son **solo estáticas**: sin SplitText, sin reveal y sin GSAP. El movimiento se construye en la fase 4.
- **D-05:** Revisión antes de que Teo elija: capturas con Playwright en 390, 768 y 1440 px, en claro y oscuro, de cada variante, más `/impeccable:critique` por variante. Los hallazgos se reportan a Teo junto a las capturas.

### Flujo del contenido
- **D-06:** Los 4 proyectos se arman por **entrevista**: Claude pregunta de forma concreta por proyecto (problema, rol, solución, resultados, 2–3 decisiones técnicas, URLs y cifras con su fuente), Teo responde y sus respuestas se convierten en el archivo. Claude solo corrige gramática y naturalidad y **no inventa ni redacta contenido** a partir de los sitios.
- **D-07:** Teo responde **en español**. Claude propone la versión en inglés y la marca como traducción pendiente de aprobación (p. ej. `en_status: draft-translation` en el front-matter, o un comentario) hasta que Teo la apruebe. Esto aplica también al copy de `docs/copy.md`.
- **D-08:** Formato: **un Markdown por proyecto con front-matter YAML**, `docs/content/<slug>.md`. El front-matter lleva los campos estructurados: slug, títulos, URLs (`liveUrl`, `repoUrl`), permiso del cliente, métricas `{label, value, source}`, fechas, stack y decisiones técnicas. El cuerpo lleva los textos largos en/es por secciones. Los nombres de campo siguen `docs/data-model.md` (camelCase) para que el seed de la fase 2 los lea directo. — **Reversibility:** costly — el seed de la fase 2 se escribe contra este formato.
- **D-09:** **El copy y los proyectos van separados.** `docs/copy.md` queda solo para hero, about, now, experiencia, contacto y footer, y se elimina su bloque "Proyectos", que pasa a `docs/content/`. Teo aprobó esta edición de `copy.md` en la discusión.
- **D-10:** **Una métrica sin fuente verificable no entra.** Si no hay número con fuente (analytics, Lighthouse/PageSpeed, el cliente), el resultado se cuenta en texto cualitativo.
- **D-11:** **La fuente va dentro de la etiqueta**, sin cambiar el esquema (`metrics: {label, value}[]`). En `docs/content/` se guarda `source` aparte y el seed de la fase 2 lo une a la etiqueta, p. ej. `"Lighthouse móvil (PageSpeed, oct 2026)"`. No se toca `docs/data-model.md`.
- **D-12:** Respuestas de Teo a las preguntas de contenido del roadmap:
  - ManuJ y EcoExport dieron permiso para mostrar capturas y cifras: `permiso: sí` en ambos.
  - El repo de la App de Finanzas Personales es **público**, así que se enlaza `repoUrl`.
  - About **menciona "contratista independiente"**.
  - La fuente de la métrica va en la etiqueta (D-11).

### Capturas en material/
- **D-13:** ManuJ y EcoExport (en vivo) se capturan con un **script de Playwright** en `scripts/` que toma vistas definidas a 1440×900 (16:10) y que se puede volver a correr. Teo elige qué vistas (home, catálogo, reserva...). `@playwright/test` ya está instalado.
- **D-14:** El inventario y la app de finanzas se capturan **corriéndolas en local con datos de ejemplo**: Teo las levanta con su seed de ejemplo y el script de Playwright las captura. Esas capturas se marcan como "datos de ejemplo" (nombre de archivo o un `README.md` en la carpeta) y la ficha del proyecto lo dice.
- **D-15:** Estructura: `material/<slug>/NN-vista.png` (original) y `.webp` optimizado a 1600 px de ancho. Antes de commitear, porque el repo es público, se revisa que no haya datos personales de clientes reales a la vista. En la fase 3 se suben a Blob.

### Fuentes y tema
- **D-16:** Las fuentes web se cargan con **`next/font/google`**: Funnel_Display, Hanken_Grotesk y Geist_Mono, con subsets `latin` y `latin-ext`, variables y `display: 'swap'`. Se descargan en el build y se sirven desde `/_next`, así que no hay ninguna petición a un CDN de fuentes. Hay que **ajustar DESIGN.md §2**, que dice `next/font/local`; Teo lo aprobó en la discusión. Se elimina `Geist` (sans) del `layout.tsx` del scaffold.
- **D-17:** El modo oscuro se activa con la **clase `.dark`** (shadcn y el `@custom-variant dark` actual). Hay que **ajustar DESIGN.md §3**, que dice `:root[data-theme="dark"]`; Teo lo aprobó en la discusión. El toggle con View Transitions y el script anti-flash son de la fase 4. En `/lab` basta con un interruptor simple para revisar los dos temas.
- **D-18:** Los **tokens de DESIGN.md son la fuente**: `--bg`, `--bg-elev`, `--ink`, `--ink-2`, `--line`, `--accent`, `--accent-ink` en claro y oscuro. Las variables de shadcn son alias de esos tokens (`--background: var(--bg)`, `--foreground: var(--ink)`, `--primary: var(--ink)`, `--border: var(--line)`, `--ring: var(--accent)`...). Se mantienen el acento único y los radios de DESIGN.md (4px en controles, 8px en imágenes y 0 en contenedores). Se borra el tema gris por defecto de `globals.css`. — **Reversibility:** costly — todos los componentes de las fases 3 y 4 consumen estos nombres.
- **D-19:** TTF del PDF en `assets/fonts-pdf/`: los static/ oficiales de Google Fonts, Hanken Grotesk (Regular, Bold, Italic) y Geist Mono (Regular). Si Funnel Display no tiene carpeta static/, se instancia con `fonttools varLib.instancer` en los pesos 600 y 700. fonttools es una herramienta local de un solo uso y no entra como dependencia del proyecto. Se verifican los glifos latin-ext (á é í ó ú ü ñ ¿ ¡) en cada archivo.

### Claude's Discretion
- La estructura interna de los componentes del hero (nombres y props) y del fixture, siempre tipados contra `site_settings`.
- El contenido exacto de `/lab/tokens`: muestras de color, escala tipográfica y componentes shadcn con el tema.
- El guion de preguntas de la entrevista por proyecto, siempre que cubra todos los campos de IDEN-05.
- La herramienta para pasar PNG a WebP. Por la regla del proyecto no se añade ninguna dependencia sin preguntar: hay que usar algo ya disponible (CLI local tipo `cwebp` o `sips`) o pedir permiso antes.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Alcance y reglas del proyecto
- `PROJECT.md` (raíz): manda sobre `.planning/`. Contiene las fases, las compuertas, lo prohibido y los límites de autonomía.
- `CLAUDE.md` (raíz) y `.claude/CLAUDE.md`: reglas de diseño prohibido, autonomía y verificación (capturas y auditorías por vista). `.claude/CLAUDE.md` §15 trata fuentes y tema.
- `.planning/REQUIREMENTS.md`: IDEN-01 a IDEN-07.
- `.planning/ROADMAP.md` (Phase 1): criterios de éxito, gate y aprobaciones.

### Identidad
- `DESIGN.md`: concepto, tipografía (§2), color OKLCH (§3), layout (§4) y componentes (§6). §2 y §3 se ajustan según D-16 y D-17.
- `docs/decisions.md`: formato de registro; aquí van la variante elegida y estas decisiones.

### Contenido
- `docs/copy.md`: copy del sitio. Se quita el bloque de proyectos (D-09).
- `docs/data-model.md`: contrato de `site_settings` (fixture del hero) y de `projects` (campos del front-matter, `metrics`, `TechDecisions`).
- `docs/backlog.md`: lo que no se hace.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/button.tsx`: Button de shadcn (style `base-nova`, Base UI). Hay que tematizarlo con los tokens.
- `src/lib/utils.ts`: helper `cn`.
- `@playwright/test` ya está instalado, así que sirve para el script de capturas y para las capturas de revisión.

### Established Patterns
- `src/app/globals.css`: Tailwind v4 con `@theme inline` y el tema gris por defecto de shadcn. Tiene `@custom-variant dark (&:is(.dark *))`. Las variables del tema por defecto se reemplazan por los alias a los tokens (D-18).
- `src/app/layout.tsx`: el scaffold carga `Geist` + `Geist_Mono` con `next/font/google`, `lang="en"` y la metadata "Create Next App". Se reemplazan por las tres familias del proyecto (D-16). El layout definitivo `[locale]` es de la fase 2, así que no hay que adelantarlo.
- `src/app/page.tsx`: placeholder del scaffold; no se toca en esta fase (D-02).

### Integration Points
- `/lab` se monta como ruta de desarrollo independiente y se elimina tras la elección.
- `docs/content/<slug>.md`: lo consume `scripts/seed.ts` en la fase 2.
- `assets/fonts-pdf/`: lo consume `@react-pdf/renderer` en la fase 3 (`outputFileTracingIncludes`).
- `material/`: se sube a Vercel Blob en la fase 3.

</code_context>

<specifics>
## Specific Ideas

- Referencia visual de las variantes:
  ```
  A  I build complete web apps / with React and Next.js…
     Available Nov 2026 · Medellín
  B  2026-10-30 · Available · UTC-5
     ───
     I build complete web apps…
  C  I build complete   │ 01 Work
     web apps…          │ 02 About
                        │ 03 Contact
  ```
- Las dos frases del concepto (IDEN-01) las escribe Teo; Claude no propone redacción.
- Orden práctico sugerido por las dependencias:
  1. Tokens, fuentes y `/lab/tokens`.
  2. Teo escribe el headline.
  3. Variantes del hero y revisión.
  4. En paralelo: la entrevista de contenido y las capturas.
  5. Al final: el copy y las frases del concepto, y DESIGN.md pasa a APROBADO.

</specifics>

<deferred>
## Deferred Ideas

None. La discusión no salió del alcance de la fase.

</deferred>

---

*Phase: 01-identidad-y-contenido*
*Context gathered: 2026-10-30*
