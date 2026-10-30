---
phase: "01"
slug: "identidad-y-contenido"
status: draft
shadcn_initialized: true
preset: "b2fA (base-nova, Base UI). Sus valores neutral/geist/radius se sustituyen por D-16 y D-18"
created: "2026-10-30"
---

# Phase 01 — UI Design Contract

> Contrato visual y de interacción de la fase 1. Lo generó gsd-ui-researcher y lo verifica gsd-ui-checker.
> Fuente de verdad visual: `DESIGN.md` (sin editar; está en PROPUESTA). Este contrato solo concreta lo que DESIGN.md deja abierto para las superficies de esta fase y anota los ajustes que D-16 y D-17 ya aprobaron.

## Alcance de UI de esta fase

| Superficie | Ruta | Qué es |
|------------|------|--------|
| Índice del lab | `/lab` | Dos enlaces: `/lab/tokens` y `/lab/hero`. Nada más |
| Muestra de tokens | `/lab/tokens` | Tokens OKLCH (claro y oscuro), escala tipográfica, espacio, radios, Button con el tema y la línea de estado en sus 3 estados |
| Variantes del hero | `/lab/hero?variant=a\|b\|c&lang=en\|es&theme=light\|dark&capture=1` | Las 3 variantes (D-01) como componentes presentacionales, alimentadas por un fixture tipado contra `site_settings` |

- **Rutas:** `/lab`, `/lab/hero` y `/lab/tokens` están aprobadas por Teo (D-02). No se añade ninguna otra ruta. `src/app/page.tsx` no se toca.
- `/lab` vive fuera del futuro `[locale]`, no se enlaza desde ningún sitio, lleva `robots: { index: false, follow: false }` en su layout y llama a `notFound()` cuando `process.env.VERCEL_ENV === 'production'`. Se borra cuando Teo elige la variante.
- Las variantes son **estáticas** (D-04): sin GSAP, sin SplitText, sin `<Reveal>`, sin Motion. Solo transiciones CSS de color en hover (160ms, `motion-safe:`).
- La cabecera del sitio (nombre, navegación, ThemeToggle, LangSwitch) es de la fase 4 y **no** forma parte de las variantes. Las capturas muestran el hero solo.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn (CLI 4.23.0, `components.json` presente) |
| Preset | `b2fA`, style `base-nova`. Los valores del preset (baseColor neutral, font geist, radius default) quedan sustituidos por los tokens de DESIGN.md (D-18) |
| Component library | base-ui (`@base-ui/react@1.9.0`). `cn` viene del paquete `cn`, no de clsx + tailwind-merge |
| Icon library | lucide-react 1.63.0 (instalado). Ninguna superficie de la fase 1 usa iconos |
| Font | Display: Funnel Display · Texto/UI: Hanken Grotesk · Mono: Geist Mono. Las tres con `next/font/google`, subsets `latin` + `latin-ext`, variables, `display: 'swap'` (D-16). Se elimina `Geist` sans del layout |

### Carga de fuentes (contrato para `src/app/layout.tsx`)

| Familia | Import | Variable CSS | Token Tailwind |
|---------|--------|--------------|----------------|
| Funnel Display | `Funnel_Display` | `--font-funnel-display` | `--font-heading` (utilidad `font-heading`) |
| Hanken Grotesk | `Hanken_Grotesk` | `--font-hanken-grotesk` | `--font-sans` (utilidad `font-sans`, por defecto en `html`) |
| Geist Mono | `Geist_Mono` | `--font-geist-mono` | `--font-mono` (utilidad `font-mono`) |

- En `@theme inline`: `--font-sans: var(--font-hanken-grotesk)`, `--font-heading: var(--font-funnel-display)`, `--font-mono: var(--font-geist-mono)`. Se corrige la autorreferencia actual `--font-sans: var(--font-sans)`.
- Ninguna petición a `fonts.googleapis.com` ni `fonts.gstatic.com` en runtime: todo sale de `/_next/static/media`. Se comprueba en la pestaña Network de `/lab/tokens`.
- `metadata` del root layout: `title: "Mateo Jaramillo"`, sin `description` (el SEO es de la fase 4). `lang="en"` se mantiene; el layout definitivo `[locale]` es de la fase 2.
- Prohibidas: Inter, Roboto, Arial, Open Sans, Lato, Space Grotesk, Satoshi y cualquier stack de system fonts como fuente visible.

