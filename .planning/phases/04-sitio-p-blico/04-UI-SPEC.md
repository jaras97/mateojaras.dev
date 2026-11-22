---
phase: "04"
slug: "sitio-p-blico"
status: draft
shadcn_initialized: true
preset: "base-nova (components.json, baseColor neutral sustituido por los tokens de DESIGN.md en src/app/globals.css)"
created: "2026-11-22"
---

# Phase 04 — UI Design Contract: Sitio público

> Contrato visual y de interacción del sitio público en/es (home, caso de estudio, about, contacto, header, footer, OG). Lo generó gsd-ui-researcher y lo verifica gsd-ui-checker.
>
> Orden de autoridad: `DESIGN.md` (aprobado, no se edita) > `04-CONTEXT.md` D-01..D-16 (bloqueadas) > `docs/copy.md` > este archivo. Lo que este archivo decide dentro de "Claude's Discretion" va marcado **[Claude]**; las cadenas de interfaz nuevas van marcadas **[propuesta]** hasta que Teo las apruebe. Las preguntas abiertas están al final; cada una tiene un valor por defecto, así que ninguna bloquea el plan.

## Alcance de UI de esta fase

| Superficie | Ruta en / es | Requisitos |
|------------|--------------|------------|
| Header y footer (layout `[locale]`) | todas | SITE-05, SITE-06, SITE-07 |
| Home | `/` · `/es` | SITE-01, SITE-02, SITE-03, CONT-05 |
| Caso de estudio | `/projects/[slug]` · `/es/proyectos/[slug]` | CASE-01..07, MOTN-03 |
| About + Now | `/about` · `/es/sobre-mi` | SITE-04 |
| Contacto | `/contact` · `/es/contacto` | CONT-01..05 |
| Imagen OG, sitemap, robots, metadatos | por página y por caso | SEO-01..03 |
| Movimiento | todas | MOTN-01..04 |

Fuera de alcance: 404 (SITE-08, fase 5), página `/projects` de índice, ruta `/now`, lightbox, menú hamburguesa, cualquier ruta no listada en D-05.

---

## Design System

| Property | Value | Source |
|----------|-------|--------|
| Tool | shadcn CLI 4.23.0 | `components.json` |
| Preset | `base-nova`, re-tematizado en `src/app/globals.css` (los alias de shadcn apuntan a los tokens de DESIGN.md) | `components.json`, 01-UI-SPEC |
| Component library | Base UI (`@base-ui/react` 1.9.0), no Radix | `.claude/CLAUDE.md` |
| Icon library | `lucide-react` 1.63.0. En el sitio público solo 4 iconos: `Sun`, `Moon` (ThemeToggle), `ArrowLeft` (volver), `ArrowUpRight` (enlace externo). 16px (`size-4`), `aria-hidden`, nunca dentro de tiles, siempre con texto o `aria-label` | DESIGN.md §6 |
| Font | Display: Funnel Display (`font-heading`) · Texto/UI: Hanken Grotesk (`font-sans`) · Mono: Geist Mono (`font-mono`). `next/font/google` en `src/app/fonts.ts`, latin + latin-ext, `display: 'swap'` | DESIGN.md §2 |
| Tema | Claro por defecto; oscuro por `prefers-color-scheme` o por el toggle; clase `.dark` en `<html>` antes del primer paint | DESIGN.md §3, `.claude/CLAUDE.md` §15 |
| `cn` | `cn` del paquete `cn` en `src/components/ui/*`; `@/lib/utils` en el resto | código existente |

---

## Component Inventory

Enumerated by `ls src/components/ui/*.tsx | wc -l` — 23 components — shadcn@4.23.0 — 2026-11-22.

Es una lista **no exhaustiva**: comprobar un componente que no aparece es el camino esperado. El sitio público usa estos, ya instalados y tematizados (no se instala nada nuevo de shadcn en la fase 4):

| Component | Import path | Uso en la fase 4 |
|-----------|-------------|------------------|
| button | `@/components/ui/button` | CTA del hero y de cierre (`default` `lg`, 44px), "Enviar" del formulario (`default` `lg`), "Copiar email" (`outline` `sm`), ThemeToggle (`ghost` `icon-sm`, 32px). Enlaces con `render={<a/>}` + `nativeButton={false}` como en `hero-parts.tsx` |
| input | `@/components/ui/input` | Nombre y email del formulario (40px) |
| textarea | `@/components/ui/textarea` | Mensaje (`field-sizing: content`, mínimo 160px de alto) |
| field | `@/components/ui/field` | Label + control + error con `aria-describedby` / `aria-invalid` |
| label | `@/components/ui/label` | Dentro de `field` (14px / 600) |
| skeleton | `@/components/ui/skeleton` | Solo si un fallback de `<Suspense>` necesita reservar alto; estático, sin pulso (`animate-none`) |

No se usan en el sitio público: `tooltip` (el feedback de copiar es un cambio de etiqueta visible, no un tooltip), `dialog`, `sheet`, `dropdown-menu`, `select`, `badge`, `sonner` (sin toasts, D-13), `card`, `carousel`. Nada de registros de terceros.

Primitivas de Base UI: 80 exports en `@base-ui/react@1.9.0` (`node -p "Object.keys(require('@base-ui/react/package.json').exports).length"`, 2026-11-22). El sitio público no importa ninguna directamente.

### Componentes propios

Existentes (se reutilizan sin cambiar su aspecto):

| Componente | Ruta | Nota |
|------------|------|------|
| `HeroA` + `hero-parts` | `src/components/site/hero/` | Variante A aprobada. El `h1#hero-title` pasa a ser el hijo de `<SplitHeading>` |
| `StatusLine` | `src/components/site/status-line.tsx` | Gana dos segmentos: hora local y solapamiento (ver "Home") |
| `SectionNumber` | `src/components/site/section-number.tsx` | Número en mono 14px `--ink-2` (móvil y encabezados de sección) |
| `DraftBanner`, `DraftExitForm` | `src/components/site/` | Banda de Draft Mode de la fase 3, sin cambios |
| `RichText` | `src/lib/rich-text.tsx` | Tiptap en servidor (CASE-04); los estilos de prosa los define este contrato |

Nuevos:

| Componente | Ruta | Tipo | Propósito |
|------------|------|------|-----------|
| `SiteHeader` | `src/components/site/site-header.tsx` | Server | Nombre, nav, LangSwitch, ThemeToggle |
| `SiteFooter` | `src/components/site/site-footer.tsx` | Server | Línea de footer de `docs/copy.md` + código fuente |
| `LangSwitch` | `src/components/site/lang-switch.tsx` | Client (lee `usePathname`/params) | EN/ES, misma página en el otro idioma |
| `ThemeToggle` | `src/components/site/theme-toggle.tsx` | Client | `document.startViewTransition` + localStorage |
| `ThemeScript` | `src/components/site/theme-script.tsx` | Server (script inline) | Clase `.dark`, hora local y solapamiento antes del primer paint |
| `LocalTime` | `src/components/site/local-time.tsx` | Client | Actualiza la hora y el solapamiento cada minuto |
| `PageSection` | `src/components/site/page-section.tsx` | Server | `<section>` numerada: regla 1px + número + h2 |
| `EntryList`, `Entry` | `src/components/site/entry-list.tsx` | Server | Lista de proyectos fechada (home) |
| `CaseStudy` y sus partes | `src/components/site/case-study/` | Server | Cabecera, métricas, portada, secciones 01–05, galería, anterior/siguiente |
| `Marginalia` | `src/components/site/marginalia.tsx` | Server | Notas al margen de 05 Decisiones técnicas |
| `ContactForm` | `src/features/contact/components/contact-form.tsx` | Client | RHF + Zod, honeypot, confirmación en sitio |
| `CopyEmail` | `src/components/site/copy-email.tsx` | Client | Botón de copiar con feedback en vivo |
| `Reveal` | `src/components/motion/reveal.tsx` | Server (CSS) | Reveal escalonado de carga (MOTN-01) |
| `SplitHeading` | `src/components/motion/split-heading.tsx` | Client (GSAP SplitText) | H1 del hero por palabras (MOTN-02) |
| `ScrollScene` | `src/components/motion/scroll-scene.tsx` | Client (GSAP ScrollTrigger) | Número de sección del caso (MOTN-03, D-02) |

