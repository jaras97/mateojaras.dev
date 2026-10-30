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
