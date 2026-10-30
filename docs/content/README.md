# docs/content: un archivo por proyecto

Cada proyecto del portafolio vive en `docs/content/<slug>.md`: front-matter YAML con los campos estructurados y, debajo, los textos largos en español e inglés por secciones (D-08). Los nombres de campo son los de `docs/data-model.md` (camelCase), así el seed de la fase 2 lee estos archivos sin traducir nombres.

El contrato ejecutable es `src/features/projects/content-schema.ts`. Este README lo describe; si los dos no coinciden, manda el código.

Validación: `pnpm content:check`. Pasa cuando cada archivo cumple el contrato y la paridad de cifras. `CONTENT_MIN_FILES=4 pnpm content:check` además exige al menos 4 archivos.

## Reglas de origen

- El contenido sale de la entrevista con Teo (D-06). Claude pregunta, Teo responde en español y Claude solo corrige gramática y naturalidad. Nada se redacta a partir de los sitios en vivo.
- El inglés es la traducción fiel de Claude y queda en `enStatus: draft-translation` hasta que Teo la apruebe en G7 (D-07). Entonces pasa a `approved`.
- `source` guarda la fecha de la entrevista (`interview-YYYY-MM-DD`): es la procedencia del archivo.
- Si Teo todavía no respondió algo, el campo se omite y su nombre va en `pendingFields`. Nunca se rellena con texto supuesto.
- Una métrica sin fuente verificable no entra (D-10): ese resultado se cuenta como texto cualitativo en `resultsEs` / `resultsEn`.
- Los números se escriben con dígitos en los dos idiomas. La paridad de cifras compara las secuencias de dígitos del español y del inglés y falla si una traducción añade o cambia una cifra o una fecha. `2,5` y `2.5` cuentan igual.
- Nunca se usa la raya larga (U+2014) en el texto.

## Front-matter

```yaml
---
slug: nombre-del-proyecto
enStatus: draft-translation
source: interview-2026-10-30
pendingFields: []
clientPermission: true
sampleData: false
titleEs: "..."
titleEn: "..."
taglineEs: "..."
taglineEn: "..."
liveUrl: "https://..."
repoUrl: null
startedAt: "2025-03-01"
finishedAt: null
stack: [Next.js, Tailwind CSS]
metrics:
  - labelEs: "..."
    labelEn: "..."
    value: "..."
    sourceEs: "..."
    sourceEn: "..."
resultsEs: ["..."]
resultsEn: ["..."]
techDecisionsEs:
  decisions:
    - { title: "...", body: "..." }
    - { title: "...", body: "..." }
  tradeoffs: "..."
  validation: "..."
  aiTools: ["..."]
techDecisionsEn:
  decisions:
    - { title: "...", body: "..." }
    - { title: "...", body: "..." }
altStatus: draft
coverImage: material/nombre-del-proyecto/01-home.webp
media:
  - file: material/nombre-del-proyecto/01-home.webp
    altEs: "..."
    altEn: "..."
    type: image
---
```

| Campo | Tipo | Regla |
|---|---|---|
| `slug` | kebab-case | Igual al nombre del archivo. Se fija en G4 y no se renombra nunca después, porque las rutas de `material/` y las liberaciones de Teo lo nombran. No puede ir en `pendingFields`. |
| `enStatus` | `draft-translation` \| `approved` | `draft-translation` hasta que Teo apruebe el inglés en G7 (D-07). |
| `altStatus` | `draft` \| `approved` | Obligatorio en cuanto `media` tiene entradas. `draft` hasta que Teo apruebe los textos alternativos. |
| `source` | `interview-YYYY-MM-DD` | Fecha de la entrevista (D-06). |
| `pendingFields` | lista de nombres de campo | Lo que Teo no ha respondido. Vacía u omitida cuando el archivo está completo. Solo admite nombres de campo del contrato. |
| `clientPermission` | booleano, sin valor por defecto | `true` para ManuJ y EcoExport (D-12). Para el inventario y la app de finanzas, exactamente el sí o no que Teo diga en G4. Sin respuesta, se omite y va en `pendingFields`; nunca se deduce. |
| `sampleData` | booleano | `true` para el inventario y la app de finanzas (capturas con datos de ejemplo, D-14). |
| `titleEs`, `titleEn`, `taglineEs`, `taglineEn` | texto | Nombre y frase de Teo; el inglés es la traducción. |
| `liveUrl`, `repoUrl` | URL `https://` o `null` | `null` si no hay sitio o el repo no es público. |
| `startedAt`, `finishedAt` | `"YYYY-MM-DD"` entre comillas o `null` | `null` si no se sabe o el proyecto sigue abierto. |
| `stack` | lista de texto, mínimo 1 | Nombres que en la fase 2 se enlazan con `skills`. |
| `metrics` | lista de 0 a 3 | Siempre presente (`[]` si no hay cifras con fuente). Ver "Métricas". |
| `resultsEs`, `resultsEn` | lista de texto, mínimo 1 | Resultados cualitativos y los que no tienen fuente. |
| `techDecisionsEs`, `techDecisionsEn` | objeto `TechDecisions` | `decisions` con 2 o 3 entradas `{ title, body }`; `tradeoffs`, `validation` y `aiTools` opcionales. |
| `coverImage` | ruta bajo `material/` o `null` | Una de las rutas de `media`. `null` con `coverImage` en `pendingFields` si Teo no eligió portada. Se omite antes de las capturas. |
| `media` | lista `{ file, altEs, altEn, type: image }` | La llena 01-10. `file` es `material/<slug>/NN-vista.webp`. Los textos alternativos solo describen lo que se ve. |