---

## Component Inventory

Enumerated by `ls src/components/ui/*.tsx | wc -l` — 1 components — shadcn@4.23.0 — 2026-10-30.
Mismatch: `pnpm exec shadcn info` reported no installed components (its output has no components section), filesystem has 1.

Primitivas disponibles para `shadcn add`: `node -p "Object.keys(require('@base-ui/react/package.json').exports||{}).length"` devuelve 80 entradas de exports en `@base-ui/react@1.9.0` (2026-10-30). Esta tabla es una lista **no exhaustiva** de componentes conocidos, no una allowlist cerrada.

| Component | Import path | Notes |
|-----------|-------------|-------|
| Button | `@/components/ui/button` | Instalado. Se re-tematiza en esta fase (ver "Button: tema"). Variantes en la fase 1: `default`, `outline`, `secondary`, `ghost`, `link`. `destructive` no se muestra (no hay token destructivo, ver Color) |
| Input, Textarea, Select, Dialog, Sheet, Tabs, Table, Badge, Toast, Form, Tooltip | `@/components/ui/<name>` tras `pnpm dlx shadcn@4.23.0 add <name>` | Permitidos por DESIGN.md §6, **no instalados y no necesarios en la fase 1**. Si `shadcn add` añade dependencias, se pregunta a Teo antes (CLAUDE.md) |

### Componentes propios de la fase 1

| Componente | Ruta | Notes |
|------------|------|-------|
| `StatusLine` | `src/components/site/status-line.tsx` | Línea de estado en mono. Server Component puro. Lo consumen las 3 variantes y `/lab/tokens` |
| `SectionNumber` | `src/components/site/section-number.tsx` | Número de sección `01` en mono + etiqueta. Lo usan la variante C y los encabezados de `/lab/tokens` |
| `HeroA`, `HeroB`, `HeroC` | `src/components/site/hero/hero-a.tsx` … `hero-c.tsx` | Presentacionales puros, sin estado, sin `'use client'`. Props: `{ settings: HeroSettings; locale: 'en' \| 'es'; cta: { label: string; href: string } }` |
| `HeroSettings` (tipo) | `src/features/site-settings/types.ts` | `Pick<SiteSettings, 'headlineEn' \| 'headlineEs' \| 'availabilityStatus' \| 'availableFrom' \| 'timezone' \| 'location' \| 'updatedAt'>`. `SiteSettings` se escribe a mano con los nombres camelCase de `docs/data-model.md`; la fase 2 lo sustituye por `typeof siteSettings.$inferSelect` |
| Fixture | `src/features/site-settings/fixture.ts` | `export const heroFixture = { … } satisfies HeroSettings` más `heroFixtureMeta = { headlineSource: 'docs/copy.md (ejemplo, borrador)' }` mientras Teo no escriba el headline (D-03). Sin campos inventados |
| Piezas del lab | `src/app/lab/_components/*` | Barra del lab, muestras de color, filas tipográficas. Se borran con `/lab` |

---

## Spacing Scale

