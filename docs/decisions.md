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

## 2026-10-30 · Headline del hero completado por encargo de Teo (G2)
Contexto: en G2 (01-04) Teo respondió el punto 1 con "Construyo ... termina el texto tu" y el punto 2 con "tradúcelo". La regla del proyecto es que el copy lo escribe Teo y Claude solo corrige gramática.
Decisión: Claude terminó la frase a partir del inicio de Teo y del ejemplo de `docs/copy.md`: "Construyo aplicaciones web con React y Next.js para empresas y equipos que necesitan un frontend sólido, desde la primera pantalla hasta el panel que las administra." La versión en inglés es traducción de Claude. Las dos quedan como borrador hasta que Teo las apruebe o las cambie en G7 (01-12): `heroFixtureMeta.headlineEsStatus` es `draft`, `headlineEnStatus` es `draft-translation` y `headlineAuthorship` dice que es una propuesta de Claude por encargo. Disponibilidad (open) y ubicación (Medellín, Colombia) son palabras de Teo.
Quién: decidió Teo (encargo explícito); Claude Code redactó.
Por qué: Teo prefirió delegar el texto y no quiere que se le vuelva a preguntar antes de G7.
Verificación: `.planning/phases/01-identidad-y-contenido/01-04-ANSWERS.md` y `src/features/site-settings/fixture.ts`.

## 2026-10-30 · G4 delegado a la edición en el admin
Contexto: en G4 (01-07) Teo respondió a la entrevista de los cuatro proyectos con "pero se supone que en el admin se pueden modificar toda esta info, rellena con info de prueba que luego desde admin actualizo todo". CLAUDE.md prohíbe proyectos inventados, lorem ipsum y métricas sin fuente, el repo es público y `docs/content/` alimenta el seed de la fase 2.
Decisión: los cuatro archivos de `docs/content/` se escriben solo con datos verificables: nombres de PROJECT.md, stack del `package.json` o `requirements.txt` de cada repo (ManuJ sin Cloudinary, que su repo no usa), elementos de solución ya escritos en PROJECT.md y docs/copy.md, URLs de sitio y repo de ManuJ y EcoExport, `clientPermission: true` de ManuJ y EcoExport (D-12) y `sampleData: true` de inventario y finanzas (D-14). Problema, rol, resultados, decisiones técnicas, fechas y taglines van a `pendingFields`, igual que el permiso y las URLs del inventario y de finanzas. `metrics` queda vacío en los cuatro. Los slugs propuestos quedan fijos por delegación. "Info de prueba" no se lee como permiso para inventar texto ni cifras. La parte narrativa de IDEN-05 sigue abierta: Teo la completa desde el admin (fase 3) o en G7.
Quién: decidió Teo (delegación explícita); el orquestador fijó cómo cumplirla sin inventar; Claude Code ejecuta (01-07).
Por qué: un texto inventado en un repo público y en el seed se publicaría como si fuera de Teo; un campo vacío y marcado no.
Verificación: `.planning/phases/01-identidad-y-contenido/01-07-ANSWERS.md`, `pendingFields` de cada archivo y `pnpm content:check`.