Fechas, valores de métricas y URLs van siempre como texto entre comillas (`"2025-03-01"`, `"98"`), para que YAML no los convierta en otro tipo.

## Métricas

Cada métrica lleva la etiqueta y la fuente en los dos idiomas, como decidió Teo el 2026-10-30:

```yaml
metrics:
  - labelEs: "..."     # palabras de Teo
    labelEn: "..."     # traducción fiel de Claude, mismas cifras
    value: "..."       # compartido por los dos idiomas, siempre entre comillas
    sourceEs: "..."    # de dónde sale la cifra y cuándo (analytics, PageSpeed con fecha, el cliente)
    sourceEn: "..."    # traducción fiel, mismas cifras y fechas
```

- Los cinco campos son obligatorios y no pueden estar vacíos. Una métrica sin fuente en cualquiera de los dos idiomas hace fallar el contrato, y `pendingFields` no lo silencia.
- No se aceptan otras claves: la forma de un solo idioma `{ label, value, source }` falla.
- `labelEn` y `sourceEn` son borrador (`enStatus: draft-translation`) hasta G7.
- La fuente se guarda aparte de la etiqueta. La base de datos mantiene `metrics: { label, value }[]` (D-11) y la fase 2 decide cómo llegan a ella la etiqueta y la fuente de cada idioma. `docs/data-model.md` no cambia.

## Secciones del cuerpo

Debajo del front-matter, cada sección empieza con un encabezado `##` que es exactamente el nombre del campo, en su propia línea:

```markdown
## problemEs
...
## problemEn
...
## roleEs
...
## roleEn
...
## solutionEs
...
## solutionEn
...
## caseStudyEs
...
## caseStudyEn
...
```

- Obligatorias: `problemEs`, `problemEn`, `roleEs`, `roleEn`, `solutionEs`, `solutionEn`. Opcionales: `caseStudyEs`, `caseStudyEn`.
- No puede haber texto antes de la primera sección ni una sección repetida.
- Markdown permitido: párrafos, subtítulos `###`, listas, negrita, cursiva y enlaces. Es el subconjunto de Tiptap StarterKit que el seed de la fase 2 convierte sin pérdidas.

## Paridad de cifras

`checkNumberParity` compara las secuencias de dígitos del texto en español con las del inglés en: `title`, `tagline`, `results`, `techDecisions`, las secciones del cuerpo, y en cada métrica `label` y `source` y en cada captura `alt`. `value` es compartido y no se compara. Si una cifra aparece en un idioma y no en el otro, el archivo falla.

## De la fase 1 a la base de datos (D-08)

| docs/content | docs/data-model.md |
|---|---|
| `media[].file` (ruta bajo `material/`) | `media[].url`: en la subida a Blob de la fase 3, cada `media[].file` se convierte en la URL de Blob de esa captura. `altEs`, `altEn` y `type` conservan su nombre. |
| `coverImage` (ruta bajo `material/`) | `cover_image`: la URL de Blob de la misma captura. |
| `metrics[]` bilingüe | `metrics: { label, value }[]`, según decida la fase 2 (D-11). |
| Secciones `## caseStudyEs` / `## caseStudyEn` en Markdown | `case_study_es` / `case_study_en` en JSON de Tiptap. |
| `enStatus`, `altStatus`, `source`, `pendingFields`, `clientPermission`, `sampleData` | Metadatos de procedencia y publicación; el seed decide qué se guarda. |

## Guion de entrevista por proyecto

Claude pregunta, Teo responde en español, y Claude solo corrige gramática y naturalidad (D-06). Lo que quede sin respuesta va a `pendingFields`.

0. Slug propuesto: ¿aceptas `<slug>` o prefieres otro? (Se fija aquí y no cambia después.)
1. ¿Nombre del proyecto y una frase (tagline) que diga qué es y para quién?
2. Problema: ¿qué tenía el cliente antes y qué le dolía? (2 o 3 frases)
3. Rol: ¿qué hiciste tú exactamente y qué hicieron otros, si los hubo?
4. Solución: ¿qué construiste? (módulos, flujos, integraciones)
5. Resultados: 2 o 3. Para cada cifra: valor, fuente (analytics, PageSpeed o Lighthouse con fecha, el cliente) y fecha. Sin fuente, lo cuentas en texto cualitativo (D-10).
6. Decisiones técnicas (2 o 3): qué decidiste, por qué, qué descartaste (tradeoffs), cómo lo verificaste y, si usaste IA, cuál y para qué.
7. URLs: sitio en vivo y repositorio (¿es público?).
8. Fechas de inicio y fin (mes y año bastan) y stack.
9. Permiso del cliente para mostrar capturas y cifras: ¿sí o no? (Se pregunta en cada proyecto; ManuJ y EcoExport ya respondieron sí, D-12.)
10. Vistas a capturar (3 o más) y si alguna muestra datos personales de clientes reales.

Cierre: ¿qué vista es la portada?
