# Phase 3: Panel admin + CV - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-11-16
**Phase:** 3-Panel admin + CV
**Areas discussed:** Borradores sobre lo publicado, Qué va en el CV, Cierre de la fase con contenido real, Experiencia de edición, Aprobaciones

---

## Borradores sobre lo publicado

| Option | Description | Selected |
|--------|-------------|----------|
| Sigue la versión publicada | Cambios salen solo con Publicar; requiere columnas de borrador y migración | ✓ |
| Se retira del sitio | Sin cambio de esquema; deja un hueco en el sitio | |
| Lo publicado se guarda directo | Borrador solo para lo nunca publicado | |

| Option | Description | Selected |
|--------|-------------|----------|
| Todas las entidades | Como dice ADMN-05 | ✓ |
| Solo proyectos y SiteSettings | El resto se publica al guardar | |

| Option | Description | Selected |
|--------|-------------|----------|
| Botón Previsualizar, pestaña nueva | Ruta pública real con banda "Vista previa" | ✓ |
| Panel lado a lado | iframe dentro del admin | |

**User's choice:** las tres recomendadas.

---

## Qué va en el CV

| Pregunta | Opciones | Elegida |
|----------|----------|---------|
| Extensión | Hasta 2 páginas / 1 página exacta | Hasta 2 páginas |
| Proyectos | Solo featured / Todos los publicados / Sin proyectos | Solo featured |
| Resumen | Titular + bio de SiteSettings / Campo propio del CV | Titular + bio |
| Overrides | No en v1 / Sí, retoques de texto | No en v1 |

---

## Cierre de la fase con contenido real

| Pregunta | Opciones | Elegida |
|----------|----------|---------|
| Cierre | Último plan = sesión de carga de Teo / Cerrar con el admin funcionando | Sesión de carga |
| Inventario y Finanzas | Teo decide en la sesión / Fuera de v1 | Teo decide en la sesión |

---

## Experiencia de edición

| Pregunta | Opciones | Elegida |
|----------|----------|---------|
| Formulario de proyecto | Una página con secciones numeradas / Pestañas | Secciones numeradas |
| en/es | ES izquierda, EN derecha / EN izquierda, ES derecha | ES izquierda |
| Eliminar | Borrado definitivo con confirmación / Solo borradores | Borrado con confirmación |
| Bandeja | Leer, marcar leído/no leído, eliminar / Solo lectura | Leer, marcar, eliminar |

---

## Aprobaciones

| Pregunta | Opciones | Elegida |
|----------|----------|---------|
| Rutas + CV snapshot | Aprobar todo / Aprobar con cambios | Aprobar todo |
| Dependencias (extracción PDF + shadcn) | Ambas / Solo la del PDF | Ambas |

## Claude's Discretion

- Mecanismo de borradores, procesamiento de imágenes, datos de contacto y orden de secciones del CV, diseño visual (va a /gsd-ui-phase), validación del JSON Resume, etiquetas por action.

## Deferred Ideas

- Overrides del PDF (fuera de v1).
- Vista previa lado a lado (descartada).