---

## Layout

Grid de DESIGN.md §4, compartido por todas las páginas (una clase `pageGridClass` en un solo sitio, la misma que usa `heroSectionClass` hoy):

- Contenedor: `mx-auto max-w-page px-6 md:px-12` (1200px, márgenes 24px en <768px y 48px desde 768px).
- Desde 1024px (`lg`): 12 columnas, gutter 24px (`gap-x-6`). Por debajo de 1024px, una columna.
- Columnas editoriales desde `lg`:
  - **Margen izquierdo, cols 1–2:** números de sección, fechas de entradas, fecha de Now.
  - **Texto principal, cols 3–9** (7 columnas, unos 650px): párrafos (máximo 68ch), listas, galería, formulario.
  - **Margen derecho, cols 10–12:** `Marginalia` (caso) y "otras vías de contacto" (contacto).
- Breakpoints usados: `sm` 640px (solo el header), `md` 768px (márgenes laterales, fila de métricas, anterior/siguiente), `lg` 1024px (grid de 12).
- Radios: 4px controles, 8px imágenes (`rounded-xl` = 0.5rem en el tema), 0 contenedores. Bordes 1px. Sin `shadow-*`.
- Ninguna vista tiene scroll horizontal a 390px.

---

## Spacing Scale

Escala activa (DESIGN.md §4 más 4 para huecos mínimos): **4, 8, 16, 24, 32, 48, 64, 96**. Utilidades permitidas: `1, 2, 4, 6, 8, 12, 16, 24`. Prohibidos `3, 5, 7, 10, 14, 20, 32` y valores arbitrarios en espaciado. 128 no se usa.

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| xs | 4px | `1` | Hueco punto-texto de la StatusLine; label → cuerpo en `Marginalia`; padding horizontal del enlace de idioma |
| sm | 8px | `2` | Segmentos de la StatusLine; label → control y control → error; valor → etiqueta de métrica; líneas internas de una entrada; figura → pie; items de lista |
| md | 16px | `4` | Gaps del header (nav y grupos); párrafo → párrafo; celdas de métricas apiladas (`py-4`); `ps-4` de listas y de `Marginalia` en móvil |
| lg | 24px | `6` | Gutter; margen lateral móvil; regla de sección → encabezado (`pt-6`); encabezado → contenido; padding vertical de cada entrada (`py-6`); padding horizontal de celdas de métrica; campo → campo; nota → nota en `Marginalia` |
| xl | 32px | `8` | Volver → H1; StatusLine bajo el headline (hero A); figura → figura; decisión → decisión; último campo → botón Enviar |
| 2xl | 48px | `12` | Margen lateral ≥768px; padding vertical de página en <1024px (`pt-12`); meta → métricas; métricas → portada; padding vertical del footer (`py-12`) |
| 3xl | 64px | `16` | Header (alto `h-16`); separación entre secciones numeradas en <1024px (`mt-16`); padding superior de página en ≥1024px (`lg:pt-16`) |
| 4xl | 96px | `24` | Separación entre secciones numeradas en ≥1024px (`lg:mt-24`); separación antes del footer en ≥1024px |

Exceptions:
- Objetivos táctiles: CTA y Enviar 44px (`h-11`); enlaces del header y de idioma con alto de caja 32px (`h-8`) y ThemeToggle 32×32 (`icon-sm`), por encima de los 24px de WCAG 2.5.8.
- Reglas y bordes 1px; subrayado activo del header 2px; punto de estado 8px (`size-2`).
- Hover de entradas: `translateX(4px)` (DESIGN.md §4).
- Altura mínima del textarea: 160px (múltiplo de 8).

---

## Typography

DESIGN.md §2 tiene 8 pasos; la interfaz pública de la fase 4 usa **4 tamaños y 2 pesos (400, 600)**.

| Role | Size | Weight | Line Height | Familia y uso |
|------|------|--------|-------------|---------------|
| Body | 16px (`text-base`) | 400 · 600 | 1.55 | Hanken Grotesk. Párrafos (máx. 68ch), bio, Now, listas, bullets de experiencia, cuerpo de decisiones, tagline de entrada (`--ink-2`). 600 solo en h3 de contenido (título de decisión, rol, programa, encabezados dentro de `RichText`) |
| Label | 14px (`text-sm`) | 400 · 600 | 1.55 | Geist Mono 400: StatusLine, fechas, fila meta, stack, números de sección en móvil, pies de figura, `Marginalia`, EN/ES, etiquetas de métricas, "Anterior"/"Siguiente". Hanken 400: nav, footer, enlace volver. Hanken 600: botones y labels del formulario |
| Heading | 25px (`text-xl`) | 600 | 1.1 | Funnel Display, `tracking-display`. h2 de sección, título de entrada, valor de métrica, números del margen del caso, títulos de anterior/siguiente, empresa en experiencia, título de la confirmación del formulario |
| Display | `clamp(2.8rem, 6vw, 4.5rem)` = 44.8–72px (`text-4xl`) | 600 | 1.1 | Funnel Display, -0.02em, `text-balance`, `hyphens-manual`. Un solo H1 por página: headline del hero, título del proyecto, "About", "Contact" |

Reglas:
- Excepción de interlineado: el **tagline del caso** usa 25px Hanken Grotesk 400 `--ink-2` con `leading-snug` (1.375), porque 1.1 aprieta una frase de dos líneas. Es el único texto de 25px que no va en Funnel Display.
- Números (fechas, métricas, números de sección, hora): `tabular-nums`.
- Los enlaces activos del header no cambian de peso (sin saltos de ancho); se marcan con el subrayado.
- Ningún H1 baja de 44.8px ni se trunca. Los títulos de entrada y de anterior/siguiente envuelven, no se truncan.
- Prosa de `RichText` (Tiptap): `p` Body con 16px entre párrafos; `h2`/`h3` del documento se pintan como Body 600 con 32px arriba y 8px abajo (no compiten con los h2 de sección); listas `ps-4` con 8px entre items; enlaces `--ink` subrayados (offset 4px, decoración `--line`, `--ink` al hover); `code` Geist Mono 14px sobre `--bg-elev` con radio 4px y `px-1`; `blockquote` con regla izquierda de 1px `--line`, `ps-4`, `--ink-2`.
- Campos de texto plano del caso (`problem`, `role`, `solution`): párrafos separados por línea en blanco; las líneas que empiezan con `- ` se agrupan en un `<ul>`. Sin markdown adicional.