DESIGN.md §4: múltiplos de 8, más 4 para huecos mínimos. Tailwind v4 conserva `--spacing: 0.25rem`, así que cada token corresponde a una utilidad fija. **Solo se usan estas utilidades** (`1, 2, 4, 6, 8, 12, 16, 24, 32`); `3`, `5`, `7`, `10`, `14`, `20` y valores arbitrarios (`p-[13px]`) quedan prohibidos en el espaciado.

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| xs | 4px | `1` | `gap-y` entre líneas de la StatusLine cuando envuelve; separación punto-texto |
| sm | 8px | `2` | `gap-x` entre segmentos de la StatusLine; gap interno de Button |
| md | 16px | `4` | Padding horizontal de Button; separación StatusLine → regla en la variante B; entre ítems del índice C |
| lg | 24px | `6` | Gutter del grid; margen lateral móvil (<768px); `pl` del índice C tras su regla vertical; padding superior de cada sección de `/lab/tokens` |
| xl | 32px | `8` | Headline → StatusLine (variantes A y C) |
| 2xl | 48px | `12` | Margen lateral ≥768px; StatusLine → CTA (A, C); regla → headline y headline → CTA (B); separación entre secciones de `/lab/tokens` |
| 3xl | 64px | `16` | Padding superior e inferior del hero en <1024px |
| 4xl | 96px | `24` | Padding inferior del hero en ≥1024px |
| 5xl | 128px | `32` | Padding superior del hero en ≥1024px |

Layout (DESIGN.md §4): grid de 12 columnas a partir de 1024px (`lg`), gutter 24px, ancho máximo 1200px centrado, márgenes laterales 24px (<768px) y 48px (≥768px). Por debajo de 1024px todo es una columna.

Exceptions:
- Alto del CTA del hero: 44px (`h-11`), objetivo táctil en todas las anchuras.
- Alturas de Button en el lab: 32px (`sm`), 40px (`default`), 44px (`lg`). Todas múltiplos de 4.
- Reglas y bordes: 1px.
- Punto de estado: 8px (`size-2`).

---

## Typography

DESIGN.md §2 define una escala de 8 pasos. Las superficies de la fase 1 (hero y la interfaz del lab) usan **solo 4 tamaños y 2 pesos**:

| Role | Size | Weight | Line Height | Familia y uso |
|------|------|--------|-------------|---------------|
| Body | 16px (`--text-base` 1rem) | 400 | 1.55 | Hanken Grotesk. Etiquetas del índice C, notas del lab, textos de ayuda. Párrafos a 68ch como máximo |
| Label | 14px (`--text-sm` 0.875rem) | 400 (mono) / 600 (Button) | 1.55 | Geist Mono 400: StatusLine, fechas, números de sección, nombres y valores de tokens, barra del lab. Hanken Grotesk 600: etiqueta de Button y del CTA |
| Heading | 25px (`--text-xl` 1.563rem) | 600 | 1.1 | Funnel Display. Encabezados de sección de `/lab/tokens` (h2) |
| Display | `clamp(2.8rem, 6vw, 4.5rem)` = 44.8px a 72px (`--text-4xl`) | 600 | 1.1 | Funnel Display, `letter-spacing: -0.02em`, `text-wrap: balance`. Headline del hero (h1) y h1 de las páginas del lab |

- Pesos declarados: **400 y 600**. El `font-medium` (500) del Button de shadcn pasa a `font-semibold` (600). Funnel Display 500 y 700 solo aparecen como muestra en `/lab/tokens`.
- Line-height: 1.1 para todo lo que va en Funnel Display, 1.55 para Hanken Grotesk y Geist Mono (DESIGN.md §2).
- El headline no se trunca nunca ni baja de 44.8px. Sin guionado automático (`hyphens: manual`).
- Exception (solo como contenido de muestra): `/lab/tokens` renderiza los 8 pasos de DESIGN.md (`--text-xs` a `--text-4xl`) y los pesos 500/600/700 de Funnel Display y 400/500/600 de Hanken Grotesk como filas de muestra. Esas filas son el objeto que se inspecciona, no interfaz. Cada fila lleva el nombre del token y su valor en Label mono.
- Texto de muestra de las filas: el headline del fixture (texto real) y la cadena de verificación de glifos `Aa Bb Cc 0123456789 á é í ó ú ü ñ Ñ ¿ ¡`. Nada de lorem ipsum.

---

## Color

Tokens de DESIGN.md §3 (D-18). Contraste medido el 2026-10-30 con conversión OKLCH → sRGB y fórmula WCAG 2.x (script en el scratchpad de la sesión).

