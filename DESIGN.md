# DESIGN.md — dirección de arte de mateojaras.dev

Estado: PROPUESTA. Se convierte en APROBADO cuando Teo escriba las dos frases del concepto y elija la variante del hero (día 2). Nada de este archivo se cambia sin preguntar a Teo.

## 1. Concepto: la bitácora de un taller
> [Teo escribe aquí dos frases con sus palabras sobre qué debe sentir alguien al entrar al sitio.]

El sitio se lee como el registro de trabajo de alguien que construye productos web: secciones numeradas (01, 02, 03), entradas con fecha, una línea de estado viva en el hero que sale del admin ("Available from Nov 2026 · Medellín, UTC-5 · overlaps with Toronto and Madrid"), y notas al margen en los casos de estudio con decisiones técnicas. El panel admin es el cuaderno donde se escribe esa bitácora. Tono: preciso, sereno, cálido. Nada grita.

Referencias (estructura y actitud, nunca copiar estética): eduardbodak.com (freelance claro, transiciones), finethought.com.au (minimalismo con interacción sutil), antfu.me (identidad de dev, gráficos tenues).

## 2. Tipografía
- Display: **Funnel Display** (Google Fonts, variable). Títulos H1–H2, números de sección. Pesos 500–700. Tracking ligeramente negativo en tamaños grandes (-0.02em).
- Texto: **Hanken Grotesk** (Google Fonts, variable). Cuerpo, UI, admin. Pesos 400–600.
- Mono: **Geist Mono**. Fechas, estados, etiquetas de stack, código. Peso 400.
- Self-hosted con `next/font/local` (descargar TTF/WOFF2 a `src/assets/fonts/`); `display: 'swap'`; subset latin + latin-ext (tildes y ñ).
- Para el PDF del CV: TTF estáticos en `assets/fonts-pdf/` (react-pdf no acepta variables ni WOFF2).

Escala (base 16px, ratio 1.25, fluida con `clamp`):
`--text-xs 0.75rem · --text-sm 0.875rem · --text-base 1rem · --text-lg 1.25rem · --text-xl 1.563rem · --text-2xl 1.953rem · --text-3xl 2.441rem · --text-4xl clamp(2.8rem, 6vw, 4.5rem)`. Line-height: 1.1 en display, 1.55 en texto. Máximo 68 caracteres por línea en párrafos.

## 3. Color (OKLCH, un solo acento)
```css
:root {
  --bg: oklch(0.985 0.006 80);        /* fondo cálido casi blanco */
  --bg-elev: oklch(0.965 0.008 80);   /* superficies */
  --ink: oklch(0.24 0.03 260);        /* texto principal, azul-gris profundo */
  --ink-2: oklch(0.48 0.02 260);      /* texto secundario */
  --line: oklch(0.88 0.01 80);        /* reglas y bordes */
  --accent: oklch(0.66 0.17 40);      /* terracota: enlaces activos, estado, un solo elemento por vista */
  --accent-ink: oklch(0.99 0 0);      /* texto sobre acento */
}
:root[data-theme="dark"] {
  --bg: oklch(0.17 0.01 260);
  --bg-elev: oklch(0.21 0.012 260);
  --ink: oklch(0.94 0.01 80);
  --ink-2: oklch(0.70 0.015 260);
  --line: oklch(0.30 0.012 260);
  --accent: oklch(0.72 0.16 40);
  --accent-ink: oklch(0.15 0.02 40);
}
```
Reglas: el acento aparece como máximo en un elemento por vista (la línea de estado, el enlace activo, el número de la sección actual). Nunca gradientes, nunca texto con gradiente, nunca sombras de color. Contraste AA mínimo; medir con APCA para texto pequeño. Tema claro por defecto; oscuro si `prefers-color-scheme: dark` o toggle (persistido en localStorage, aplicado antes del primer paint para evitar flash).

## 4. Espaciado y layout
- Grid de 12 columnas, gutter 24px, ancho máximo 1200px, márgenes laterales 24px (móvil) / 48px (desktop).
- Escala de espacio en múltiplos de 8: 8, 16, 24, 32, 48, 64, 96, 128.
- Layout editorial: el texto principal ocupa 7–8 columnas y se desplaza (empieza en la columna 2 o 3), dejando una columna libre para números de sección, fechas y notas al margen (`<Marginalia>`). En móvil las notas pasan debajo del párrafo en mono pequeño.
- Secciones separadas por una regla de 1px (`--line`) y un número en mono ("01 — Work"), no por bloques de color.
- Nada de cards con sombra. Los proyectos se listan como entradas: fecha en mono, título display, una línea de contexto, stack en mono; al hover la entrada completa se desplaza 4px y el título toma el acento.
- Radios: 4px en controles, 8px en imágenes, 0 en contenedores. Bordes 1px.
- Imágenes de proyectos: siempre con `alt` real, proporción fija (16:10), fondo `--bg-elev` mientras cargan.

## 5. Movimiento (presupuesto cerrado)
1. Carga de página: un solo reveal escalonado (opacidad 0→1 y translateY 12px→0, 400ms, easing `cubic-bezier(0.2, 0.8, 0.2, 1)`, stagger 60ms) sobre los bloques de primer nivel. Componente `<Reveal>`.
2. Hero: el H1 entra partido por palabras con GSAP SplitText (una vez, 700ms). Componente `<SplitHeading>`.
3. Una escena scrubbed por página como máximo con GSAP ScrollTrigger (p. ej. el número de sección que se desplaza con el scroll). Componente `<ScrollScene>`.
4. Hover: cambios de color y 4px de desplazamiento, 160ms. Nada de escalas > 1.02.
5. Cambio de tema: View Transitions API (fundido 250ms).
6. Cambio de ruta: `<ViewTransition>` de React en el layout si el flag `experimental.viewTransition` funciona sin problemas; si no, sin transición.
Reglas: solo `transform` y `opacity`; `will-change` únicamente durante la animación; todo detrás de `prefers-reduced-motion: no-preference` (con reduce, los elementos simplemente aparecen). Scroll nativo. Sin parallax, sin cursores custom, sin partículas, sin 3D.

## 6. Componentes
Permitidos de shadcn/ui: Button, Input, Textarea, Select, Dialog, Sheet, Tabs, Table, Badge, Toast, Form, Command (solo backlog), Tooltip. El tema de shadcn se ajusta a estos tokens (radios, fuente, colores) y nunca se deja por defecto.
Propios (en `src/components/site/`): `SectionNumber`, `StatusLine`, `EntryList` (lista de proyectos), `CaseStudy`, `Marginalia`, `ThemeToggle`, `LangSwitch`, `ContactForm`.
Prohibidos: cualquier librería de componentes animados (Aceternity, Magic UI, React Bits, Cult UI), carruseles, marquees, contadores animados, botones con brillo, fondos con grid/dots/aurora/spotlight, glassmorphism, iconos dentro de tiles redondeados, emojis.

## 7. Copy
En primera persona, concreto, con lugar y oficio. Lo escribe Teo en `docs/copy.md`; Claude solo corrige gramática y naturalidad en inglés. Sin em-dashes, sin superlativos ("world-class"), sin frases de tres palabras tipo "Build. Ship. Repeat.". Cada caso de estudio responde: qué problema, qué hice yo, qué resultado, qué decidí técnicamente y por qué.

## 8. Admin
Comparte tokens, tipografía y acento con el sitio público para sentirse un solo producto, pero prioriza densidad y velocidad: tablas compactas, formularios de una columna, guardado con feedback inmediato, atajos de teclado básicos (Cmd+S guarda). Aquí sí se usa shadcn casi puro con el tema aplicado.