Imagen OG (raster 1200×630, fuera de la escala de interfaz): título Funnel Display SemiBold 72px (`--ink` claro), mono 28px para la etiqueta y el pie. Fuentes TTF de `assets/fonts-pdf/` (`FunnelDisplay-SemiBold.ttf`, `GeistMono-Regular.ttf`).

---

## Color

Tokens de DESIGN.md §3 tal como están en `globals.css`. Contraste medido en 01-UI-SPEC (2026-10-30).

| Role | Value (claro / oscuro) | Usage |
|------|------------------------|-------|
| Dominant (60%) | `--bg` #fcfaf6 / #0d1014 | Fondo de todas las páginas, header y footer (sin bandas de color) |
| Secondary (30%) | `--bg-elev` #f6f3ee / #15181e · `--ink-2` · `--line` | `--bg-elev`: fondo de imágenes mientras cargan, `code` en prosa, hover de Button `outline`/`ghost`. `--ink-2`: metadatos, fechas, tagline, stack, números inactivos, nav inactiva. `--line`: reglas de sección, separadores de entradas y métricas, bordes de inputs (vía `--input`), borde inferior del header, superior del footer |
| Text | `--ink` #171f2e / #efebe4 | Títulos, cuerpo, labels, nav activa, relleno de Button `default` |
| Accent (10%) | `--accent` #e56636 / #f67d51 (vía `bg-signal`, `text-signal`, `decoration-signal`) | Ver "Accent reserved for" |
| Destructive | `--destructive` oklch(0.53 0.19 27) / oklch(0.70 0.17 25) | Solo texto de error de campo y del formulario, y borde `aria-invalid` del formulario de contacto. El sitio público no tiene acciones destructivas |

Regla derivada que se mantiene (01-UI-SPEC P1, aprobada en G3): en claro el acento da 3.19:1 sobre `--bg`, así que **nunca colorea texto por debajo de 24px y nunca es fondo de texto**. Todo uso de acento en texto es a 25px (texto grande WCAG, ≥ 3:1) o es una marca no textual (≥ 3:1 para 1.4.11).

Accent reserved for (lista exhaustiva):
1. **Home:** el punto de estado de la StatusLine (8px) con `open` o `from_date`.
2. **Caso de estudio:** el número de la sección actual en la columna del margen (25px, ≥1024px y con movimiento permitido, D-02).
3. **About y Contacto:** el subrayado de 2px del enlace activo del header (`aria-current="page"`), offset 6px. El texto del enlace sigue en `--ink`.
4. **Estado transitorio (hover/focus-visible), en cualquier vista:** el título de 25px de una entrada de proyecto y el de anterior/siguiente toman `text-signal` (DESIGN.md §4).
5. El anillo de foco (`--ring`), que no cuenta para el límite.

**Un elemento con acento por vista en reposo** (D-08 y DESIGN.md §3):

| Vista | Elemento con acento | Header |
|-------|---------------------|--------|
| `/` | Punto de estado | Ningún enlace activo: Work apunta a `/#work`, que no es una página |
| `/projects/[slug]` | Número de la sección actual (si hay movimiento y ≥1024px; si no, ninguno) | Ningún enlace activo |
| `/about` | Subrayado de About | About activo |
| `/contact` | Subrayado de Contact | Contact activo |
| Confirmación del formulario | Subrayado de Contact | El bloque de confirmación no lleva acento |

Prohibido: gradientes, texto con gradiente, sombras de color, glass, un segundo tono de acento, acento en botones, en enlaces de cuerpo, en el footer o en la imagen OG fuera del punto (ver OG).

---

## Header (SiteHeader) [Claude dentro de D-08]

- `<header>` estático (no `sticky`), alto 64px, borde inferior 1px `--line`, contenedor de página. Primer hijo del `<body>`: enlace "Saltar al contenido" visible solo con foco, a `#main`.
- Izquierda: enlace a la home con el nombre `settings.name` en Hanken 14px/600 `--ink`. **Por debajo de 640px** muestra "MJ" (iniciales del nombre) con el nombre completo como nombre accesible (`aria-label`).
- Derecha, en una sola línea (`flex items-center gap-4`): `<nav aria-label>` con Work (`/#work`), About, Contact en Hanken 14px/400, `--ink-2`, `--ink` al hover (160ms) · `LangSwitch` · `ThemeToggle`.
- Enlace activo: `aria-current="page"`, `--ink`, subrayado 2px `decoration-signal` con `underline-offset-[6px]`. Ver tabla de acento.
- `LangSwitch`: Geist Mono 14px. Desde 640px muestra `EN / ES`: el idioma actual en `--ink` sin enlace (`aria-current="true"`), el otro como enlace `--ink-2` con `hrefLang` y `lang`. Por debajo de 640px muestra solo el código del otro idioma (`ES` en inglés, `EN` en español). El enlace lleva a la misma página en el otro idioma; en un caso de estudio, al mismo slug (`/projects/x` ↔ `/es/proyectos/x`). Conserva el hash.
- `ThemeToggle`: Button `ghost` `icon-sm` (32px), icono `Moon` en claro y `Sun` en oscuro, `aria-label` con la acción (ver copy). Clic: si `prefers-reduced-motion: no-preference` y existe `document.startViewTransition`, fundido de 250ms del root; si no, cambio directo. Guarda `localStorage.theme = 'light' | 'dark'`. Sin preferencia guardada, sigue `prefers-color-scheme` y escucha sus cambios.
- Presupuesto a 390px en español (estimado a 14px): MJ 22 + 16 + nav 199 (Trabajo · Sobre mí · Contacto con 16px) + 16 + EN 17 + 16 + toggle 32 = 318px ≤ 342px útiles. El planner verifica con la captura de 390px en es; si no cabe, primero baja el gap de la nav a 8px. Nunca menú hamburguesa.

## Footer (SiteFooter) [Claude]

- Separado del contenido por 64px (<1024) / 96px (≥1024), regla superior 1px `--line`, `py-12`.
- Una línea que envuelve (`flex flex-wrap gap-x-4 gap-y-2`), Hanken 14px/400 `--ink-2`, en el orden de `docs/copy.md`: nombre · ubicación (`settings.location`) · GitHub · LinkedIn · Resume (PDF) · Source code. Separadores `·` `aria-hidden`, igual que la StatusLine (el separador cierra el segmento anterior).
- Enlaces subrayados al hover, `--ink` al hover. GitHub y LinkedIn salen de `settings.githubUrl`/`linkedinUrl`; si faltan, no se renderizan. CV: `/cv/en.pdf` o `/cv/es.pdf` según el idioma. Código fuente: `https://github.com/jaras97/mateojaras.dev` como constante de configuración del sitio (no es contenido).
- Sin acento.

---

## Home (`/`, `/es`)

Orden (D-15): hero A → `01 Work` → `02 Contact`. Sin teaser de About. La numeración se asigna según las secciones que se renderizan: si no hay proyectos, `01 Work` no existe y Contact pasa a `01`.

