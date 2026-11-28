# Phase 1: Identidad y contenido - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-30
**Phase:** 01-identidad-y-contenido
**Areas discussed:** Variantes del hero, Flujo del contenido, Capturas en material/, Fuentes y tema

---

## Variantes del hero

| Option | Description | Selected |
|--------|-------------|----------|
| 3 jerarquías distintas | A headline+status; B status primero; C índice editorial | ✓ |
| Misma jerarquía, distinto tono | Sobria / editorial / técnica | |
| Tú decides | Claude propone | |

| Option | Description | Selected |
|--------|-------------|----------|
| Ruta temporal /lab | /lab/hero y /lab/tokens, se borra tras elegir | ✓ |
| Reemplazar page.tsx | Selector ?v= en / | |
| Solo capturas | Sin ruta | |

| Option | Description | Selected |
|--------|-------------|----------|
| Tu headline real primero | Teo escribe headline antes de las variantes | ✓ |
| El ejemplo de copy.md | Elegir con texto de ejemplo | |

| Option | Description | Selected |
|--------|-------------|----------|
| Solo estático | Motion en fase 4 | ✓ |
| Con el reveal | Adelanta motion | |

| Option | Description | Selected |
|--------|-------------|----------|
| 390/768/1440 · claro y oscuro + critique | Igual que vistas públicas | ✓ |
| Solo en el navegador | Sin capturas | |

---

## Flujo del contenido

| Option | Description | Selected |
|--------|-------------|----------|
| Entrevista + tus respuestas | Claude pregunta, Teo responde, Claude solo corrige | ✓ |
| Plantilla que llenas tú | Campos vacíos | |
| Borrador mío desde los sitios | Contra la regla de copy | |

| Option | Description | Selected |
|--------|-------------|----------|
| Markdown con front-matter YAML | Estructurado + prosa; seed lo lee | ✓ |
| YAML puro | | |
| Markdown libre | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Copy en copy.md, proyectos en content/ | Sin duplicar; edita copy.md (aprobado) | ✓ |
| Todo en copy.md | | |

| Option | Description | Selected |
|--------|-------------|----------|
| No entra | Solo métricas con fuente | ✓ |
| Entra como estimación | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Respondo en ES, tú traduces y yo apruebo | EN marcado como traducción | ✓ |
| Escribo ambas | | |
| Respondo en EN, tú pasas a ES | | |

**Permisos ManuJ/EcoExport:** Sí, ambos.
**Repo finanzas:** Sí, público.
**About "contratista independiente":** Sí.

| Option | Description | Selected |
|--------|-------------|----------|
| Fuente en la etiqueta | Sin cambio de esquema | ✓ |
| Campo propio `source` | Cambia data-model.md | |

---

## Capturas en material/

| Option | Description | Selected |
|--------|-------------|----------|
| Playwright con script | Reproducible, 1440×900 | ✓ |
| Tú a mano | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Las corres en local con datos de ejemplo | Marcadas "datos de ejemplo" | ✓ |
| Ya tengo capturas | | |
| Mixto | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Originales PNG + WebP optimizado | 1600 px; revisión de datos personales | ✓ |
| Solo WebP | | |

---

## Fuentes y tema

| Option | Description | Selected |
|--------|-------------|----------|
| next/font/google | Build-time, servido desde el dominio; ajusta DESIGN.md §2 | ✓ |
| next/font/local (DESIGN.md) | WOFF2 en repo | |

| Option | Description | Selected |
|--------|-------------|----------|
| Clase `.dark` | shadcn; ajusta DESIGN.md §3 | ✓ |
| `[data-theme="dark"]` | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Tokens propios → alias shadcn | Una sola paleta | ✓ |
| Solo variables shadcn | | |
| Tú decides | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Descarga + instancer si falta | static/ oficiales + fonttools para Funnel Display | ✓ |
| Solo Hanken + Geist en el PDF | | |

---

## Claude's Discretion

- Estructura interna de componentes del hero y fixture; contenido de /lab/tokens; guion de la entrevista; herramienta PNG→WebP (sin dependencias nuevas sin preguntar).

## Deferred Ideas

Ninguna.