| Role | Value (claro / oscuro) | Usage |
|------|------------------------|-------|
| Dominant (60%) | `--bg` `oklch(0.985 0.006 80)` #fcfaf6 / `oklch(0.17 0.01 260)` #0d1014 | Fondo de página, fondo del hero, fondo del lab |
| Secondary (30%) | `--bg-elev` `oklch(0.965 0.008 80)` #f6f3ee / `oklch(0.21 0.012 260)` #15181e · `--ink-2` · `--line` | `--bg-elev`: superficies de muestra en `/lab/tokens`, hover de Button `outline`/`ghost`. `--ink-2`: segmentos secundarios de la StatusLine, números de sección, metadatos. `--line`: reglas de 1px, regla vertical del índice C, bordes |
| Text | `--ink` `oklch(0.24 0.03 260)` #171f2e / `oklch(0.94 0.01 80)` #efebe4 | Headline, segmento de disponibilidad, etiquetas del índice, relleno del Button `default` |
| Accent (10%) | `--accent` `oklch(0.66 0.17 40)` #e56636 / `oklch(0.72 0.16 40)` #f67d51 | Ver "Accent reserved for" |
| Destructive | No definido | No hay acciones destructivas en la fase 1 y DESIGN.md no define un token destructivo. No se inventa: el color destructivo del admin se pregunta a Teo en la fase 3 |

Accent reserved for:
1. El **punto de estado estático** de la StatusLine (8px) cuando `availabilityStatus` es `open` o `from_date`. Con `closed` el punto usa `--ink-2`.
2. El anillo de foco visible (`--ring: var(--accent)`), que solo aparece con navegación por teclado.

Nada más lleva acento en la fase 1: ni el CTA, ni los enlaces, ni la barra del lab, ni los números de sección del índice C (en la home no hay "sección actual"). Máximo un elemento con acento por vista, sin contar el anillo de foco.

### Contraste medido

| Par | Claro | Oscuro | Veredicto |
|-----|-------|--------|-----------|
| `--ink` sobre `--bg` | 15.76 | 16.03 | AA texto |
| `--ink-2` sobre `--bg` | 6.26 | 7.16 | AA texto |
| `--ink-2` sobre `--bg-elev` | 5.90 | 6.63 | AA texto |
| `--accent` sobre `--bg` | **3.19** | 7.26 | Claro: pasa 3:1 (no texto, texto ≥24px) y **falla 4.5:1 para texto normal** |
| `--accent` sobre `--bg-elev` | **3.01** | 6.72 | Claro: en el límite de 3:1 |
| `--accent-ink` sobre `--accent` | **3.24** | 7.48 | Claro: falla para texto de 14–16px |
| `--line` sobre `--bg` | 1.38 | 1.40 | Solo decorativo; nunca es el único indicador de un control |

**Regla derivada (vale para los dos temas, para no tener dos reglas):** el acento nunca colorea texto por debajo de 24px y nunca se usa como fondo de un texto. Por eso la StatusLine lleva el texto en `--ink`/`--ink-2` y el acento solo en el punto, y `--accent-ink` queda definido pero sin uso en la fase 1. Esto difiere de la lectura literal de DESIGN.md §3 ("el acento aparece en la línea de estado"); ver "Preguntas abiertas para Teo", P1.

### Mapeo de variables shadcn (D-18)

Se borra el tema gris por defecto (`:root` y `.dark` actuales), y con él las variables `--chart-*` y `--sidebar-*`, que no usa nada en esta fase. Los tokens de DESIGN.md se declaran en `:root` (claro) y `.dark` (oscuro, D-17). Las variables de shadcn son alias:

| Variable shadcn | Alias | Nota |
|-----------------|-------|------|
| `--background` | `var(--bg)` | |
| `--foreground` | `var(--ink)` | |
| `--card`, `--popover` | `var(--bg)` | Sin sombras; separación por borde `--line` |
| `--card-foreground`, `--popover-foreground` | `var(--ink)` | |
| `--primary` / `--primary-foreground` | `var(--ink)` / `var(--bg)` | Button `default` y CTA: relleno de tinta |
| `--secondary` / `--secondary-foreground` | `var(--bg-elev)` / `var(--ink)` | |
| `--muted` / `--muted-foreground` | `var(--bg-elev)` / `var(--ink-2)` | |
| `--border`, `--input` | `var(--line)` | |
| `--ring` | `var(--accent)` | |

