# 01: revisión del lab antes de elegir el hero (D-05)

Primera mitad del paquete de revisión (plan 01-08): capturas, auditoría de `/lab/tokens` y comprobaciones automáticas. La crítica por variante y tu elección (G3) llegan en 01-09, que añade sus secciones a este mismo archivo. Aquí no se corrigió nada ni se prefiere ninguna variante: los hallazgos se reportan y tú decides.

Fecha: 2026-10-30. Build de producción (`pnpm build` + `next start`), Chromium 156 de Playwright, `reducedMotion: reduce`, fuentes cargadas (`document.fonts.ready`) antes de cada captura.

## Capturas

Carpeta: `.lab-captures/` en la raíz del repo (`/Users/mateojaramillo/projects/mateojaras.dev/.lab-captures/`). Está en `.gitignore` y nunca entra en git.

Regla de nombre: `{variante}-{tema}-{idioma}-{ancho}.png`. Página completa, URL `/lab/hero?variant=…&theme=…&lang=…&capture=1` (sin la barra del lab). Viewports: 390×844, 768×1024 y 1440×900. Inglés en claro y oscuro a los tres anchos (18), español en claro a 390 y 1440 (6). Total: 24.

Se regeneran con `pnpm build && node scripts/capture-lab.ts capture`.

**Variante A**
- a-light-en-390.png
- a-light-en-768.png
- a-light-en-1440.png
- a-dark-en-390.png
- a-dark-en-768.png
- a-dark-en-1440.png
- a-light-es-390.png
- a-light-es-1440.png

**Variante B**
- b-light-en-390.png
- b-light-en-768.png
- b-light-en-1440.png
- b-dark-en-390.png
- b-dark-en-768.png
- b-dark-en-1440.png
- b-light-es-390.png
- b-light-es-1440.png

**Variante C**
- c-light-en-390.png
- c-light-en-768.png
- c-light-en-1440.png
- c-dark-en-390.png
- c-dark-en-768.png
- c-dark-en-1440.png
- c-light-es-390.png
- c-light-es-1440.png

**Para mirar con atención: cuántas líneas ocupa el headline.** Lo medí sobre el build (alto de `#hero-title` entre su line-height):

| Ancho | EN | ES |
|---|---|---|
| 390 px (44.8 px) | 10 líneas | 13 líneas |
| 768 px (46 px) | 5 líneas | sin captura |
| 1440 px (72 px) | 8 líneas | 10 líneas |

Es igual en A, B y C porque las tres usan el mismo tamaño y `text-wrap: balance`; lo que cambia es lo que queda alrededor (en C, el índice a la derecha). El headline en español es el borrador que escribí a tu pedido y a 390 px llena casi toda la primera pantalla. No lo acorto aquí: es una pregunta para ti en 01-09.

## /lab/tokens: auditoría

`/impeccable audit` sobre `src/app/lab/tokens/page.tsx` (más `specimens.tsx`, `button.tsx` y `status-line.tsx`), con el detector de impeccable sobre el código y sobre la página servida a 1440×900 y 390×844, axe con todas las severidades (incluidas `wcag22aa` y `best-practice`) a 390 y 1440, y un recorrido con teclado. Solo se usó `audit`. No se ejecutaron `init` ni `document`, y no se creó PRODUCT.md (el contexto de producto salió de PROJECT.md).

### Puntuación

| # | Dimensión | Nota | Hallazgo clave |
|---|---|---|---|
| 1 | Accesibilidad | 3 | La tabla de contraste hace scroll horizontal por debajo de ~500 px y ese contenedor no tiene `tabindex` (axe: serious a 390) |
| 2 | Rendimiento | 4 | Página estática con fuentes de `next/font`; no se midió con Lighthouse (es una ruta temporal) |
| 3 | Theming | 3 | Todo sale de tokens; el par `--accent-ink` sobre `--accent` en claro (3.24:1) fallaría si algún día se usa como texto |
| 4 | Responsive | 3 | Sin scroll horizontal de página a 390; la tabla desborda dentro de su contenedor; botones `sm` de 32 px |
| 5 | Integridad | 4 | Las dos alertas del detector apuntan a decisiones fijadas en DESIGN.md, no a desvíos |
| **Total** | | **17/20** | **Bien** |