## 2026-10-30 · Capturas de 01-10 sin vistas elegidas por Teo
Contexto: D-13 dice que Teo elige las vistas a capturar, pero en G4 (01-07) delegó todo el contenido a la edición en el admin ("rellena con info de prueba que luego desde admin actualizo todo") y no dio vistas ni portada. Teo también pidió que solo se le pregunte lo muy relevante.
Decisión: para ManuJ y EcoExport (permiso del cliente sí, D-12), Claude eligió vistas públicas representativas y las capturó con `scripts/capture-material.ts`: ManuJ `01-inicio`, `02-galeria`, `03-reservar`; EcoExport `01-inicio`, `02-nosotros`, `03-productos`, `04-inicio-en`. La portada provisional es `01-inicio` en los dos. Como nada de eso lo eligió Teo, `media` y `coverImage` siguen en `pendingFields`, los textos alternativos quedan en `altStatus: draft` y las capturas con caras o el teléfono del negocio están en "Posibles datos personales" de 01-10-SUMMARY.md. No se oculta el botón flotante de WhatsApp porque Teo no lo pidió. El inventario y la app de finanzas no se capturaron: su permiso es desconocido y solo Teo sabe levantarlas en local con datos de ejemplo (D-14), así que `media` y `coverImage` quedan en `pendingFields` y su paso G5 sigue abierto.
Quién: el orquestador fijó cómo cumplir la delegación de Teo sin interrumpirlo; Claude Code eligió las vistas y capturó (01-10). Teo confirma, cambia o quita cada captura en G7 (01-12), y ninguna se publica sin su revisión (D-15).
Por qué: capturar las páginas públicas no inventa contenido y deja material listo para revisar; elegir por Teo la portada o publicar sin su revisión sí sería decidir por él.
Verificación: `node scripts/capture-material.ts <slug>`, `pendingFields` de los cuatro archivos de `docs/content/` y `CONTENT_MIN_FILES=4 pnpm content:check`.

## 2026-10-30 · Variante del hero elegida
Contexto: 01-08 y 01-09 presentaron las variantes A, B y C del hero en `/lab/hero` con capturas, auditoría y crítica neutral (01-LAB-REVIEW.md). La recomendación del orquestador llegó aparte porque Teo la pidió.
Decisión: variante A. Respuesta de Teo, literal: "variante: a". No dio un motivo aparte.
Quién: Teo.
Por qué: es su elección en G3; la regla de lectura de la Task 3 de 01-09 encuentra una sola letra en su bloque.
Verificación: `.planning/phases/01-identidad-y-contenido/01-09-ANSWERS.md`, `.planning/phases/01-identidad-y-contenido/01-LAB-REVIEW.md` y las capturas de 01-08.

## 2026-10-30 · Respuestas P1, P2, P3 y P5 de UI-SPEC
Contexto: el UI-SPEC ("Preguntas abiertas para Teo") dejó cinco preguntas para G3. Respuesta de Teo, literal: "P1 mantener · P2 apruebo las cadenas, CTA se queda, headline: la versión corta · P5 corregir".
Decisión: P1 mantener: el acento claro sigue en `oklch(0.66 0.17 40)` y solo pinta el punto de estado y el foco; DESIGN.md, `globals.css` y la tabla de `/lab/tokens` no cambian. P2: aprueba las cadenas ES de la línea de estado y de los estados open/closed (ya están en `messages/es.json`, sin cambios); el CTA se queda "Let’s talk" / "Hablemos"; el headline pasa a la versión corta que vio en G3, propuesta por Claude y elegida por Teo: "Construyo frontends sólidos con React y Next.js, de la primera pantalla al panel de gestión." (ES) y "I build solid frontends with React and Next.js, from the first screen to the admin panel behind it." (EN, traducción de Claude elegida con ella), en `fixture.ts` y en `docs/copy.md`. `heroCopyMeta.status` y `headlineEsStatus` siguen en borrador y `headlineEnStatus` en `draft-translation`: el conjunto en y es se aprueba en G7 (01-12). P3: sin respuesta; no aplica porque solo existía para la fecha de la variante B. P5 corregir: el ejemplo de DESIGN.md §4 pasa a "01 Work", sin raya larga.
Quién: Teo. El texto del headline corto lo redactó Claude; la elección es de Teo.
Por qué: aplica sus respuestas solo donde viven y deja la aprobación final en G7.
Verificación: `.planning/phases/01-identidad-y-contenido/01-09-ANSWERS.md` (notas de lectura), `src/features/site-settings/fixture.ts` (`headlineAuthorship`), `docs/copy.md` y DESIGN.md §4.