**Choque de nombres `--accent`:** en shadcn `--accent` es la superficie neutra de hover de menús; en DESIGN.md es la terracota. Manda DESIGN.md: la variable CSS `--accent` es la terracota y no se redeclara. En `@theme inline`:
- `--color-accent: var(--bg-elev)` y `--color-accent-foreground: var(--ink)`, para que los componentes shadcn que usan `bg-accent` (menús, en fases futuras) sigan neutros.
- `--color-signal: var(--accent)` expone la terracota como utilidad (`bg-signal`, `text-signal`, `ring-signal`). Es la **única** vía para pintar el acento en componentes.
- Se registra en `docs/decisions.md` como decisión de Claude (nombres internos).

Además: `color-scheme: light` en `:root` y `color-scheme: dark` en `.dark` (scrollbars y controles nativos). Sin gradientes, sin sombras (ninguna utilidad `shadow-*`), sin transparencias tipo glass.

### Radios (DESIGN.md §4)

`--radius: 0.25rem` (4px). En `@theme inline`: `--radius-sm`, `--radius-md` y `--radius-lg` = `var(--radius)` (controles, 4px); `--radius-xl: 0.5rem` (8px, solo imágenes); se eliminan `--radius-2xl` a `--radius-4xl`. Contenedores, secciones y muestras de color: radio 0. El punto de estado es un círculo (`rounded-full`), es una marca y no un contenedor.

### Button: tema

| Size | Alto | Padding x | Gap | Texto |
|------|------|-----------|-----|-------|
| `sm` | 32px (`h-8`) | 16px (`px-4`) | 8px | 14px / 600 |
| `default` | 40px (`h-10`) | 16px (`px-4`) | 8px | 14px / 600 |
| `lg` | 44px (`h-11`) | 24px (`px-6`) | 8px | 14px / 600 |
| `icon`, `icon-sm`, `icon-lg` | 40 / 32 / 44px | — | — | — |