Veredicto de integridad: pasa. La página expone el sistema de DESIGN.md tal cual: siete tokens en claro y oscuro con sus valores OKLCH, la escala tipográfica completa, espaciado y radios, los botones con su anillo de foco y la StatusLine en sus ocho estados. Sin colores sueltos (las muestras usan `var(--token)`), sin gradientes, sin sombras, sin librerías de efectos.

Recuento: P0 ninguno, P1 dos, P2 dos, P3 uno, más tres notas del detector.

### Críticos

Ninguno. Nada impide usar la página ni falla WCAG A.

### Importantes

**[P1] La región con scroll de la tabla de contraste no es accesible con teclado en todos los navegadores**
- Dónde: `src/app/lab/_components/specimens.tsx`, `ContrastTable`, `<div className="overflow-x-auto">`.
- Evidencia: a 390 px la tabla mide 455 px dentro de 342 px. axe marca `scrollable-region-focusable` (serious). Chromium 156 hace enfocable ese contenedor por su cuenta (en el recorrido, el primer Tab cae ahí con contorno en el acento). Firefox también lo hace según su comportamiento documentado (no lo probé). Safari no. Por eso, si no tiene `tabindex`, alguien con teclado en Safari no puede desplazar la columna "Lectura".
- Estándar: WCAG 2.1.1 (Teclado).
- Cobertura: la compuerta axe del plan corre a 1440, donde la tabla cabe, y por eso pasa. Este fallo solo aparece a 390. Las tres variantes del hero no tienen ninguna violación a 390 ni a 768 (claro y oscuro, en y es), así que el hueco afecta solo a esta página.
- Posible arreglo (sin aplicar): `tabIndex={0}`, `role="region"` y `aria-label` en el contenedor, o apilar la tabla en móvil. Comando sugerido: `/impeccable harden`.

**[P1] Contraste del acento en claro (medido, va a 01-09)**
- Medido en el build: el acento en claro es `lab(59.2 48.5 50.8)` sobre `--bg`, 3.19:1, igual que la tabla de UI-SPEC. En esta página aparece solo como elemento no textual: la muestra de color, los puntos de estado de 8 px y el anillo de foco (2 px con 2 px de separación). Para todo eso pasa el mínimo de 3:1 (WCAG 1.4.11), y el punto nunca es la única señal porque al lado va el texto ("Available now"). axe no encontró ningún `color-contrast` a 390 ni a 1440.
- Riesgo: como texto normal, el acento en claro falla 4.5:1 (3.19 sobre `--bg`, 3.01 sobre `--bg-elev`), y `--accent-ink` sobre `--accent` falla para texto de 14 a 16 px (3.24). DESIGN.md prevé el acento en "el enlace activo" y "el número de la sección actual": si eso es texto pequeño en claro, no cumple AA. Es una decisión de paleta, así que es tuya y se lleva a 01-09 como P1.
- Estándar: WCAG 1.4.3 / 1.4.11.

### Menores

**[P2] Botones `sm` de 32 px de alto.** Cumplen el mínimo AA de 24×24 (2.5.8) y el espacio entre ellos es suficiente, pero quedan por debajo de los 44 px cómodos para dedo. Los tamaños `default` (40) y `lg` (44) están bien. Si `sm` llega al sitio público, revisar. `/impeccable adapt`.

**[P2] El foco del contenedor de la tabla usa el `outline: auto` del navegador.** Se ve (en el color del acento por la regla global), pero no es el mismo anillo de 2 px con separación de los botones. Se resuelve junto con el P1 de la tabla. `/impeccable polish`.

**[P3] Viudas a 390 px.** El detector encontró tres líneas finales de una sola palabra: "¡" en la muestra de glifos, "1.1" en una etiqueta de la escala y "G7" en una nota. No afectan a nadie. Es una página de inspección.