## 2026-10-30 · /lab y variantes no elegidas se borran al empezar la fase 2
Contexto: D-02 permite borrar `/lab` y las variantes B y C al cerrar la fase 1 o al empezar la fase 2. El criterio de éxito 1 necesita `/lab/tokens` renderizado cuando se verifique la fase 1, y la fase 2 reemplaza el layout raíz de todos modos (RESEARCH, Pitfall 10).
Decisión: `/lab`, el namespace Lab de `messages/`, `hero-b.tsx`, `hero-c.tsx` y lo que solo usan ellas se borran en la primera tarea de la fase 2. La variante A se queda.
Quién: Claude Code (autónomo, dentro de los límites de D-02).
Por qué: borrar antes rompería la verificación de la fase 1; borrar después mantendría código muerto en la fase 2.
Verificación: la verificación de la fase 1 con `/lab/tokens` en pie; la primera tarea de la fase 2 lo borra.

## 2026-10-30 · Hallazgos de la revisión del lab
Contexto: 01-LAB-REVIEW.md reportó hallazgos sin corregir nada. Respuesta de Teo, literal: "hallazgos: tabla de contraste enfocable; el resto a la fase 4".
Decisión: se corrige ahora el contenedor con scroll de la tabla de contraste de `/lab/tokens` (axe `scrollable-region-focusable`, serious a 390 px): es una `<section>` con `tabIndex={0}` y `aria-label` (una `<section>` con nombre tiene rol `region`; Biome pide el elemento nativo en lugar de `role="region"`). El nombre reutiliza la leyenda "Contraste medido" de `messages/`. Todos los demás hallazgos de 01-LAB-REVIEW.md (auditoría de `/lab/tokens` y críticas de la variante A incluidos) quedan para la fase 4.
Quién: Teo.
Por qué: es el único hallazgo serious de axe; el resto es pulido.
Verificación: `src/app/lab/_components/specimens.tsx` (`ContrastTable`) y axe a 390 px sobre `/lab/tokens`.

## 2026-11-01 · Copy del sitio y concepto de DESIGN.md: propuestas de Claude aceptadas por Teo (G6)
Contexto: en G6 (01-11) el plan pedía que Teo escribiera About, Now, Experiencia, Contacto, Footer y las dos frases del concepto, y que Claude no propusiera redacción. Teo pidió recomendaciones en lugar de escribirlas. El orquestador le mostró una propuesta de Claude por bloque, numerada de 1 a 6, con la Experiencia de Sofka sin texto.
Decisión: respuesta de Teo, literal: "1 ok · 2 ok · 3 freelance ok, el inventario sí fue freelance; Sofka pendiente · 4 ok · 5 ok · 6 ok". Cada bloque es una propuesta de Claude, aceptada por Teo: About (1, incluye "contratista independiente", D-12), Now (2), los tres bullets freelance de ManuJ, EcoExport e inventario (3; Teo confirmó que el inventario fue un trabajo freelance), la intro de Contacto (4), el Footer sin cambios (5) y las dos frases del concepto de DESIGN.md §1 (6). Los bullets de Sofka quedan pendientes: Teo los escribe desde el admin, y en `docs/copy.md` hay una línea "Pendiente" en su lugar, sin texto inventado. El inglés de todos los bloques es traducción de Claude y lleva `<!-- enStatus: draft-translation -->`. Todo el conjunto, en y es, se aprueba en G7 (01-12). El estado de DESIGN.md sigue en PROPUESTA hasta 01-13.
Quién: decidió Teo (pidió propuestas y aceptó cada una); Claude Code redactó las propuestas y la traducción.
Por qué: Teo prefirió elegir entre propuestas a escribir desde cero. La regla de IDEN-01 de que Claude no propone redacción se sustituye por esta elección explícita de Teo, que queda registrada en lugar de presentarse como texto suyo.
Verificación: `.planning/phases/01-identidad-y-contenido/01-11-ANSWERS.md` (respuesta literal y contexto mostrado), los comentarios de autoría de `docs/copy.md` y de DESIGN.md §1.