- Se eliminan `xs` e `icon-xs` (su texto de 12px no está en el contrato). Los `rounded-[min(var(--radius-md),…)]` pasan a `rounded-[var(--radius)]`.
- Foco: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`, anillo **sólido**. El `ring-ring/50` de shadcn se quita: al 50% el acento claro baja de 3:1.
- Hover: solo color, `transition-colors duration-[160ms]` bajo `motion-safe:`. `default` pasa a `hover:bg-primary/90`; `outline` y `ghost` a `hover:bg-muted`. `active:translate-y-px` solo bajo `motion-safe:`.
- Nada de escalas, brillos ni sombras.

---

## Las 3 variantes del hero (D-01)

Datos comunes: `h1` con `localized(settings, 'headline', locale)` (helper local de la fase 1 si `src/lib` aún no lo tiene; la fase 2 lo formaliza), StatusLine y CTA. Cada variante es un `<section aria-labelledby="hero-title">`; el orden del DOM es el orden visual.

### A: headline arriba, estado debajo
- **Foco visual:** el headline.
- ≥1024px: headline en las columnas 2–9; StatusLine a 32px debajo, en las mismas columnas; CTA a 48px debajo de la StatusLine. Padding 128px arriba y 96px abajo.
- <1024px: una columna, padding 64px arriba y abajo, mismos espaciados verticales.

### B: la bitácora abre con la entrada de estado
- **Foco visual:** el headline por tamaño; el orden de lectura empieza en la StatusLine.
- La StatusLine es la primera línea y lleva delante la fecha de la entrada: `<time dateTime="YYYY-MM-DD">` con `updatedAt` del fixture, en ISO y en los dos idiomas. No es un reloj en vivo (ver P3).
- 16px debajo, una regla de 1px `--line` del ancho de las columnas 2–9 (ancho completo en móvil). 48px debajo, el headline. 48px debajo, el CTA.
- Mismos paddings que A.

### C: índice editorial
- **Foco visual:** el headline; el índice es secundario.
- ≥1024px: headline, StatusLine (32px debajo) y CTA (48px debajo) en las columnas 1–8. Índice en las columnas 10–12, alineado arriba con el headline, con regla vertical de 1px `--line` a la izquierda y 24px de padding izquierdo.
- Índice: `<ol>` de 3 ítems, 16px entre ítems. Cada ítem: número en Label mono `--ink-2` (`01`) y etiqueta en Body `--ink`, con 16px entre ambos. En la fase 1 son **texto, no enlaces**: las secciones y rutas llegan en la fase 4.
- <1024px: el índice va después del CTA, a 48px, con regla superior de 1px `--line` y 24px de padding superior; ítems en vertical.

### StatusLine (compartida)
- `<p>` en Geist Mono 14px/400, flex con wrap, 8px entre segmentos y 4px entre líneas.
- Orden de segmentos: `[solo B: fecha]` · `[punto + disponibilidad]` · `[location]` · `[UTC offset]` · `[overlap]`.
- La disponibilidad va en `--ink`; los demás segmentos, la fecha y los separadores `·` en `--ink-2`. Los separadores y el punto son `aria-hidden`.
- Un segmento nunca se parte por dentro (`whitespace-nowrap`) y una línea nunca empieza con un separador. Nunca hay scroll horizontal a 390px.
- `location` se pinta tal cual viene del campo (no se recorta ni se divide). El offset sale de `timezone` con `Intl.DateTimeFormat(…, { timeZoneName: 'shortOffset' })`, normalizado a `UTC-5`.
- `availableFrom` se formatea con `Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' })` (en: `Nov 2026`, es: `nov 2026`).
- Punto: 8px, `bg-signal`, estático, centrado sobre la altura x de la primera línea. Sin pulso ni animación.

### CTA
- Button `default` tamaño `lg` (44px), relleno `--ink`, renderizado como enlace (`<a>` con el patrón `render` de Base UI y `nativeButton={false}`).
- `href` final: `/contact` (en) y `/es/contacto` (es). En la fase 1 esas rutas no existen y el clic da 404: es conocido y aceptado, las rutas son de la fase 4.

---

## Barra del lab y estados del lab

- `/lab/hero` lee `searchParams` (async, dentro de `<Suspense>` por `cacheComponents`). Valores por defecto: `variant=a`, `lang=en`, `theme=light`.
- Barra superior: borde inferior 1px `--line`, padding vertical 16px, márgenes laterales del layout, Label mono. Tres grupos de enlaces (sin JavaScript de cliente): `Variante` A · B · C, `Tema` Claro · Oscuro, `Idioma` EN · ES. La opción activa lleva `aria-current="true"`, color `--ink` y subrayado con offset de 4px; las inactivas, `--ink-2`. Sin acento.
- Mientras `heroFixtureMeta.headlineSource` diga borrador, la barra muestra la nota `Headline: borrador de docs/copy.md`.
- `capture=1` oculta la barra para las capturas de Playwright.
- Tema: el contenedor del lab lleva la clase `dark` (D-17; `@custom-variant dark` funciona con cualquier ancestro), `min-h-dvh` y `bg-background`. El contenedor del hero lleva `lang={lang}`; el de la interfaz del lab, `lang="es"`.
- Los textos del lab van en español y en el propio código del lab: `messages/` no existe hasta la fase 2 y el lab se borra. Los textos de la variante elegida (estado, índice, CTA) pasan a `messages/en.json` y `messages/es.json` en la fase 2.