### Hero
- `HeroA` sin cambios de layout. El `h1#hero-title` va dentro de `<SplitHeading>` (ver Movimiento).
- **StatusLine** con dos segmentos nuevos (SITE-02, SITE-03). Orden: `[punto + disponibilidad] · [location] · [hora local + offset] · [solapamiento]`.
  - Hora local: `<time>` con `HH:mm` de 24h en `America/Bogota` seguido del offset (`14:32 UTC-5`), `tabular-nums`. Sale de `ThemeScript` antes del primer paint y `LocalTime` la actualiza al cambiar el minuto. Sin JavaScript, el segmento muestra solo `UTC-5` (lo que se renderiza hoy).
  - Solapamiento: horas de jornada compartidas con Toronto y Madrid en la fecha actual, con horario de verano (`Intl.DateTimeFormat` con `America/Toronto` y `Europe/Madrid`). Supuesto por defecto: jornada 09:00–18:00 en las tres ciudades (P1). Hoy (noviembre) da 9 h con Toronto y 3 h con Madrid; en verano, 8 h y 2 h. Copy en el Copywriting Contract. El shell prerenderizado lleva la frase estática actual (`overlaps with Toronto and Madrid`) y `ThemeScript` la sustituye antes del primer paint por la versión con horas, así que no hay salto de layout ni desajuste de hidratación (`suppressHydrationWarning` solo en esos dos `<span>`).
  - Ningún segmento se parte por dentro y ninguna línea empieza con `·` (regla de la fase 1).

### 01 Work (`EntryList`, D-14), id `work`
- `PageSection` con `SectionNumber` + h2. Lista `<ol>` de todos los proyectos publicados y visibles por `order`.
- Cada entrada es **un solo enlace** al caso (`<a>` que envuelve el bloque), separada de la siguiente por 1px `--line`, `py-6`:
  - ≥1024px: fecha en cols 1–2 (Geist Mono 14px `--ink-2`, `MMM yyyy` de `finishedAt` o, si es nulo, de `startedAt`; si ambos faltan, no hay fecha); en cols 3–9: título (Heading 25px `--ink`), 8px debajo el tagline (Body `--ink-2`, una línea en desktop, envuelve en móvil), 8px debajo la línea mono de stack (`React · Next.js · Supabase`, nombres de `project_skills` por `order`) y, si no hay `liveUrl`, el segmento `Internal tool, sample data` al final de esa línea.
  - <1024px: fecha encima del título, el resto igual.
  - Hover y `focus-visible` (bajo `motion-safe:`): el bloque se desplaza `translateX(4px)` y el título toma `text-signal`, 160ms `cubic-bezier(0.2, 0.8, 0.2, 1)`. Con `reduce`: solo el color, sin desplazamiento.
  - Campos vacíos (tagline, stack) no dejan huecos: la línea no se renderiza.

### 02 Contact (D-15)
- `PageSection`. En cols 3–9: la frase de cierre (intro de contacto de `docs/copy.md`, Body), 24px debajo el bloque de email y 16px debajo el enlace a Cal.com.
- Email: dirección de `settings.email` como enlace `mailto:` (Body `--ink`, subrayado) y a su lado el botón `CopyEmail` (`outline` `sm`). En <640px el botón va debajo, a 8px.
- Cal.com: enlace de texto con `ArrowUpRight`, a `settings.calendarUrl`, misma pestaña. Si `calendarUrl` es nulo, no se renderiza (D-15).

---

## Caso de estudio (`/projects/[slug]`, `/es/proyectos/[slug]`)

Orden del documento (un solo `<article>`):

1. **Volver**: enlace `ArrowLeft` + "All projects" a `/#work` (Hanken 14px `--ink-2`).
2. **Cabecera** (32px debajo): H1 Display con el título (cols 3–12 en ≥1024px para que respire); 24px debajo, tagline (25px Hanken 400 `--ink-2`, cols 3–9); 24px debajo, **fila meta** en Geist Mono 14px `--ink-2` con separadores `·`: periodo (`Sep 2025 – Nov 2025`, o `Sep 2025 – present`) · stack · enlace al sitio en vivo (hostname sin `https://` ni `www`, con `ArrowUpRight`, `--ink`) · enlace al repositorio ("Source code") si existe.
3. **Proyecto sin `liveUrl` (CASE-05)**: en lugar del enlace en vivo, el segmento `Internal tool, sample data`; y 16px debajo de la fila meta, una línea en Body: la frase de demo y el enlace "Ask for a demo" a la ruta de contacto del idioma.
4. **Resumen** (48px debajo):
   - **Métricas (D-04)**: `<dl>` de hasta 3 entradas en cols 3–9. ≥768px: una fila de N columnas iguales; cada celda `px-6` con regla izquierda 1px `--line` salvo la primera (que no lleva padding izquierdo). <768px: apiladas, `py-4`, regla superior 1px entre ellas. `<dd>` valor en Heading 25px `--ink` `tabular-nums`; `<dt>` debajo (8px) la etiqueta con su fuente en Geist Mono 14px `--ink-2`. En el DOM el `<dt>` va primero y el orden visual se invierte con `flex-col-reverse` para que el lector de pantalla lea "etiqueta: valor". Sin métricas, no hay fila.
   - **Portada** (48px debajo): la imagen de `coverImage` (su `alt` sale de la entrada de `media` con esa URL), 16:10, radio 8px, fondo `--bg-elev`, cols 3–12 en ≥1024px y ancho completo en móvil. `next/image` con `priority` / `fetchPriority="high"`, sin `lazy`, `sizes="(min-width: 1024px) 1000px, 100vw"`. Sin portada, no hay bloque.
   - Problema y rol no se repiten en el resumen: son las secciones 01 y 02, que siguen inmediatamente (ver P5).
5. **Secciones 01–05 (CASE-02)**, cada una `PageSection` con id (`problem`, `role`, `solution`, `results`, `decisions`); una sección sin datos no se renderiza y **los números son fijos** (01 Problem … 05 Technical decisions), así que un caso sin "Resultados" salta de 03 a 05, como una bitácora que cita su índice. Contenido en cols 3–9:
   - `01 Problem`: texto plano de `problem`.
   - `02 My role`: texto plano de `role`.
   - `03 Solution`: texto plano de `solution`, luego `RichText` de `case_study`, luego la **galería (D-01)**: los items de `media` excepto la portada, apilados, 32px entre figuras. Cada `<figure>`: imagen 16:10, radio 8px, fondo `--bg-elev`, `loading="lazy"`, `sizes="(min-width: 1024px) 650px, 100vw"`, `alt` localizado. `<figcaption>` 8px debajo en Geist Mono 14px `--ink-2` con el contador `01 / 04` (ver P2 sobre vista y fecha). Items `video`: `<video controls preload="none" playsInline>` 16:10 sin autoplay, con el alt como `aria-label`. Sin JS de cliente, sin lightbox.
   - `04 Results`: `<ul>` de `results`, `ps-4 list-disc`, 8px entre items.
   - `05 Technical decisions` (CASE-03): en cols 3–9 la lista de decisiones, 32px entre ellas, cada una con h3 (Body 600) y 8px debajo su cuerpo (Body 400). En cols 10–12, `<aside>` `Marginalia`, alineada arriba con la primera decisión, con hasta 3 notas en este orden, 24px entre ellas: "Trade-offs" (`tradeoffs`), "How I verified it" (`validation`), "AI tools" (`aiTools` unidos con ` · `). Cada nota: etiqueta Geist Mono 14px `--ink-2`, 4px debajo el cuerpo en Geist Mono 14px `--ink`. <1024px: el `<aside>` va debajo de las decisiones, 32px, con regla izquierda 1px `--line` y `ps-4` (DESIGN.md §4: "debajo del párrafo en mono pequeño"). Una nota vacía no se renderiza; sin notas, no hay `<aside>`.