## 2026-11-01 · G7: DESIGN.md aprobado y el contenido aplazado al admin
Contexto: G7 (01-12) pedía a Teo una línea de opción, su revisión de las capturas, una línea liberar o quitar por captura marcada y las respuestas a los campos pendientes, con un bloque listo para pegar. Respuesta de Teo, literal: "todo eso lo subo desde admin". El orquestador le preguntó solo lo que el admin no cubre, "¿Apruebas DESIGN.md como está (variante A, concepto, paleta y tipografía)? Responde sí o no.", y Teo respondió, literal: "si".
Decisión: DESIGN.md pasa a "Estado: APROBADO el 2026-11-01" con la variante A. Todo lo demás queda aplazado al admin por Teo: las siete capturas (ninguna se libera ni se commitea en material/; las dos de ManuJ con caras quedan fuera), portadas, textos alternativos, el contenido narrativo de los cuatro proyectos, los bullets de Sofka, las traducciones al inglés del copy y del hero (siguen en draft-translation), el permiso del cliente de inventario y finanzas y los datos abiertos. Teo no escribió una línea "opción:" ni líneas "aplazar:", así que el script lee la opción como pendiente y no convierte su aplazamiento en DEFER: bajo `--final` esos gates siguen en FAIL y nunca cuentan como PASS. No se escribió ninguna línea en su nombre ni se cambió la regla de lectura para que encaje con su frase.
Quién: decidió Teo (aprobó DESIGN.md y aplazó el resto); el orquestador hizo la pregunta de sí o no; Claude Code cambia el estado de DESIGN.md y registra.
Por qué: la aprobación de DESIGN.md es una respuesta explícita de Teo a una pregunta cerrada. El resto lo va a editar él en el admin (fase 3), y marcarlo aprobado o publicar capturas sin sus palabras sería decidir por él en un repo público.
Verificación: `.planning/phases/01-identidad-y-contenido/01-12-ANSWERS.md`, el gate `design-approved` de `bash scripts/check-phase-1.sh --final` (PASS) y los gates de contenido y publicación del mismo modo (FAIL, pendientes de Teo).

## 2026-11-01 · IDEN-05, IDEN-06 e IDEN-07 pasan de la fase 1 a la fase 3
Contexto: en G7 Teo aplazó al admin todo el contenido ("todo eso lo subo desde admin") y aprobó solo DESIGN.md ("si"). El plan 01-13 publicaba capturas y marcaba como aprobados textos que Teo no aprobó, así que no podía ejecutarse, y `check-phase-1.sh --final` queda en 14 PASS y 10 FAIL, todos por contenido aplazado.
Decisión: la fase 1 cierra con IDEN-01 a IDEN-04. IDEN-05 (contenido de los 4 proyectos), IDEN-06 (capturas revisadas) e IDEN-07 (copy final en/es, incluidos los bullets de Sofka) pasan a la fase 3 como criterio de éxito 6: Teo los carga y aprueba desde el admin. El plan 01-13 se omite. Nada de `material/` se commitea y las dos capturas de ManuJ con caras siguen fuera.
Quién: Teo eligió la opción 1 ("mover a la fase 3"); Claude la propuso.
Por qué: el admin es donde Teo va a escribir ese contenido; mantenerlo en la fase 1 la dejaría abierta y bloquearía la fase 2 sin que haya nada que hacer en el repo.

## 2026-11-15 · Aprobaciones de arranque de la fase 2
Contexto: CLAUDE.md exige aprobación de Teo para dependencias, docs/data-model.md y CLAUDE.md. D-01..D-04 de 02-CONTEXT ya estaban aprobadas; faltaban los puntos A..F. Respuesta literal de Teo: "A sí, B memoria, C sí, D b, E sí, F no".
Decisión: A) next 16.4.3 a 16.4.6 y better-auth 1.7.14 a 1.7.25; el CLI de Better Auth es `pnpm dlx auth@1.7.25 generate`. B) rate limit del login en memoria (límite por defecto de Better Auth) hasta Upstash en la fase 4; sin tabla `rateLimit`. C) `site_settings.languages` jsonb `{ code, level }[]` con level native|A1..C2, en la primera migración. D) métricas en dos columnas `metrics_en` y `metrics_es` con `{ label, value }[]` y la fuente unida a la etiqueta. E) sembrar bio y bullets freelance de docs/copy.md. F) el proyecto de Vercel aún no existe. Se instalaron además react/react-dom 19.3.1, @tiptap/pm y @tiptap/static-renderer (3.32.0 exacto, igual que el resto de @tiptap), @dnd-kit/utilities, server-only, tsx, @types/node ^24, @testing-library/dom y user-event; Biome sigue en 2.4.2 (D-04).
Quién: decidió Teo (respuesta literal en `.planning/phases/02-base-t-cnica/02-01-ANSWERS.md`); Claude Code aplicó.
Por qué: los parches cubren avisos que afectan a cacheComponents con root params y a sesiones revocadas; C y D fijan columnas de una migración de un solo sentido.
Verificación: 02-01-ANSWERS.md, `pnpm check` en verde, edición mínima de docs/data-model.md.