### Contenido de `/lab/tokens`
h1 `Tokens` en Display. Cinco secciones, cada una con regla superior de 1px, 24px de padding superior, 48px de separación, `SectionNumber` en mono y h2 en Heading:
1. `01 Color`: los 7 tokens en dos columnas, `Claro` y `Oscuro`, siempre visibles a la vez (la columna oscura va envuelta en `.dark`). Cada muestra: bloque de 64px de alto, radio 0, borde 1px `--line`, nombre del token y valor OKLCH en Label mono. Debajo, la tabla "Contraste medido" de este contrato.
2. `02 Tipografía`: las 3 familias en sus pesos de muestra y los 8 pasos de la escala (ver la excepción en Typography).
3. `03 Espacio y radios`: barras de 4 a 128px con su token; muestras de radio 4px (control), 8px (imagen) y 0 (contenedor).
4. `04 Componentes`: Button en `default`, `outline`, `secondary`, `ghost` y `link`, en los tamaños `sm`, `default` y `lg`, más un ejemplo `disabled`. Etiquetas: el nombre de la variante. El foco se revisa con Tab.
5. `05 Línea de estado`: StatusLine con el fixture en `open`, `from_date` y `closed`, en en y es, con y sin fecha.

---

## Copywriting Contract

Reglas: sin em-dashes, sin emojis, sin superlativos, sin frases de tres palabras. Lo que no viene de `docs/copy.md` o de CONTEXT.md es **propuesta de Claude pendiente de aprobación de Teo** (D-07) y se revisa en el lab.

| Element | Copy |
|---------|------|
| Primary CTA | EN `Let’s talk` · ES `Hablemos` (docs/copy.md; se pinta con apóstrofo tipográfico U+2019) |
| Headline | `headlineEn` / `headlineEs` del fixture. Hasta que Teo escriba los suyos: los ejemplos de `docs/copy.md`, marcados como borrador (D-03) |
| Estado `from_date` | EN `Available from {Nov 2026}` (docs/copy.md) · ES `Disponible desde {nov 2026}` (propuesta) |
| Estado `open` | EN `Available now` · ES `Disponible ahora` (propuesta) |
| Estado `closed` | EN `Not taking new projects` · ES `Sin cupo para proyectos nuevos` (propuesta) |
| Segmento de solapamiento | EN `overlaps with Toronto and Madrid` (docs/copy.md) · ES `horario compatible con Toronto y Madrid` (propuesta) |
| Índice de la variante C | EN `01 Work` `02 About` `03 Contact` (boceto de Teo, D-01) · ES `01 Trabajo` `02 Sobre mí` `03 Contacto` (propuesta) |
| Empty state heading | Sitio: no hay. Si falta el headline, el hero no se renderiza (regla de CLAUDE.md). Lab: `Falta el headline en el fixture` |
| Empty state body | Lab: `Escribe headlineEn y headlineEs en src/features/site-settings/fixture.ts. Mientras falten, el hero no se muestra.` |
| Error state | Lab, `variant` desconocida: `La variante «{valor}» no existe. Elige A, B o C.` con los tres enlaces. `lang` o `theme` desconocidos vuelven al valor por defecto sin mensaje |
| Destructive confirmation | No hay acciones destructivas en la fase 1 |

---

## UI Considerations

Applicable state considerations resolved: 9 covered, 3 backstop, 1 unresolved.

