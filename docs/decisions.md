# Registro de decisiones

Una entrada por decisión no trivial. Quién decidió importa: este archivo alimenta el caso de estudio del propio portafolio ("cómo construí mateojaras.dev con IA como herramienta").

Formato:
```
## YYYY-MM-DD · <título corto>
Contexto: qué problema o alternativa había.
Decisión: qué se hizo.
Quién: Teo | Claude Code (aprobado por Teo) | Claude Code (autónomo, dentro de los límites)
Por qué: una o dos frases.
Verificación: cómo se comprobó (test, métrica, captura).
```

## 2026-10-28 · Stack y alcance de la v1
Contexto: elegir entre Next.js fullstack y React + FastAPI; entre CMS externo y admin propio; cuánto construir en 2 semanas.
Decisión: Next.js 16.4 fullstack, admin propio, v1 de 5 entidades y 4 rutas, backlog para el resto.
Quién: Teo, sobre una recomendación investigada (doc "Investigación y recomendación").
Por qué: un solo deploy, SEO nativo, el admin demuestra capacidad fullstack; el recorte protege la fecha.
Verificación: compuertas por fase definidas en PROJECT.md.

## 2026-10-28 · Dirección de arte
Contexto: evitar la estética genérica de IA.
Decisión: concepto "bitácora de un taller", Funnel Display + Hanken Grotesk + Geist Mono, un acento terracota, tema claro por defecto, presupuesto de movimiento cerrado, sin librerías de efectos.
Quién: Claude (propuesta), pendiente de aprobación de Teo el día 2 con la variante del hero.
Por qué: identidad propia antes que receta; las tells prohibidas están en CLAUDE.md.
Verificación: /impeccable:audit sin críticos y revisión por 3 personas.

## 2026-10-30 · Aprobaciones de arranque de la fase 1
Contexto: la fase 1 necesitaba dos dependencias nuevas, `yaml` 2.9.1 (contrato de `docs/content`, que el seed de la fase 2 también usa) y `@axe-core/playwright` 4.14.0 (compuerta de axe del UI-SPEC). CLAUDE.md pide preguntar antes de añadir dependencias. Se preguntó en G1 (01-03).
Decisión: respuesta de Teo, literal: "1 si, 2 si". Lectura de G1: `yaml: sí`, `axe: sí`. Sobre la legitimidad de `@axe-core/playwright` en npm, respondió literal: "verificado, igual estas en modo yolo, solo preguntame cosas que tengan mucha relevancia" (lectura: `axe-legitimidad: verificado`). Ningún punto quedó pendiente. `yaml` se instala en 01-05 y `@axe-core/playwright` en 01-08, los dos como devDependencies con versión exacta.
Quién: Teo.
Por qué: el contrato de contenido necesita un parser YAML importable, y la compuerta de axe sin paquete se habría sustituido por una revisión manual.
Verificación: `.planning/phases/01-identidad-y-contenido/01-03-ANSWERS.md` y la compuerta g1-record de `scripts/check-phase-1.sh` (01-12).

## 2026-10-30 · Métricas bilingües en docs/content (decidió Teo)
Contexto: D-08 y D-11 dejaban la etiqueta y la fuente de cada métrica solo en español, mientras IDEN-05 y el criterio de éxito 3 piden la fuente de cada métrica en en y es (RESEARCH, pregunta abierta 2).
Decisión: cada métrica de `docs/content` lleva `labelEs`, `labelEn`, `value`, `sourceEs` y `sourceEn`. El esquema de la base de datos y `docs/data-model.md` no cambian, así que D-11 sigue valiendo para la base (`metrics` sigue siendo `{ label, value }[]`, con la fuente unida a la etiqueta). Cómo llegan a la base la etiqueta y la fuente en inglés se decide en la fase 2. El inglés es la traducción de Claude, en borrador hasta que Teo la apruebe en G7 (D-07).
Quién: decidió Teo (2026-10-30, en la sesión de planificación). Cambia la forma de las métricas en `docs/content` fijada en D-08, no el esquema.
Por qué: el caso de estudio en inglés también tiene que citar sus fuentes.
Verificación: el contrato de `pnpm content:check` (una métrica sin `sourceEn` o `sourceEs` falla, aunque `pendingFields` la liste) y la compuerta metric-sources de `scripts/check-phase-1.sh` (01-12).

## 2026-10-30 · Inglés de IDEN-07 y del criterio 4 aprobado por Teo (D-07)
Contexto: IDEN-07 y el criterio de éxito 4 dicen que el copy lo escribe Teo en en y es, mientras D-07 dice que Teo responde en español y Claude propone el inglés, marcado como pendiente hasta que Teo lo apruebe.
Decisión: la mitad en inglés de IDEN-07 y del criterio 4, y el inglés de `docs/content`, del titular del fixture y de los textos del Hero, se cumple cuando Teo aprueba la traducción de Claude en G7 (01-12), no porque Teo escriba el inglés él mismo. El español es suyo.
Quién: decidió Teo (D-07, en la discusión de la fase).
Por qué: Teo piensa y responde en español; una traducción fiel aprobada por él conserva la autoría sin pedirle redactar dos veces.
Verificación: las compuertas copy-approved, content-approved, fixture-approved y herocopy-approved de `scripts/check-phase-1.sh --final` (01-13).