**Notas del detector, verificadas en contexto:**
- `overused-font` (Geist Mono, 82 % del texto): en esta página casi todo son etiquetas técnicas en mono, que es lo que DESIGN.md §2 pide para fechas, estados y etiquetas. La fuente está fijada por DESIGN.md. No la cambio y la decisión es tuya.
- `cream-palette` (fondo `rgb(252, 250, 246)`): es `--bg: oklch(0.985 0.006 80)`, "fondo cálido casi blanco", fijado en DESIGN.md §3. Igual: decisión tuya, no un desvío.
- `em-dash-overuse` (36): falso positivo. El detector cuenta `--` y aquí son nombres de tokens (`--bg`, `--ink-2`, `--text-xl`…). La página no tiene ni un em-dash.

### Lo que funciona

- Jerarquía semántica limpia: un `h1`, un `h2` por sección numerada, `h3` dentro, y la tabla con `caption`, `th scope="col"` y `th scope="row"`.
- Recorrido con teclado: 15 paradas en los botones, en el orden visual, sin trampas. El botón deshabilitado queda fuera del orden, como debe ser. Cada botón muestra un anillo de 2 px del color `--ring` con 2 px de separación sobre el fondo.
- Movimiento: los botones animan solo color, y el `translate-y-px` al pulsar va detrás de `motion-safe`.
- Tema: la columna oscura es un contenedor `.dark` anidado y los tokens se resuelven dentro, así que los dos temas se ven a la vez sin duplicar valores.
- La página es `noindex` y el layout del lab da 404 en producción de Vercel.

### Acciones sugeridas (no aplicadas)

1. [P1] `/impeccable harden`: hacer la región de la tabla enfocable y con nombre, o apilarla en móvil.
2. [P1] Decisión tuya en 01-09: dónde puede ir el acento como texto en tema claro.
3. [P2] `/impeccable adapt`: tamaño `sm` si llega a superficies táctiles.
4. `/impeccable polish` al final, si se aplica algo de lo anterior.

## Comprobaciones automáticas

Todas contra el build de producción (`pnpm build`, después `next start -p 3100`).

**`pnpm check`** (typecheck, lint, test y build): pasa.

**`node scripts/capture-lab.ts check`**:

```
PASS /lab answers 200 and links to /lab/tokens and /lab/hero
PASS /lab/tokens answers 200, is noindex and shows 8+ format samples in section 05
PASS /lab/hero with no params shows the lab bar on A, Claro, EN and the headline notes
PASS /lab/hero?variant=a&lang=en&capture=1 renders the fixture headline at 390px
PASS /lab/hero?variant=a&lang=es&capture=1 renders the fixture headline at 390px
PASS /lab/hero?variant=a&theme=dark resolves var(--bg) in dark inside the lab root
PASS /lab/hero?variant=b&lang=en&capture=1 renders the fixture headline at 390px
PASS /lab/hero?variant=b&lang=es&capture=1 renders the fixture headline at 390px
PASS /lab/hero?variant=b&theme=dark resolves var(--bg) in dark inside the lab root
PASS /lab/hero?variant=c&lang=en&capture=1 renders the fixture headline at 390px
PASS /lab/hero?variant=c&lang=es&capture=1 renders the fixture headline at 390px
PASS /lab/hero?variant=c&theme=dark resolves var(--bg) in dark inside the lab root
PASS /lab/hero?variant=c at 1440px puts the index in the right columns behind a 1px rule, top-aligned with the headline
PASS /lab/hero?variant=zz shows the unknown-variant message with links to A, B and C
PASS axe /lab/tokens at 1440px: no serious or critical violation
PASS axe /lab/hero?variant=a&theme=light at 1440px: no serious or critical violation
PASS axe /lab/hero?variant=a&theme=dark at 1440px: no serious or critical violation
PASS axe /lab/hero?variant=b&theme=light at 1440px: no serious or critical violation
PASS axe /lab/hero?variant=b&theme=dark at 1440px: no serious or critical violation
PASS axe /lab/hero?variant=c&theme=light at 1440px: no serious or critical violation
PASS axe /lab/hero?variant=c&theme=dark at 1440px: no serious or critical violation
lab check: 21 passed, 0 failed
```