## 2026-11-15 · Admin en español con locale explícito
Contexto: el admin vive fuera de `[locale]` (D-08).
Decisión: la interfaz del admin se muestra en español con `locale: 'es'` explícito en next-intl; los textos siguen en messages/es.json.
Quién: Claude Code decidió; Teo lo aceptó en 02-CONTEXT.
Por qué: Teo es el único usuario y trabaja en español; evita depender de root params fuera de `[locale]`.
Verificación: 02-CONTEXT D-08; se comprueba en el plan del admin.

## 2026-11-15 · /lab borrado
Contexto: D-10 pedía borrar /lab y las variantes no elegidas al empezar la fase 2.
Decisión: se borraron `src/app/lab`, hero B y C, el namespace `Lab`, `scripts/capture-lab.ts` y `scripts/check-phase-1.sh`. El arnés de e2e pasa a `playwright.config.ts` y `e2e/axe.ts` (mismas etiquetas WCAG y conjunto serious/critical).
Quién: decidió Teo (D-10); Claude Code ejecutó.
Por qué: DESIGN.md está aprobado con la variante A; el resto es código muerto.
Verificación: `pnpm check` en verde tras el borrado.

## 2026-11-15 · Ruta /api/auth/[...all]
Contexto: AUTH-01 implica una ruta HTTP para Better Auth; es una ruta nueva.
Decisión: el login publica contra el router HTTP de Better Auth en `/api/auth/[...all]`, de modo que se aplican su rate limit y su comprobación de origen.
Quién: Claude Code, dentro de los límites (la ruta es necesaria para AUTH-01 y no añade superficie pública más allá del login).
Por qué: llamar a la API solo desde una Server Action saltaría el rate limit del router.
Verificación: e2e de login en el plan 02-06/02-07.

## 2026-11-15 · Textos sembrados
Contexto: `bio_en`/`bio_es` son obligatorias y docs/content no cubre todo.
Decisión: el seed incluye el About y los 3 bullets freelance de docs/copy.md aceptados en G6 (el inglés es traducción en borrador). Los bullets de Sofka quedan vacíos; skills no se siembran (docs/content no trae categoría); Sofka U no se siembra porque falta el nombre del programa. Teo los añade desde el admin en la fase 3.
Quién: decidió Teo (E: sí); Claude Code registra.
Por qué: evita inventar contenido, regla de CLAUDE.md.
Verificación: 02-01-ANSWERS.md y el seed del plan 02-02.

## 2026-11-15 · content/*.json se versiona
Contexto: `exportContent()` escribe un archivo por tabla de contenido y el repo es público.
Decisión: `content/*.json` se commitea. Solo salen las 9 tablas de la lista permitida (site_settings, skills, projects, experiences, education, resume_versions y las tres de unión); user, session, account, verification, rateLimit y contact_messages nunca se exportan.
Quién: Claude Code, dentro de los límites.
Por qué: es la copia de seguridad local mientras Vercel Blob no existe, y los proyectos ya son públicos en docs/content.
Verificación: test de la lista permitida en `src/lib/content-export.test.ts`; `pnpm export:content` tras `pnpm seed --from-content --force` no cambia un byte.