6. **Número de sección en el margen (D-02, MOTN-03)**:
   - ≥1024px: cada sección pinta su número en cols 1–2 en Funnel Display 25px/600 `tabular-nums`, como dos capas superpuestas: base `--ink-2` y copia en `text-signal` con `opacity: 0`. Con `prefers-reduced-motion: no-preference`, el bloque del número es `position: sticky; top: 32px` dentro de su sección (acompaña el scroll) y `<ScrollScene>` hace scrub de la opacidad de la capa de acento: 0 → 1 cuando el borde superior de la sección cruza el 50% del viewport y 1 → 0 cuando lo cruza su borde inferior. Solo hay un número en acento a la vez. La capa de acento es `aria-hidden`.
   - Con `reduce`, o sin JS: número estático en `--ink-2` arriba de su sección, sin sticky, sin acento.
   - <1024px: el número va en línea antes del h2 con `SectionNumber` (mono 14px `--ink-2`). Sin escena.
   - En el h2 de ≥1024px el número no se repite (el h2 lleva solo la etiqueta); el texto accesible del número de margen se conserva una vez.
7. **Anterior/siguiente (D-03, CASE-06)**: `<nav aria-label>` tras la última sección, separado como una sección (regla 1px, `pt-6`). ≥768px: dos columnas, "anterior" a la izquierda y "siguiente" a la derecha alineado a la derecha; sin anterior, la celda izquierda queda vacía y "siguiente" sigue a la derecha. <768px: apilados. Cada uno es un enlace: etiqueta Geist Mono 14px `--ink-2` y 8px debajo el título en Heading 25px, con el mismo hover que las entradas. No da la vuelta.
8. **Llamada a contacto** (64px / 96px debajo, regla 1px, `pt-6`): la frase de cierre (intro de `docs/copy.md`) en Body y, 24px debajo, el Button `default` `lg` "Let’s talk" a la ruta de contacto del idioma.

Slug inexistente o en borrador: `notFound()` (fase 2, D-09). Mientras el slug resuelve dentro de `<Suspense>`, el fallback reserva el alto de la línea del H1 (como hoy) sin spinner.

---

## About (`/about`, `/es/sobre-mi`) [Claude]

1. H1 Display "About" / "Sobre mí" (cols 3–12).
2. 32px debajo, la **bio** (`settings.bio`, Body, cols 3–9, máx. 68ch). Sin bio, no hay bloque.
3. `01 Now` (D-06): `RichText` de `now_*` en cols 3–9. La fecha va en el margen (cols 1–2 en ≥1024px; encima del texto en móvil) en Geist Mono 14px `--ink-2`: "Updated 22 Nov 2026", desde `settings.updatedAt` en `settings.timezone`. Sin texto en Now, no hay sección.
4. `02 Stack`: un grupo por categoría con skills (orden del enum: frontend, state, testing, backend, ai, tools; nombres de `Cv.skillCategories`). Cada grupo: nombre de categoría en Geist Mono 14px `--ink-2` y debajo una lista en dos columnas desde 768px (una en móvil), 8px entre filas: nombre en Body `--ink` y años en Geist Mono 14px `--ink-2` alineados a la derecha de la fila (`5 years`). `yearsUsed` nulo: solo el nombre. Sin barras de nivel, sin iconos. 24px entre grupos. Categoría vacía no se renderiza.
5. `03 Experience`: entradas por `order`, 32px entre ellas, regla 1px entre entradas. Periodo en el margen (mono `--ink-2`, `Aug 2021 – Aug 2025`; `endDate` nulo → `Present`). En cols 3–9: empresa en Heading 25px; 8px debajo el rol en Body `--ink`; 8px debajo una línea mono `--ink-2` con tipo y ubicación; 16px debajo los bullets (`ul ps-4 list-disc`, 8px entre items). Una experiencia sin bullets se muestra sin lista (caso Sofka hoy).
6. `04 Education`: misma forma que experiencia, con institución en Body 600, programa en Body 400 y `status` en `--ink-2`.
7. `05 Languages`: `<dl>` de `settings.languages`: nombre del idioma con `Intl.DisplayNames(locale, { type: 'language' })` con la primera letra en mayúscula, y nivel de `Cv.levels` en Geist Mono 14px `--ink-2`.

Igual que en la home, las secciones vacías no se renderizan y los números se asignan según las que quedan.

---

## Contacto (`/contact`, `/es/contacto`)

1. H1 Display "Contact" / "Contacto".
2. 32px debajo, la intro de `docs/copy.md` (Body, cols 3–9).
3. 48px debajo, en ≥1024px: formulario en cols 3–8 y `<aside>` "otras vías" en cols 10–12 alineado arriba. <1024px: el `<aside>` va debajo del formulario, a 48px.

### Formulario (ContactForm)
- `<form>` con `noValidate` y validación Zod en cliente (al salir del campo y al enviar) y en servidor con el mismo schema. La action recibe `locale` explícito.
- Campos en una columna, 24px entre ellos: Nombre (`input`, `autocomplete="name"`), Email (`input type="email"`, `autocomplete="email"`, `inputmode="email"`), Mensaje (`textarea`, mínimo 160px, crece con el contenido). Labels visibles en Hanken 14px/600 encima, 8px.
- Honeypot: un campo de texto extra (`name="website"`) dentro de un contenedor `sr-only` + `aria-hidden="true"`, con `tabIndex={-1}` y `autoComplete="off"`; nunca recibe foco. Marca de tiempo de render en un campo oculto, validada en servidor (< ~3 s se descarta).
- Error de campo: 8px debajo del control, Hanken 14px/400 `text-destructive`, conectado con `aria-describedby`; el control lleva `aria-invalid` y borde `--destructive`. Al enviar con errores, el foco va al primer campo inválido.
- Botón "Send" (Button `default` `lg`, 44px), 32px bajo el último campo, alineado a la izquierda. Mientras envía: deshabilitado, `aria-busy="true"`, etiqueta "Sending…". Los campos no se borran.
- Error de formulario (límite, Upstash caído, fallo al guardar): bloque encima del botón con `role="alert"`, Hanken 14px `text-destructive`, con el email como enlace `mailto:`. Los datos escritos se conservan.
- **Confirmación (D-13)**: reemplaza al `<form>` en el mismo contenedor y con su mismo ancho; un bloque con h2 en Heading 25px (`tabIndex={-1}`, recibe el foco) y región `aria-live="polite"`. Mismo bloque para envíos descartados por honeypot o tiempo. Entra con un fundido de opacidad de 200ms bajo `motion-safe:` (enter, Motion); con `reduce`, aparece. Sin toast, sin ruta nueva.

### Otras vías (`<aside>`)
- Etiqueta Geist Mono 14px `--ink-2` "Or write directly", 8px debajo el email (`mailto:`, Body) y 8px debajo `CopyEmail`.
- 24px debajo, si hay `calendarUrl`: etiqueta mono "Prefer a call?" y el enlace a Cal.com.