| Category | Element(s) | Status | Resolution / Reason |
|----------|------------|--------|---------------------|
| empty | Headline vacío en el fixture | ✅ covered | El hero devuelve `null` y el lab muestra la copia de "Empty state" del Copywriting Contract |
| partial | `availabilityStatus = from_date` con `availableFrom = null` | ✅ covered | El segmento de disponibilidad no se renderiza; el resto de la StatusLine sí |
| zero-one-many | Estados `open` / `from_date` / `closed` | ✅ covered | Los tres se renderizan en `/lab/tokens` sección 05 con la copia del contrato; con `closed` el punto usa `--ink-2` |
| populated | Variantes A, B y C con el fixture | ✅ covered | `/lab/hero?variant=a\|b\|c` renderiza cada variante con el fixture, que cumple `satisfies HeroSettings` |
| error | Parámetro `variant` inválido | ✅ covered | Mensaje del Copywriting Contract con enlaces a A, B y C |
| error | Fixture que no cumple el tipo | ✅ covered | `satisfies HeroSettings` hace fallar `pnpm check` (typecheck) |
| theme | Claro y oscuro | ✅ covered | `?theme=dark` aplica `.dark` al contenedor; `/lab/tokens` muestra ambas columnas de tokens a la vez |
| locale | en / es | ✅ covered | `?lang=es` usa `headlineEs`, el formato `es` de fechas y la copia ES; el contenedor lleva `lang` |
| loading | Carga de fuentes | ✅ covered | `next/font` con `display: 'swap'` y fallback ajustado por métricas (por defecto); ninguna petición a un CDN de fuentes |
| long-text | Headline ES a 390px | 🧪 backstop | Capturas a 390px en es (claro): el headline envuelve con `text-wrap: balance`, sin truncar ni encoger por debajo de 44.8px. Si pasa de 7 líneas se reporta a Teo como hallazgo |
| overflow | StatusLine a 390px (B, con fecha) | 🧪 backstop | Capturas a 390px: envuelve entre segmentos, ninguna línea empieza con `·`, sin scroll horizontal |
| focus | CTA y enlaces de la barra del lab | 🧪 backstop | Recorrido con Tab en claro y oscuro: anillo sólido de acento de 2px con offset de 2px, visible sobre `--bg` |
| contrast | Acento claro sobre `--bg` (3.19:1) | ⚠ unresolved | El contrato aplica la regla "acento solo en el punto y en el foco". Teo decide si la mantiene o ajusta el acento claro (P1). El planner lo trata como supuesto |

### Revisión antes de la elección (D-05)
- Capturas con Playwright, página completa: cada variante a 390×844, 768×1024 y 1440×900, en claro y oscuro, en en (18 capturas), más es en claro a 390 y 1440 (6 capturas). URL con `capture=1`.
- `/impeccable:critique` por variante y `/impeccable:audit` sobre `/lab/tokens`. Los hallazgos se reportan a Teo junto con las capturas, antes de que elija.
- Axe sobre `/lab/hero` (las 3 variantes) y `/lab/tokens`: ninguna incidencia `serious` ni `critical`.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | `button` (ya instalado) | not required |

No hay registros de terceros: `components.json` tiene `"registries": {}`. Aceternity UI, Magic UI, React Bits, Cult UI y cualquier registro de "efectos" están prohibidos (CLAUDE.md, DESIGN.md §6).

---

## Preguntas abiertas para Teo

El contrato tiene un valor por defecto para cada una, así que no bloquean el plan. Se resuelven en la revisión del lab y se registran en `docs/decisions.md`.

- **P1. Contraste del acento en claro.** `--accent` claro sobre `--bg` da 3.19:1: vale para el punto y para el foco, pero no para texto de 14px. Por defecto, el acento va solo en el punto y el texto de la StatusLine va en tinta. Alternativa: oscurecer el acento claro a `oklch(0.56 0.17 40)` (#c2460d, 4.81:1 sobre `--bg`, dentro de gamut) para poder escribir la disponibilidad en acento. Eso cambia la paleta, así que lo decide Teo.
- **P2. Copia propuesta.** Los estados `open` y `closed`, todas las cadenas ES de la StatusLine y las etiquetas ES del índice C son propuestas (ver Copywriting Contract).
- **P3. Fecha de la variante B.** Por defecto es `updatedAt` de `site_settings` (la fecha en que Teo actualizó su estado), estática y compatible con el shell prerenderizado. Un reloj "hoy" en vivo necesitaría el script inline de la fase 4.
- **P4. `location`.** El campo por defecto es `Medellín, Colombia`, y la StatusLine quedaría `Medellín, Colombia · UTC-5`. `docs/copy.md` muestra `Medellín, UTC-5`. Teo elige el valor del fixture; el componente no recorta el campo.
- **P5. Em-dash en DESIGN.md §4.** El ejemplo `"01 — Work"` choca con la regla de no usar em-dashes en el copy. El contrato usa `01 Work`. Conviene corregirlo cuando DESIGN.md se ajuste por D-16 y D-17.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS
- [ ] Dimension 7 Inventory Provenance: PASS

**Approval:** pending