## 2026-11-15 · Fechas con precisión de mes en el seed
Contexto: las fuentes dan mes y año (ago 2021, ago 2025, sep 2025), pero `start_date` y `end_date` son `date`.
Decisión: el seed guarda el día 1 de cada mes (2021-08-01, 2025-08-01, 2025-09-01).
Quién: Claude Code; Teo puede corregirlas desde el admin en la fase 3.
Por qué: no hay día verificado y no se inventa uno.
Verificación: scripts/lib/seed-facts.ts cita la fuente de cada fecha.

## 2026-11-16 · Go/no-go del plan B (cacheComponents)
Contexto: chequeo del día 3 del ROADMAP (BASE-09) sobre `pnpm build && pnpm start`, rama `dev` sembrada, Next 16.4.6. Se ejecutó `bash scripts/go-no-go.sh`.
Decisión: GO. Se mantiene `cacheComponents: true`; no se aplica el plan B. Plan B no aplicado.
Quién: Teo (eligió la opción a tras el informe de Claude Code, que operaba bajo la pre-aprobación del plan B).
Por qué: señal 1 PASS (rutas prerenderizadas, 5 rutas de proyecto, sin errores de build); señal 2 PASS (lang en/es, títulos de Neon, Accept-Language ignorado); señal 3 PASS (/es/proyectos/<slug> 200, /projects/<slug> 200, /es/projects/<slug> redirige); señal 4 PASS con el criterio reajustado: UI de not-found + noindex + sin contenido de borradores, sin exigir el status HTTP; señal 5 PASS (AuthGate en Suspense, login, recarga y logout); señal 6 PASS (sin cadenas cruzadas tras 5 peticiones calientes); señal 7 omitida (verificado en la fase 3). El criterio original de la señal 4 (404 real) no es alcanzable con Cache Components: el shell se envía antes del `notFound()` de tiempo de petición (Next 16.4, loading.md "Status codes" y not-found.md), así que un slug desconocido o borrador responde 200 en servidor frío y 404 cuando la caché ya está caliente. Un intento con una consulta cacheada de slugs publicados y `notFound()` al inicio de la página no cambió el resultado. Coste aceptado: posibles reportes de soft 404 en Search Console para URLs con noindex que nadie enlaza. Si Search Console se queja, se puede revisar un 404 desde `proxy.ts` (con comprobación de slug), que la documentación señala como la vía para un status garantizado.
Verificación: salida de `bash scripts/go-no-go.sh` (señales 1 a 6 PASS, veredicto GO); e2e de public.spec.ts agnóstico al status (200 o 404), válido en servidor frío y caliente.

## 2026-11-16 · La rama Neon `dev` no existía
Contexto: CLAUDE.md daba por hecho que la base Neon tenía ramas `main` y `dev`, pero `dev` no existía.
Decisión: Teo creó la rama `dev` a partir de `main` el 2026-11-15; Preview y desarrollo local usan `dev`, solo Production usa `main`.
Quién: Teo.
Por qué: evitar que seeds, migraciones y e2e toquen los datos de producción.
Verificación: seed y e2e corren contra `dev`.

## 2026-11-16 · Entornos de Vercel y Neon configurados
Contexto: el plan 02-09 cierra la fase 2 en Vercel. El proyecto de Vercel no existía (02-01-ANSWERS, F: no).
Decisión: Preview usa la rama Neon `dev` y Production usa `main`. La integración de Neon inyecta solo en Production (Preview se desconectó porque recibía las mismas variables que Production) y no crea ramas por despliegue. En Preview, `DATABASE_URL` y `DATABASE_URL_UNPOOLED` de `dev` se pusieron a mano. `BETTER_AUTH_SECRET` es distinto en local, CI, Preview y Production. `BETTER_AUTH_URL` solo en Production (`https://mateojaras-dev.vercel.app`). `ADMIN_EMAIL` y `ADMIN_PASSWORD` no están en Vercel. `main` se migró (0000, 0001) y se sembró una sola vez a mano el 2026-11-16, sin `--force` (4 proyectos, 2 publicados; admin creado). `mateojaras.dev` no se asigna al proyecto todavía (D-07).
Quién: Teo hizo los paneles de Vercel y Neon y ejecutó los scripts que leen `.env.local` y las URLs de `main`; Claude Code enlazó el proyecto, generó y cargó los secretos aleatorios, y abrió el PR.
Por qué: que ningún build de Preview migre `main` (T-02-30) y que un secreto filtrado de un entorno no sirva en otro (T-02-36).
Verificación: `vercel env ls` muestra `DATABASE_URL*` en Production (integración) y en Preview (a mano, `dev`); la salida de migrate y seed en `main` mostró el host `ep-billowing-union-…`, distinto del de `dev` (`ep-floral-queen-…`); CI y el Preview del PR #1 en verde.