### CopyEmail (CONT-05)
- Button `outline` `sm` (32px). Clic: `navigator.clipboard.writeText(email)`. Éxito: la etiqueta pasa a "Copied" durante 2 s y vuelve; el cambio se anuncia con un `<span aria-live="polite">` `sr-only`. Fallo (permiso o API ausente): el texto de ayuda de error del copy aparece 8px debajo en Hanken 14px `--ink-2` y la dirección queda seleccionada. El ancho del botón se fija al de la etiqueta más larga para que no salte.

### Envs ausentes (regla de CLAUDE.md)
- Sin `UPSTASH_*`: la action falla cerrado y el visitante ve el error de "no disponible" con el email. En desarrollo, además, el log del servidor nombra la variable que falta.
- Sin `RESEND_API_KEY`: el mensaje se guarda y el visitante ve la confirmación (D-09); el log registra el envío pendiente y `/admin/mensajes` lo marca por `email_sent_at` nulo.

---

## `/admin/mensajes` (D-10)

Única superficie del admin que cambia: en la lista y en el lector, un mensaje con `email_sent_at` nulo lleva un `Badge` `outline` "Email no enviado" (sin acento, sin destructive), y el lector muestra en mono `--ink-2` "Guardado, pero el aviso por email falló. Respóndelo desde aquí." Se mantiene el resto del contrato de 03-UI-SPEC.

---

## Movimiento (DESIGN.md §5, presupuesto cerrado)

Todo detrás de `prefers-reduced-motion: no-preference`; con `reduce`, todo aparece en su estado final. Solo `transform` y `opacity`; `will-change` solo durante la animación. Scroll nativo. Easing común `cubic-bezier(0.2, 0.8, 0.2, 1)`.

| # | Qué | Dónde | Contrato |
|---|-----|-------|----------|
| 1 | `<Reveal>` (MOTN-01) | Bloques de primer nivel de cada página: en la home, StatusLine + CTA del hero, `01 Work`, `02 Contact`; en el caso, fila meta, métricas, portada, primera sección; en about y contacto, el bloque bajo el H1 y la primera sección | Opacidad 0→1 y `translateY(12px)`→0, 400ms, stagger 60ms, máximo 6 bloques (360ms de retraso como tope). **Implementación con keyframes CSS** desde el primer paint (variable `--reveal-index`), sin esperar a la hidratación, para no retrasar el LCP. Los H1 no van en `<Reveal>` (el del hero tiene su propia animación; los demás aparecen tal cual) |
| 2 | `<SplitHeading>` (MOTN-02) | Solo `h1#hero-title` de la home | GSAP SplitText `type: "words"`, después de `document.fonts.ready`, palabras de opacidad 0→1 y `y: 12`→0, 700ms en total (stagger incluido), una vez, y `revert()` al terminar. Estado oculto inicial solo con `html.motion-ok` (clase que pone `ThemeScript`) y nunca más de 1000ms: una animación CSS de seguridad muestra el H1 a 1000ms aunque GSAP no cargue. Las palabras son `inline-block` con el mismo `text-balance`, sin CLS (verificar CLS = 0 en la captura de rendimiento). GSAP se importa de forma dinámica solo en este componente |
| 3 | `<ScrollScene>` (MOTN-03) | Solo el caso de estudio, ≥1024px | Ver "Número de sección en el margen". ScrollTrigger se carga solo en esta ruta. Ninguna otra página tiene escena scrubbed (D-16) |
| 4 | Hover | Entradas y anterior/siguiente: `translateX(4px)` + color; enlaces y botones: solo color | 160ms. Sin escalas |
| 5 | Tema | `ThemeToggle` | View Transitions, fundido del root 250ms |
| 6 | Cambio de ruta | Layout `[locale]` | `<ViewTransition>` con fundido de 250ms solo si `experimental.viewTransition` funciona sin errores en build y en navegación; si no, sin transición, y se registra en `docs/decisions.md` |
| — | Confirmación del formulario | `ContactForm` | Fundido de opacidad 200ms (enter de Motion). Cuenta como enter/exit, no como animación nueva |

Verificación del flag de investigación: GSAP dentro de `<Activity>` (si la navegación del App Router oculta la ruta, el `useGSAP` debe limpiar y recrear sus triggers al volver) y SplitText tras `document.fonts.ready` sin CLS.

---

## SEO y OG