**`node scripts/capture-lab.ts capture`**:

```
lab capture: 24 written to /Users/mateojaramillo/projects/mateojaras.dev/.lab-captures
```

**Axe.** Se instaló `@axe-core/playwright` 4.14.0 (versión exacta, devDependency) porque 01-03-ANSWERS.md dice `axe: sí` (tu respuesta G1: "1 si, 2 si"; el punto 2 era este paquete) y `axe-legitimidad: verificado` (tu respuesta: "verificado, …"). Etiquetas: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`. Falla ante cualquier violación `serious` o `critical`.

Resultado de la compuerta del plan (1440 px): **ninguna violación serious ni critical** en `/lab/tokens` ni en `/lab/hero` A, B y C, en claro y oscuro.

Fuera de la compuerta, en la auditoría:
- `/lab/hero` A, B y C a 390 y 768 px, claro y oscuro, en y es (24 combinaciones): 0 violaciones de cualquier severidad.
- `/lab/tokens` a 390 px: 1 violación `scrollable-region-focusable` (serious). Es el P1 de la auditoría. La compuerta no la ve porque solo corre a 1440.

**Sustituto manual (recorrido con teclado):** se hizo de todos modos. Está en "Lo que funciona" y en el P1 de la tabla.

## Variante A

`/impeccable critique` sobre `src/components/site/hero/hero-a.tsx` (con `hero-parts.tsx` y `status-line.tsx`). Solo se usó `critique`: no se ejecutaron `init` ni `document`, no se creó PRODUCT.md (el contexto de producto salió de PROJECT.md) y no se corrigió nada.

Método: DEGRADED: single-context (esta sesión no tiene herramienta de subagentes, así que la revisión de diseño y el detector corrieron en el mismo contexto, en ese orden: primero la lectura de las capturas, después el detector). Detector: `impeccable detect` sobre los tres archivos (0 hallazgos) y sobre la página servida (`next start`, `capture=1`) a 390×844 y 1440×900 en en y es. No hubo overlay en una pestaña [Human]: no hay navegador interactivo en esta sesión. Medidas de posición con Playwright sobre el mismo build. El informe no se archivó en `.impeccable/critique/`: este archivo es el archivo.

**Capturas (evidencia):**
- a-light-en-390.png
- a-light-en-768.png
- a-light-en-1440.png
- a-dark-en-390.png
- a-dark-en-768.png
- a-dark-en-1440.png
- a-light-es-390.png
- a-light-es-1440.png

**Qué comunica la jerarquía.** Primero quién eres y qué haces (el headline, en display a 44.8 px en móvil y 72 px en escritorio), después el dato de bitácora (disponibilidad, lugar, huso, solapamiento, en mono 14 px) y al final la acción (CTA de 44 px relleno de tinta). Un solo foco, lectura de arriba abajo, sin nada que compita. El concepto "bitácora" vive solo en la línea de estado; el resto es un hero de texto clásico.

**Líneas del headline a 390 px:** EN 10, ES 13. **Las dos pasan de 7.** (768 px: EN 5, ES 6. 1440 px: EN 8, ES 10.)

**Puntuación (heurísticas aplicables).** 1 Estado del sistema 3 (la disponibilidad es lo primero que se ve después del headline) · 2 Lenguaje del usuario 3 · 4 Consistencia 4 · 6 Reconocer antes que recordar 3 · 8 Estética y minimalismo 3 (el largo del headline). 3, 5, 7, 9 y 10 son n/a en un hero sin flujo ni formulario. **Total 16/20 (80 %, Bien).**

### Críticos

Ninguno. Nada impide leer ni actuar, y axe no encontró ninguna violación a 390, 768 ni 1440.

### Importantes

**[P1] El headline ocupa casi toda la primera pantalla y en español empuja el CTA fuera de ella.**
- Medido sobre el build: a 1440×900 en español la línea de estado empieza en y=888 y el CTA termina en y=1027, los dos por debajo del pliegue. A 390×844 en español el CTA termina en y=886, también fuera. En inglés el CTA queda dentro por poco (y=843 de 900 a 1440; y=712 de 844 a 390).
- El detector lo marca como `oversized-h1` a 1440: 72 px, 143 caracteres, 70 % del alto en inglés; 165 caracteres, 88 % en español.
- Por qué importa: un reclutador o cliente que entra en escritorio con el sitio en español ve solo el headline, sin la disponibilidad ni la acción.
- Afecta igual a A, B y C (mismo tamaño y mismo texto). Es una cuestión de copy (ver P2 en "Preguntas abiertas") o de tamaño, no del layout de A.
- Comando sugerido: `/impeccable typeset` o `/impeccable clarify`.

**[P1] `text-wrap: balance` deja de actuar con más de 6 líneas, y aparecen huérfanas.**
- En a-light-en-1440.png y a-dark-en-1440.png la línea 8 es solo "it.". En a-light-es-390.png quedan "desde la" y "primera" en líneas cortas seguidas. Chromium solo equilibra párrafos de hasta 6 líneas; por encima corta como un párrafo normal. A 768, con 5 y 6 líneas, el equilibrado sí funciona y el bloque se ve compacto (a-light-en-768.png).
- Por qué importa: la palabra suelta al final del bloque más grande de la página es lo que más se nota en una composición tipográfica.
- Se resuelve si el headline baja de 6 líneas en cada ancho; no hay arreglo de CSS que lo garantice con este largo.
- Comando sugerido: `/impeccable typeset`.

### Menores

**[P2] La línea de estado se parte mal en español a 390.** En a-light-es-390.png ocupa 3 líneas y la segunda es solo "UTC-5 ·". A 1440 en español ocupa 2 líneas. En inglés cabe en 2 a 390 y en 1 desde 768. Comando sugerido: `/impeccable adapt`.

**[P2] A 1440 las columnas 10 a 12 quedan vacías.** El texto va en las columnas 2 a 9 (DESIGN.md §4 reserva una columna de margen), pero en A no hay nada en el margen y la composición pesa a la izquierda (a-light-en-1440.png). Es coherente con el layout editorial; solo se nota más que en C, que usa ese espacio.

**[P3] El remate de la "b" y la "d" de Funnel Display parece un punto suelto en móvil.** En a-light-en-390.png "I build" se lee casi como "I .build". Es el diseño de la fuente (DESIGN.md §2), no un error; vale mirarlo a tamaño real.

**Detector:** `cream-palette` en todas las páginas (el `--bg` cálido de DESIGN.md §3, decisión tuya, no un desvío) y `oversized-h1` a 1440 (coincide con el primer P1). Nada más.

### Lo que funciona

- Un solo acento por vista: el punto de estado. El texto de la línea va en tinta, así que el contraste no depende de la terracota.
- El tema oscuro es el mismo sistema con otros valores; no aparece ningún color nuevo ni se pierde jerarquía (a-dark-en-768.png).
- El CTA es el único elemento relleno de la página: no hay duda sobre qué hacer después de leer.

## Variante B

`/impeccable critique` sobre `src/components/site/hero/hero-b.tsx`. Mismo método y mismas reglas que en A (DEGRADED: single-context; detector sobre el archivo, 0 hallazgos, y sobre la página servida a 390 y 1440 en en y es; nada corregido, sin PRODUCT.md).

**Capturas (evidencia):**
- b-light-en-390.png
- b-light-en-768.png
- b-light-en-1440.png
- b-dark-en-390.png
- b-dark-en-768.png
- b-dark-en-1440.png
- b-light-es-390.png
- b-light-es-1440.png

**Qué comunica la jerarquía.** Abre como una entrada de bitácora: la fecha (`2026-10-30`, de `updatedAt`), la disponibilidad con el punto, el lugar, el huso y el solapamiento, todo en mono pequeño; una regla de 1 px la cierra y debajo va el headline, y al final el CTA. Lo primero que se lee es "cuándo y en qué estado", después "qué hago". Es la variante que más se parece al concepto de DESIGN.md §1, y la que más tarda en decir quién eres: el headline empieza en y=186 a 390 (en A y C, en y=48).

**Líneas del headline a 390 px:** EN 10, ES 13. **Las dos pasan de 7.** (768 px: EN 5, ES 6. 1440 px: EN 8, ES 10.)

**Puntuación (heurísticas aplicables).** 1 Estado del sistema 4 (fecha y estado son lo primero) · 2 Lenguaje del usuario 3 · 4 Consistencia 4 · 6 Reconocer antes que recordar 3 · 8 Estética y minimalismo 2 (dos bloques de texto antes de la acción). 3, 5, 7, 9 y 10 son n/a. **Total 16/20 (80 %, Bien).**

### Críticos

Ninguno. axe sin violaciones a 390, 768 y 1440.

### Importantes

**[P1] Con la entrada de estado arriba, el CTA sale de la primera pantalla también en inglés.**
- Medido: la cabecera de estado y la regla bajan todo unos 113 px. A 1440×900 el CTA termina en y=902 en inglés y en y=1060 en español; a 390×844 en español termina en y=919. En inglés a 390 queda dentro (y=771).
- El detector marca `oversized-h1` a 1440 igual que en A (70 % y 88 % del alto).
- Por qué importa: es la única variante en la que el visitante de escritorio en inglés tampoco ve la acción sin desplazarse.
- Comando sugerido: `/impeccable typeset` o `/impeccable clarify` (largo del headline, P2).

**[P1] La fecha de la entrada puede jugar en contra.**
- Es `updatedAt` de `site_settings`, fija en el shell prerenderizado (P3). Si el estado no se toca en tres meses, el visitante lee "2026-10-30 · Available now" en enero y duda de que siga disponible: la marca que hace de B una bitácora pasa a ser una marca de abandono.
- Por qué importa: en A y C la misma información no lleva fecha y no envejece a la vista.
- Depende de un hábito (actualizar el estado desde el admin) más que del código. Comando sugerido: `/impeccable clarify`.

**[P1] La misma huérfana que en A.** "it." sola en la línea 8 a 1440 (b-light-en-1440.png) y "desde la / primera" en líneas cortas a 390 en español (b-light-es-390.png). Misma causa: más de 6 líneas, `text-wrap: balance` no actúa. Comando sugerido: `/impeccable typeset`.

### Menores

**[P2] La línea de estado ocupa 3 líneas a 390 (en y es) y 2 a 768 y 1440.** Con la fecha delante tiene cinco segmentos; en b-light-en-390.png las tres líneas terminan en "·". Se lee como un bloque de metadatos y no como una línea. Comando sugerido: `/impeccable adapt`.

**[P3] Fecha en formato ISO igual en los dos idiomas.** `2026-10-30` es inequívoco y cuadra con la mono de bitácora; solo se nota que no se localiza (en español no dice "30 oct 2026").

**Detector:** `cream-palette` (decisión de DESIGN.md §3) y `oversized-h1` a 1440. Nada más.

### Lo que funciona

- Es la traducción más directa de "la bitácora de un taller": entrada fechada, regla, texto. Nadie más abre un portafolio así.
- La regla de 1 px en `--line` separa metadatos y declaración sin bloques de color ni sombras (b-light-en-1440.png, b-dark-en-768.png).
- En oscuro la fecha y los segmentos secundarios en `--ink-2` siguen leyéndose bien (b-dark-en-390.png, b-dark-en-1440.png).

## Variante C

`/impeccable critique` sobre `src/components/site/hero/hero-c.tsx` (con `section-number.tsx`). Mismo método y mismas reglas que en A (DEGRADED: single-context; detector sobre los archivos, 0 hallazgos, y sobre la página servida a 390 y 1440 en en y es; nada corregido, sin PRODUCT.md).

**Capturas (evidencia):**
- c-light-en-390.png
- c-light-en-768.png
- c-light-en-1440.png
- c-dark-en-390.png
- c-dark-en-768.png
- c-dark-en-1440.png
- c-light-es-390.png
- c-light-es-1440.png

**Qué comunica la jerarquía.** A 1440 es una composición de dos columnas: headline, estado y CTA en las columnas 1 a 8, y un índice numerado (`01 Work`, `02 About`, `03 Contact`) en las columnas 10 a 12, detrás de una regla vertical de 1 px y alineado con la parte de arriba del headline. Dice "esto es un documento con secciones" antes de que bajes. Por debajo de 1024 px el índice pasa después del CTA, separado por una regla horizontal, y se lee como un menú al pie del hero.

**Líneas del headline a 390 px:** EN 10, ES 13. **Las dos pasan de 7.** (768 px: EN 5, ES 6. 1440 px: EN 8, ES 10.)

**Puntuación (heurísticas aplicables).** 1 Estado del sistema 3 · 2 Lenguaje del usuario 3 · 4 Consistencia 3 (el índice parece navegación y no lo es) · 6 Reconocer antes que recordar 4 (las secciones del sitio se ven desde el primer pantallazo) · 8 Estética y minimalismo 3. 3, 5, 7, 9 y 10 son n/a. **Total 16/20 (80 %, Bien).**

### Críticos

Ninguno. axe sin violaciones a 390, 768 y 1440.

### Importantes

**[P1] El índice tiene forma de navegación pero no lleva a ningún sitio.**
- Los tres elementos son texto plano (el componente lo dice: las secciones llegan en la fase 4). Número en mono, etiqueta en 16 px, lista vertical: es exactamente la forma de un menú, y quien hace clic en "Work" no obtiene nada.
- Por qué importa: en el lab da igual; en el sitio, si C pasa tal cual, es una promesa rota en el primer pantallazo. Además, cuando exista la navegación del encabezado habrá dos listas de las mismas secciones en la primera pantalla.
- Comando sugerido: `/impeccable clarify` (decidir si el índice serán enlaces a anclas o la navegación misma).

**[P1] El mismo desbordamiento que en A, y en móvil el índice queda entero fuera.**
- Medido: a 390×844 en español el CTA termina en y=886 y el índice empieza en y=934; en inglés el índice ocupa y=760 a 892, cortado por el pliegue. A 1440 en español la línea de estado empieza en y=888 y el CTA termina en y=1027 (el índice sí se ve, arriba a la derecha).
- `oversized-h1` a 1440 como en A y B.
- Comando sugerido: `/impeccable typeset` o `/impeccable clarify`.

**[P1] La misma huérfana que en A.** "it." sola en la línea 8 a 1440 (c-light-en-1440.png, c-dark-en-1440.png). Comando sugerido: `/impeccable typeset`.

### Menores

**[P2] El headline empieza en la columna 1, no en la 2 o 3.** DESIGN.md §4 pide que el texto principal se desplace y deje una columna libre para números y notas. C pone esa columna a la derecha (el índice) y el texto toca el margen izquierdo (x=169 a 1440, frente a x=263 en A y B). Es una lectura distinta del mismo principio; si eliges C, DESIGN.md §4 debería decirlo.

**[P2] Más elementos en la primera pantalla.** Headline, cinco segmentos de estado, CTA y tres entradas de índice. Siguen siendo cuatro destinos posibles (CTA más tres secciones), dentro del límite, pero es la variante con más que leer antes de decidir.

**[P3] La regla del índice a 768 recorre todo el ancho** (c-dark-en-768.png) mientras la lista ocupa una columna estrecha a la izquierda; en móvil (c-light-en-390.png, c-light-es-390.png) la proporción es buena.

**Detector:** `cream-palette` (decisión de DESIGN.md §3) y `oversized-h1` a 1440. Nada más.

### Lo que funciona

- A 1440 es la única variante que usa todo el ancho: el índice equilibra el bloque del headline sin decorar (c-light-en-1440.png, c-light-es-1440.png).
- Los números en mono `01 02 03` preparan la navegación numerada de DESIGN.md §1 y ya usan `01 Work` sin raya (coherente con P5).
- Las etiquetas en español caben sin partirse ("Sobre mí" incluido).

## Preguntas abiertas

Cada pregunta muestra su valor actual. Ese valor no es una elección: queda pendiente de ti, nada cambia por él y, si no respondes, vuelve a ti en G7 (01-12). Las opciones van en orden fijo, sin preferencia.

**P1. Acento en tema claro.**
- Valor actual: `--accent: oklch(0.66 0.17 40)`, 3.19:1 sobre `--bg`. El acento va solo en el punto de estado y en el anillo de foco (elementos no textuales, pasan 3:1); el texto de la línea de estado va en tinta.
- Opción "mantener": se queda así. Consecuencia: en claro el acento nunca puede ser texto pequeño (por ejemplo el enlace activo o el número de sección actual de DESIGN.md §3).
- Opción "oscurecer": el acento claro pasa a `oklch(0.56 0.17 40)` (#c2460d), 4.81:1 sobre `--bg`, y la disponibilidad puede escribirse en acento. Cambia la paleta de DESIGN.md §3 (el oscuro no cambia).

**P2. Copy propuesto por mí (todo es borrador hasta que lo apruebes).**
- Línea de estado en español: `Disponible ahora`, `Disponible desde {fecha}`, `Sin cupo para proyectos nuevos`, `horario compatible con Toronto y Madrid`.
- Estados `open` y `closed` en inglés: `Available now`, `Not taking new projects`.
- Índice de C en español: `01 Trabajo`, `02 Sobre mí`, `03 Contacto`.
- CTA. Valor actual: `Let’s talk` / `Hablemos` (docs/copy.md). Otra opción: `Start a project` / `Empecemos tu proyecto` (cambia docs/copy.md).
- Headline (lo escribí yo a tu pedido en G2; mide 10 y 13 líneas a 390 px, ver las variantes). Valor actual: `I build web apps with React and Next.js for companies and teams that need a solid frontend, from the first screen to the admin panel behind it.` / `Construyo aplicaciones web con React y Next.js para empresas y equipos que necesitan un frontend sólido, desde la primera pantalla hasta el panel que las administra.` Otra opción, más corta (sin la parte "para empresas y equipos"; medida en el build: 7 líneas a 390 y 5 a 1440 en los dos idiomas, CTA dentro de la primera pantalla): `I build solid frontends with React and Next.js, from the first screen to the admin panel behind it.` / `Construyo frontends sólidos con React y Next.js, de la primera pantalla al panel de gestión.`
- Lo que apruebes o reescribas pasa a 01-11. Lo que no respondas sigue marcado como borrador y vuelve a ti en G7 (01-12).

**P3. Fecha de la variante B (solo cuenta si eliges B).**
- Valor actual: `updatedAt` de `site_settings` (la fecha en que actualizaste el estado), estática, en formato `2026-10-30`.
- Otra opción: la que tú digas (por ejemplo, sin fecha, o un "hoy" vivo, que necesitaría el script inline de la fase 4).

**P4.** Respondida en G2 (01-04-ANSWERS.md: `Medellín, Colombia`).

**P5. La raya larga en el ejemplo de DESIGN.md §4.**
- Valor actual: el ejemplo dice `"01 — Work"` (U+2014), que choca con la regla de no usar em-dashes.
- Opciones: corregirlo a `01 Work` (como ya hace el índice de C), o dejarlo.

**Hallazgos que puedes pedir corregir ya en el componente elegido** (lista o "ninguno"; el resto queda para la fase 4):
- Auditoría de `/lab/tokens`: región con scroll de la tabla de contraste sin `tabindex` (axe serious a 390); foco del contenedor con el `outline` del navegador; botones `sm` de 32 px.
- Variantes: largo del headline y CTA fuera de la primera pantalla (va con P2); huérfana por encima de 6 líneas; línea de estado partida en 3 líneas a 390; en B, fecha que envejece (va con P3); en C, índice sin enlaces y headline en la columna 1.