## 2026-11-16 · Aprobaciones de arranque de la fase 3
Contexto: el plan 03-01 reúne en una sola petición lo que CLAUDE.md obliga a preguntar (dependencias, modelo de datos, tokens, servicios). Las respuestas están en `.planning/phases/03-panel-admin-cv/03-01-ANSWERS.md`.
Decisión: Teo delegó todo en las opciones recomendadas ("haz todo lo que recomiendes y déjame lo que deba hacer yo a mano"): A verificado, B sí, C sí, D a, E sí, F sí, G sí, H luego, I producción.
Quién: Teo decidió delegar; Claude Code aplicó las opciones recomendadas.
Por qué: la fase 3 no puede empezar sin estas aprobaciones y Teo prefiere que solo se le pidan los pasos manuales.
Verificación: 03-01-ANSWERS.md, nueve líneas de Lectura.

## 2026-11-16 · Mecanismo del borrador (D-01)
Contexto: D-01 fijó borrador y publicación en un solo sentido; el mecanismo lo elegía el planificador.
Decisión: columna `draft` jsonb nula en projects, experiences, skills y education, más `status` y `draft` en site_settings (la fila actual queda `published`). Un elemento nunca publicado se edita en sus columnas; uno publicado guarda los cambios en `draft` y "Publicar" los copia. Migración 0002 en dev y luego en main (la escribe 03-03).
Quién: Claude Code propuso el mecanismo; Teo lo aprobó (B: sí).
Por qué: evita una tabla de revisiones y mantiene las consultas públicas leyendo solo columnas publicadas.
Verificación: migración 0002 y tests de 03-03.

## 2026-11-16 · Snapshot del CV en Blob (D-08)
Contexto: el CV se genera desde el admin y se guarda en Blob.
Decisión: ruta `resume/<locale>/v<n>-<sufijo aleatorio>.pdf` en vez de `v<n>.pdf` exacto; la URL pública sigue siendo /cv/en.pdf y /cv/es.pdf.
Quién: Claude Code propuso; Teo aprobó (F: sí).
Por qué: un reintento nunca choca con un blob existente y la CDN no sirve una versión vieja.
Verificación: se implementa en 03-11.

## 2026-11-16 · Rutas aprobadas del admin (D-13)
Contexto: CLAUDE.md pide preguntar antes de añadir rutas.
Decisión: se aprueban las rutas de D-13 de 03-CONTEXT.md (panel, ajustes, proyectos, experiencia, skills, educación, CV, mensajes y los endpoints de subida y de CV), sin rutas adicionales.
Quién: Teo (D-13, ya aprobado en CONTEXT); Claude Code las aplica.
Por qué: el alcance de la fase 3 está cerrado en CONTEXT.
Verificación: lista de rutas en 03-CONTEXT.md.

## 2026-11-16 · Paquetes de la fase 3 (D-16)
Contexto: el admin necesita toasts y el test de tildes del PDF necesita extraer texto.
Decisión: `sonner` 2.0.8 en dependencies y `unpdf` 2.1.0 en devDependencies, ambos con versión exacta. sonner se instaló a mano y `src/components/ui/sonner.tsx` se escribió a mano, porque `shadcn add sonner` arrastra next-themes, que está prohibido. unpdf 2.2.x tiene menos de 2 semanas y se descarta por ahora. Más 19 componentes oficiales de shadcn sin paquetes npm nuevos.
Quién: Teo delegó la verificación (A); Claude Code la hizo con metadatos de npm (repos emilkowalski/sonner y unjs/unpdf, sin postinstall, unpdf publicada hace 17 días) y aplicó las versiones.
Por qué: dependencias mínimas y verificadas contra paquetes con nombre parecido.
Verificación: `grep next-themes package.json pnpm-lock.yaml` no devuelve nada.