- Título (`metadata.title`): home = `seoTitle` de SiteSettings (fallback: `settings.name`); resto = `{título de página} · {settings.name}`. Descripción: home = `seoDescription` (fallback: headline); caso = tagline (fallback: los primeros 155 caracteres del problema, cortados en límite de palabra); about = la bio cortada igual; contacto = la intro.
- `alternates.languages` con `en`, `es` y `x-default` (= en) en cada página, con las rutas localizadas reales.
- **Imagen OG (D-07)**: 1200×630, fondo `--bg` claro (#fcfaf6), padding 72px. Arriba a la izquierda, etiqueta mono 28px `--ink-2` ("Case study" en los casos; nombre de la página en el resto). Abajo del bloque, el título en Funnel Display SemiBold 72px `--ink`, `line-height` 1.1, máximo 3 líneas (si no cabe, baja a 56px). Pie en mono 28px `--ink-2`: a la izquierda un punto de acento de 12px y `mateojaras.dev`, a la derecha la fecha (periodo del proyecto en los casos; `updatedAt` de SiteSettings en el resto, `MMM yyyy`). Una por idioma y por caso. Sin gradientes ni imágenes.
- `sitemap.xml`: home, about, contacto y cada caso publicado y visible, en/es, con `alternates`. `robots.txt`: `Disallow: /admin` y `/api`, enlaza el sitemap.

---

## Copywriting Contract

Reglas: sin em-dashes, sin emojis, sin "!", sin superlativos. Apóstrofo tipográfico U+2019. Las cadenas nuevas van en `messages/en.json` y `messages/es.json` con paridad. El contenido (titulares, bio, casos, Now) sale de la base de datos y no se escribe en componentes. Fuente: **[copy.md]** = `docs/copy.md`; **[ctx]** = 04-CONTEXT.md; **[msg]** = ya existe en `messages/*.json`; **[propuesta]** = Claude, pendiente de Teo.

| Element | EN | ES | Fuente |
|---------|----|----|--------|
| Primary CTA (hero y cierre del caso) | Let’s talk | Hablemos | [copy.md], aprobado en G3 |
| Enviar formulario | Send | Enviar | [copy.md] |
| Enviando | Sending… | Enviando… | [propuesta] |
| Confirmación | Thanks, I’ll get back to you soon. | Gracias, te respondo pronto. | [copy.md] |
| Intro de contacto y frase de cierre | Tell me what you’re building. I reply within a day, in English or Spanish. | Cuéntame qué estás construyendo. Te respondo en menos de un día, en español o en inglés. | [copy.md] |
| Labels | Name · Email · Message | Nombre · Email · Mensaje | [copy.md] (ES [propuesta]) |
| Honeypot (oculto) | Leave this field empty | Deja este campo vacío | [propuesta] |
| Nav | Work · About · Contact | Trabajo · Sobre mí · Contacto | [msg] Hero.index |
| Nav (`aria-label`) | Main | Principal | [propuesta] |
| Enlace a la home (`aria-label`) | Mateo Jaramillo, home | Mateo Jaramillo, inicio | [propuesta] |
| Saltar al contenido | Skip to content | Saltar al contenido | [propuesta] |
| LangSwitch (`aria-label` del enlace) | Ver esta página en español (con `lang="es"`) | View this page in English (con `lang="en"`) | [propuesta] |
| ThemeToggle | Switch to dark theme / Switch to light theme | Cambiar a tema oscuro / Cambiar a tema claro | [propuesta] |
| Secciones de la home | Work · Contact | Trabajo · Contacto | [msg] Hero.index (sustituye a `Site.home.projectsHeading`) |
| Proyecto sin URL pública | Internal tool, sample data | Herramienta interna, datos de ejemplo | [ctx] ES; EN [propuesta] |
| Frase de demo (CASE-05) | This tool is not public. I can show you a demo with sample data. | Esta herramienta no es pública. Te muestro una demo con datos de ejemplo. | [propuesta] |
| Enlace de demo | Ask for a demo | Pide una demo | [propuesta] |
| Volver | All projects | Todos los proyectos | [msg] Site.project.backHome |
| Secciones del caso | Problem · My role · Solution · Results · Technical decisions | Problema · Mi rol · Solución · Resultados · Decisiones técnicas | REQUIREMENTS CASE-02 (ES); EN [propuesta] |
| Métricas (`aria-label` del `<dl>`) | Key figures | Cifras clave | [propuesta] |
| Marginalia | Trade-offs · How I verified it · AI tools | Compromisos · Cómo lo verifiqué · Herramientas de IA | ES de [msg] Admin (adaptado a 1.ª persona del sitio); EN [propuesta] |
| Repositorio en fila meta | Source code | Código fuente | [propuesta] |
| Periodo abierto | present | actualidad | [msg] Cv.present (en minúscula dentro del periodo) |
| Anterior/siguiente | Previous project · Next project | Proyecto anterior · Proyecto siguiente | [propuesta] |
| Anterior/siguiente (`aria-label`) | More projects | Más proyectos | [propuesta] |
| Copiar email | Copy email → Copied | Copiar email → Copiado | [propuesta] |
| Copiar email, fallo | Could not copy. The address is selected, copy it with your keyboard. | No se pudo copiar. La dirección quedó seleccionada, cópiala con el teclado. | [propuesta] |
| Cal.com | Book a call on Cal.com | Agenda una llamada en Cal.com | [propuesta] |
| Otras vías | Or write directly · Prefer a call? | O escríbeme directamente · ¿Prefieres una llamada? | [propuesta] |
| Hora local | `14:32 UTC-5` | `14:32 UTC-5` | formato |
| Solapamiento con horas | overlaps {toronto} h with Toronto and {madrid} h with Madrid | coincide {toronto} h con Toronto y {madrid} h con Madrid | [propuesta]; sin JS queda la frase actual de [msg] Hero.overlap |
| About: H1 y secciones | About · Now · Stack · Experience · Education · Languages | Sobre mí · Ahora · Stack · Experiencia · Educación · Idiomas | [msg] Hero.index.about; resto [propuesta] (Languages/Idiomas de [msg] Cv) |
| Fecha de Now | Updated {date} | Actualizado el {date} | [propuesta] |
| Años de stack | {n, plural, one {# year} other {# years}} | {n, plural, one {# año} other {# años}} | [propuesta] |
| Tipo de experiencia | Employment · Freelance | Empleo · Freelance | [propuesta] |
| Contacto: H1 | Contact | Contacto | [msg] Hero.index.contact |
| Footer | Mateo Jaramillo · {location} · GitHub · LinkedIn · Resume (PDF) · Source code | Mateo Jaramillo · {location} · GitHub · LinkedIn · CV (PDF) · Código fuente | [copy.md]; "Source code" y ES [propuesta] |
| OG, etiqueta de caso | Case study | Caso de estudio | [propuesta] |
| Empty state heading | No hay en el sitio público. Contenido ausente = el bloque no se renderiza (CLAUDE.md): sin proyectos, sin `01 Work`; sin métricas, sin fila; sin Now, sin sección; sin `calendarUrl`, sin enlace | — | regla |
| Empty state body | No aplica (ver arriba). No se pinta ningún "Todavía no hay…" en público | — | regla |
| Error: nombre vacío | Write your name. | Escribe tu nombre. | [propuesta] |
| Error: email inválido | Enter a valid email, like name@company.com. | Escribe un email válido, como nombre@empresa.com. | [propuesta] |
| Error: mensaje corto (< 10 caracteres) | Tell me a bit more, at least 10 characters. | Cuéntame un poco más, al menos 10 caracteres. | [propuesta] |
| Error: mensaje largo (> 5000) | Keep it under 5,000 characters, or write to {email}. | Que no pase de 5000 caracteres, o escríbeme a {email}. | [propuesta] |
| Error: límite por IP | You’ve sent 3 messages in the last hour. Try again later, or write to {email}. | Ya enviaste 3 mensajes en la última hora. Vuelve a intentarlo más tarde o escríbeme a {email}. | [propuesta] |
| Error: Upstash caído o fallo al guardar | I couldn’t send your message right now. Try again in a few minutes, or write to {email}. | No pude enviar tu mensaje ahora. Inténtalo de nuevo en unos minutos o escríbeme a {email}. | [propuesta] |
| Admin: email no enviado | — | Email no enviado · Guardado, pero el aviso por email falló. Respóndelo desde aquí. | [propuesta] |
| Destructive confirmation | El sitio público no tiene acciones destructivas | — | — |

---

## UI Considerations

Applicable state considerations resolved: 22 covered, 6 backstop, 3 unresolved.

| Category | Element(s) | Status | Resolution / Reason |
|----------|------------|--------|---------------------|
| empty | Home sin proyectos publicados y visibles | ✅ covered | `01 Work` no se renderiza y Contact pasa a `01` |
| empty | Campos opcionales del caso (tagline, problema, rol, solución, case_study, resultados, decisiones, métricas, portada, media, fechas, stack) | ✅ covered | Cada bloque vacío no se renderiza; los números 01–05 se mantienen fijos |
| empty | `Marginalia` sin `tradeoffs`/`validation`/`aiTools` | ✅ covered | No hay `<aside>`; cada nota vacía se omite |
| empty | Now vacío, bio vacía, categoría de skills vacía, experiencia sin bullets | ✅ covered | Sección/bloque/lista omitidos; la numeración de about se recalcula |
| empty | `calendarUrl`, `githubUrl`, `linkedinUrl` nulos | ✅ covered | El enlace correspondiente no se renderiza |
| partial | Proyecto sin `liveUrl` | ✅ covered | Segmento "Internal tool, sample data" en entrada y fila meta + frase y enlace de demo en el caso |
| partial | Proyecto sin fechas | ✅ covered | Sin columna de fecha en la entrada y sin segmento de periodo |
| partial | `yearsUsed` nulo | ✅ covered | Fila de skill solo con el nombre |
| zero-one-many | Métricas 0/1/2/3 | ✅ covered | 0: sin fila; 1–3: N columnas iguales desde 768px, apiladas debajo |
| zero-one-many | Anterior/siguiente en el primer, último o único proyecto | ✅ covered | Sin vuelta; el lado ausente queda vacío; con un solo proyecto, no hay `<nav>` |
| zero-one-many | Galería con 0 items o solo la portada | ✅ covered | Sin galería |
| populated | Caso de estudio completo | 🧪 backstop | `{ statement: "Un caso con todos los campos muestra cabecera, fila meta, métricas, portada, 01–05 con galería y Marginalia, anterior/siguiente y CTA, a 390/768/1440 en claro y oscuro", verification: backstop }`. Hoy ningún proyecto tiene esos datos (ver fila unresolved) |
| loading | Slug dentro de `<Suspense>` | ✅ covered | Fallback que reserva la línea del H1, sin spinner |
| loading | Imágenes | ✅ covered | Proporción 16:10 fija y fondo `--bg-elev`: CLS 0 |
| loading | Fuentes | ✅ covered | `next/font` con `swap` y fallback ajustado; SplitText espera a `document.fonts.ready` |
| loading | Envío del formulario | ✅ covered | Botón deshabilitado, `aria-busy`, "Sending…", datos conservados |
| error | Validación de campos | ✅ covered | Errores de campo del Copywriting Contract, `aria-invalid`, foco al primer inválido |
| error | Límite por IP y Upstash caído | ✅ covered | Bloque `role="alert"` con el copy correspondiente y el email |
| error | Resend falla después de guardar | ✅ covered | Confirmación normal (D-09); marca "Email no enviado" en `/admin/mensajes` |
| error | Honeypot o envío < ~3 s | ✅ covered | Misma confirmación que un envío válido (D-13) |
| error | Portapapeles no disponible | ✅ covered | Texto de fallo de copiar y dirección seleccionada |
| error | Slug desconocido o borrador | ✅ covered | `notFound()` (la 404 diseñada es de la fase 5) |
| focus | Confirmación del formulario | ✅ covered | El foco pasa al h2 de la confirmación y se anuncia con `aria-live="polite"` |
| focus | Teclado en todas las vistas | 🧪 backstop | `{ statement: "Con Tab en claro y oscuro: skip link primero, anillo sólido de 2px de acento con offset 2px en cada enlace, botón e input; el honeypot nunca recibe foco; las entradas enteras son un solo tab stop", verification: backstop }` |
| overflow | Header a 390px en es | 🧪 backstop | `{ statement: "A 390px en es el header cabe en una línea (MJ, 3 enlaces, ES/EN, toggle) sin scroll horizontal ni solapes", verification: backstop }` |
| long-text | H1 de caso y de hero en es a 390px, títulos de entrada, fila meta, StatusLine con hora y solapamiento | 🧪 backstop | `{ statement: "A 390px: H1 con text-balance sin truncar ni bajar de 44.8px; la fila meta y la StatusLine envuelven entre segmentos y ninguna línea empieza con ·; sin scroll horizontal", verification: backstop }` |
| motion | Reduced motion | 🧪 backstop | `{ statement: "Con prefers-reduced-motion: reduce, Reveal, SplitHeading, ScrollScene, hover de desplazamiento, View Transitions y el fundido de la confirmación no animan; los números del margen quedan estáticos en --ink-2 y no son sticky", verification: backstop }` |
| motion | CLS y LCP con SplitHeading y Reveal | 🧪 backstop | `{ statement: "Lighthouse móvil en el Preview: CLS ≤ 0.1 (objetivo 0 en el hero) y LCP ≤ 2.5 s en /, /projects/[slug], /about y /contact en en y es; el H1 del hero nunca queda oculto más de 1000ms", verification: backstop }`. Si el LCP del hero falla, se consulta a Teo el plan B de P4 |
| contrast | Acento en claro (3.19:1) | ✅ covered | Solo en marcas no textuales y texto de 25px (ver Color) |
| data | `e2e-stale-probe` aparece publicado y visible en `content/projects.json` | ⚠ unresolved — planner must treat as assumption | Si la base de `dev`/`main` lo tiene así, saldría en la home con el título "Stale probe e2e". Supuesto: el e2e lo limpia o lo pone en borrador; el planner lo comprueba antes de las capturas |
| content | Ningún proyecto tiene hoy tagline, problema, rol, métricas, portada ni media | ⚠ unresolved — planner must treat as assumption | Las capturas y el Lighthouse de ManuJ miden un caso casi vacío. Supuesto: Teo carga ManuJ completo desde el admin antes del gate; el planner pide el contenido al empezar la fase |
| data | Pie de figura "vista y fecha" (D-01) sin campo en `media` | ⚠ unresolved — planner must treat as assumption | Supuesto por defecto: pie con contador `01 / 04` y nada inventado (P2) |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | Ninguno nuevo; se reutilizan `button`, `input`, `textarea`, `field`, `label`, `skeleton` (y `badge` en el admin) ya instalados | not required |

`components.json` tiene `"registries": {}`. Aceternity UI, Magic UI, React Bits, Cult UI y cualquier registro de efectos están prohibidos (CLAUDE.md, DESIGN.md §6). No se añaden dependencias: `next/og` viene con Next y GSAP, Motion y lucide ya están instalados.

---

## Preguntas abiertas para Teo

Ninguna bloquea el plan: cada una tiene su valor por defecto en el contrato. Se registran en `docs/decisions.md` cuando Teo responda.

- **P1. Jornada para el solapamiento (SITE-02).** Por defecto, 09:00–18:00 en Medellín, Toronto y Madrid. Hoy da "9 h con Toronto y 3 h con Madrid" (8 h y 2 h en verano). ¿Es tu jornada real, o prefieres otro rango (por ejemplo, 07:00–16:00 para coincidir más con Madrid)? El número sale publicado, por eso se pregunta.
- **P2. Pie de las capturas (D-01).** `media` solo guarda `url`, `altEn/altEs` y `type`: no hay "vista" ni fecha. Por defecto el pie muestra el contador `01 / 04` y no repite el alt. Alternativa: añadir `captionEn/captionEs` y `capturedAt` opcionales a cada item de `media` (es JSON, no hace falta migración, pero toca `docs/data-model.md` y el formulario del admin).
- **P3. Header a 390px.** Por defecto, por debajo de 640px el nombre se abrevia a "MJ" y el selector muestra solo el otro idioma (`ES`/`EN`). Alternativa: nombre completo y nav más compacta, con el riesgo de que en español no quepa.
- **P4. Plan B de SplitText si el LCP del hero no llega a 2.5 s.** Por defecto se usa GSAP SplitText con un tope de 1000ms oculto. Si el gate falla, la alternativa es partir el H1 en palabras en el servidor y animarlo solo con CSS (mismo efecto, sin JS), lo que se aparta de la letra de MOTN-02.
- **P5. Resumen del caso (CASE-01).** Por defecto el resumen es tagline + métricas + portada, y problema y rol se leen en 01 y 02 justo debajo, para no repetir el mismo texto dos veces. Si prefieres que el resumen también traiga problema y rol, haría falta un campo corto aparte (cambio de modelo de datos).
- **P6. Copy propuesta.** Todas las filas **[propuesta]** del Copywriting Contract, en especial "Internal tool, sample data", la frase de demo, las etiquetas de `Marginalia` y los errores del formulario.

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
