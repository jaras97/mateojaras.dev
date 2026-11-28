# Phase 4: Sitio público - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-11-22
**Phase:** 4-Sitio público
**Areas discussed:** Caso de estudio, Rutas y navegación, Flujo de contacto, Composición de la home

---

## Caso de estudio

| Pregunta | Opciones | Elegida |
|---|---|---|
| Galería de 03 Solución | Apilada con pie · Apilada + ampliar (Dialog) · Grilla 2 columnas | Apilada con pie |
| Escena scrubbed | Número de sección · Ninguna · Portada (casi parallax) | Número de sección |
| Orden anterior/siguiente | Orden del admin · Orden del admin circular · Por fecha | Orden del admin (sin vuelta) |
| Métricas | Fila de datos · Lista en mono | Fila de datos |

## Rutas y navegación

| Pregunta | Opciones | Elegida |
|---|---|---|
| Aprobación de rutas | Sí, todas (incl. opengraph-image) · Sí, sin OG generada | Sí, todas |
| Now | Sección de /about · Ruta /now propia · Ambas | Sección de /about |
| Imagen OG | Generada con next/og · Portada del proyecto | Generada con next/og |
| Header | Nombre + 3 enlaces + toggles · Nombre + toggles | Nombre + 3 enlaces |

## Flujo de contacto

| Pregunta | Opciones | Elegida |
|---|---|---|
| Resend falla tras guardar | Éxito igual · Error + email visible | Éxito igual |
| Direcciones | contacto@ → Gmail · hola@ → Gmail · noreply@ → Gmail | contacto@ → Gmail |
| Límite por IP | 3/hora · 5/hora | 3/hora |
| Confirmación | En el lugar del form (aria-live) · Toast + form vacío | En el lugar del form |

## Composición de la home

| Pregunta | Opciones | Elegida |
|---|---|---|
| Columna email_sent_at + migración | Sí, añadir columna · No, solo log | Sí, añadir columna |
| Proyectos en la home | Todos los publicados · Solo featured | Todos los publicados |
| Bloques | Cierre de contacto · About corto + contacto · Solo hero + Work | Cierre de contacto |
| Escena scrubbed en home | Ninguna · Número de sección | Ninguna |

**Notas:** Teo eligió la opción recomendada en todas las preguntas.

## Claude's Discretion

Estructura de /about, footer, ThemeToggle/LangSwitch, ViewTransition de ruta, reloj y solapamiento, SEO por página, marca de CASE-05 y diseño visual detallado (va al UI-SPEC).

## Deferred Ideas

- Página índice /projects
- Lightbox de capturas (se podría reconsiderar en la fase 5)