## 2026-11-16 · Campos estructurales en vivo (C)
Contexto: con borradores hay que decidir qué cambia el sitio en el acto.
Decisión: visible, orden y destacado se aplican al sitio sin pasar por borrador; el interruptor de visible es el que retira algo del sitio.
Quién: Teo (C: sí).
Por qué: retirar algo del sitio no debe esperar a una publicación.
Verificación: 03-04.

## 2026-11-16 · content/*.json fuera del repo público (D)
Contexto: con borradores, Inventario y Finanzas y cambios sin publicar acabarían en GitHub si content/ sigue versionado.
Decisión: opción (a): dejar de versionar content/ (se queda en disco; el respaldo en producción va a Blob con rutas no adivinables). Lo aplica 03-02.
Quién: Teo (D: a).
Por qué: privacidad de borradores; es reversible.
Verificación: 03-02 (.gitignore y git rm --cached).

## 2026-11-16 · Portada desde las imágenes subidas (E)
Contexto: la portada de un proyecto necesita alt en en/es.
Decisión: la portada se elige entre las imágenes subidas del proyecto.
Quién: Teo (E: sí).
Por qué: así toda portada tiene alt en ambos idiomas.
Verificación: 03-07.

## 2026-11-16 · Tokens del tema del admin (G)
Contexto: la UI-SPEC necesita dos tokens que DESIGN.md no define.
Decisión: `--destructive` oklch(0.53 0.19 27) en claro y oklch(0.70 0.17 25) en oscuro, solo para errores y el botón final de borrar; `--input` pasa a `color-mix(in oklch, var(--line), var(--ink-2) 60%)` para cumplir el contraste 3.2:1 de WCAG 1.4.11. El admin queda solo en claro y el CV en A4 en esta fase. DESIGN.md no se toca.
Quién: Teo aprobó (G: sí); Claude Code lo aplicó en globals.css.
Por qué: errores y bordes de campo legibles sin cambiar los siete tokens de la paleta.
Verificación: `grep -c -- '--destructive' src/app/globals.css`.

## 2026-11-16 · Token de Vercel Blob (H)
Contexto: D-17, la subida de imágenes y el CV necesitan BLOB_READ_WRITE_TOKEN.
Decisión: Teo crea el store (Public) más adelante y pega el token en `.env.local` y en Vercel. Mientras falte, subida y CV muestran un aviso; nada se simula.
Quién: Teo (H: luego).
Por qué: es un paso manual de su dashboard; el token nunca se versiona.
Verificación: la comprobación de la variable en los planes 03-07 y 03-11.

## 2026-11-16 · Entorno de la sesión de carga (D-09, I)
Contexto: el contenido real se carga al final de la fase.
Decisión: producción. Justo antes de la sesión se hace push a main, que despliega Production y aplica la migración 0002 en Neon main, y Teo carga el contenido en mateojaras-dev.vercel.app.
Quién: Teo (I: producción).
Por qué: el contenido tiene que quedar donde se sirve.
Verificación: 03-13.

## 2026-11-16 · Sesión antes de Zod en cada acción
Contexto: RESEARCH Pitfall 9.
Decisión: toda Server Action y loader del admin llama a `requireSession()` antes de parsear con Zod.
Quién: Claude Code.
Por qué: una petición sin sesión no debe recibir errores de validación que revelen la forma de los datos.
Verificación: tests de acciones en los planes de cada entidad.

## 2026-11-16 · `seed --force` solo inserta lo que falta
Contexto: con contenido real en la base, un seed no puede pisarlo.
Decisión: `seed --force` inserta solo filas ausentes y tiene una guarda contra producción (`--allow-production`). Se implementa en 03-02.
Quién: Claude Code.
Por qué: evitar perder contenido editado en el admin.
Verificación: tests de 03-02.