## 2026-10-30 · Textos de interfaz de la fase 1 en messages/
Contexto: CLAUDE.md pide los textos de interfaz en `messages/en.json` y `messages/es.json`. El UI-SPEC ("Barra del lab y estados del lab") proponía dejarlos en código hasta la fase 2, lo que se habría apartado de la regla sin aprobación de Teo.
Decisión: seguir CLAUDE.md desde el principio. El chrome del lab vive en un namespace Lab con las mismas claves en `messages/en.json` y `messages/es.json` (01-02; el lab muestra el español y el inglés mantiene la paridad de claves, que tsc y `src/lib/messages.test.ts` comprueban a través de `src/lib/messages.ts`). El namespace Hero (línea de estado, etiqueta del CTA, índice de la variante C) se crea igual, en los dos archivos (01-04). Todo se lee con `src/lib/messages.ts`, sin next-intl en esta fase. En la fase 2, next-intl lee los mismos archivos con las claves de Hero sin cambios, `hero-copy.ts` y `src/lib/messages.ts` dan paso a `getTranslations`, y el namespace Lab se borra junto con `/lab`.
Quién: Claude Code (autónomo, dentro de los límites). Aplica una regla de CLAUDE.md en los dos archivos; no hay desviación que aprobar.
Por qué: mover los textos después habría sido trabajo doble y una excepción a la regla.
Verificación: los textos están en `messages/en.json` y `messages/es.json` con las mismas claves y no en `src/components/site/hero-copy.ts` ni en `src/app/lab` (comprobaciones de aceptación de 01-02, 01-04 y 01-06).

## 2026-10-30 · Fuentes estáticas del PDF (D-19)
Contexto: el research (Pattern 8) no encontró carpeta static/ en el repositorio google/fonts de GitHub para ninguna de las tres familias, y proponía la API CSS2 de Google Fonts como fuente.
Decisión: D-19 se aplicó tal como quedó fijada. Los seis TTF de `assets/fonts-pdf/` (Funnel Display SemiBold y Bold, Hanken Grotesk Regular, Bold e Italic, Geist Mono Regular) salen de la carpeta static/ de la descarga oficial de cada familia en Google Fonts (manifiesto `fonts.google.com/download/list`), que existe para las tres, Funnel Display incluida. No hizo falta instanciar nada con `fonttools varLib.instancer`. Las licencias OFL viajan junto a las fuentes.
Quién: Teo (D-19); Claude Code ejecuta (01-03).
Por qué: react-pdf no acepta fuentes variables ni WOFF2, y los static/ oficiales no necesitan procesado.
Verificación: `python3 -I scripts/verify-pdf-fonts.py assets/fonts-pdf/*.ttf` (sin fvar, peso correcto, ángulo de la itálica, glifos á é í ó ú ü ñ ¿ ¡).

## 2026-10-30 · Utilidad --color-signal para el acento
Contexto: shadcn usa `--accent` como superficie neutra de hover, mientras en DESIGN.md `--accent` es la terracota. Con un alias directo, cada hover de shadcn habría pintado el acento, que DESIGN.md limita a un elemento por vista.
Decisión: `--color-accent` de shadcn se queda neutro y la terracota solo llega a los componentes como `--color-signal` (`bg-signal`, `text-signal`) y en `--ring`.
Quién: Claude Code (autónomo, dentro de los límites). Origen: UI-SPEC.
Por qué: protege la regla del acento único sin tocar la paleta.
Verificación: `src/app/globals.css` (`--color-signal: var(--accent)`) y la página `/lab/tokens`.

## 2026-10-30 · Biome excluye .claude, .agents y .planning
Contexto: `pnpm lint` revisaba el código vendorizado de las skills (`.claude`, `.agents`), los documentos de planificación (`.planning`) y la caché local del hook de impeccable (`.impeccable`, ignorada solo con `.git/info/exclude`, que Biome no lee).
Decisión: `biome.json` excluye `.claude`, `.agents`, `.planning` y `.impeccable`. Esos archivos no se editan para contentar al linter. `src` sigue revisado entero.
Quién: Claude Code (autónomo, dentro de los límites).
Por qué: es código ajeno o documentación, no código del sitio.
Verificación: `biome.json` (`files.includes`) y `pnpm lint` en verde dentro de `pnpm check`.

## 2026-10-30 · Política de material/ (D-15, reconfirmada por Teo)
Contexto: `.gitignore` ignora `material/` entero, y el research (pregunta abierta 1) ofrecía tres opciones: dejarlo solo en local, commitear solo los WebP o commitear todo.
Decisión: D-15 se mantiene. Después de la revisión de datos personales de Teo en G7, se commitean al repositorio los WebP revisados (al menos 3 por proyecto, 1600x1000) y los `README.md` de cada carpeta. Los PNG originales y los logos siguen ignorados. Una captura de la lista "Posibles datos personales" de 01-10 solo se commitea si la respuesta de Teo en G7 libera ese archivo por su nombre. Una captura de un proyecto cuyo `clientPermission` no es `true` solo se commitea si la respuesta de Teo en G7 libera ese archivo por su nombre con "liberar:" ("revisadas: todas" no lo cubre); así, ese proyecto llega al mínimo de 3 solo con capturas liberadas una a una, y con menos la fase sigue abierta (decidió Teo el 2026-10-30). La regla de ignorar se queda y cada archivo revisado se añade explícitamente.
Quién: decidió Teo (D-15 en la discusión; reconfirmado el 2026-10-30, incluida la liberación archivo por archivo para proyectos sin permiso del cliente). Claude Code ejecuta.
Por qué: el repo es público, así que publicar es irreversible e IDEN-06 tiene que cumplirse en el repositorio, no solo en el disco de Teo.
Verificación: las compuertas pii-cleared, permission-cleared y material-committed de `scripts/check-phase-1.sh` (01-12) con `--final` en 01-13.
