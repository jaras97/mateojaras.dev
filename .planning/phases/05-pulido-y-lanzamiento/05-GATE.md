# 05-GATE: cierre de la fase 5 (cerrada, 2026-11-27)

Estado: cerrada. Analytics queda como tarea de Teo (abajo).

## Evidencia ya obtenida

- PR #3 (`phase-05-review-fixes`) fusionado por Teo, commit de merge 2860c16 (2026-11-27T03:16:45Z). Producción en Ready sobre ese commit.
- check-live sobre https://mateojaras.dev (`--only=domain,notfound,headers,analytics`):

```
PASS domain: www answers 308 to the apex
PASS notfound: GET /foo answers 404
PASS notfound: GET /es/foo answers 404
PASS notfound: GET /projects/no-existe-check-live answers 404
PASS notfound: GET /es/proyectos/no-existe-check-live answers 404
PASS headers: / sends an enforced CSP with the Blob connect-src
PASS headers: / has no Report-Only header
PASS headers: /es sends an enforced CSP with the Blob connect-src
PASS headers: /es has no Report-Only header
PASS analytics: analytics script answers 200 (/e45e9493d8fd6399/script.js)
PASS analytics: view beacon answers 200 (/e45e9493d8fd6399/view)
RESULT: all PASS
```

- `pnpm check` en verde sobre main (2860c16).
- CI en main verde: https://github.com/jaras97/mateojaras.dev/actions/runs/45933232762
- `e2e/review-fixes.spec.ts` contra producción: 6 de 6 (K-24 y K-29 en en y es; K-13 sin backticks literales en todos los casos y `<code>` presente en /projects/prendo; K-28 sin periodos "mes año – mismo mes año").
- `scripts/load-content.ts` no se ejecutó (D-18).

## Disposiciones de docs/reviews.md (31 filas)

- fixed: K-06, K-07, K-13, K-24, K-28 (y partes de K-12, K-22, K-29)
- dismissed: K-05, K-31 (y partes de K-17, K-22, K-29)
- backlog: K-01, K-02, K-03, K-04, K-08, K-09, K-10, K-14, K-15, K-16, K-18, K-19, K-20, K-21, K-23, K-25, K-27, K-30
- fixed en el admin el 2026-11-27: K-11, K-12 (texto), K-17 (texto), K-26 (ver 05-FIXES.md `## Contenido entrado en producción`)

## Hecho el 2026-11-27

1. C-1 ya estaba publicado. C-2, C-3 y C-4 los entró Claude Code en el admin con la autorización de Teo (excepción a D-18 en docs/decisions.md). Verificado en las páginas públicas en y es.
2. "Generar CV" → v6. `check-cv-pdf.ts` PASS en /cv/en.pdf y /cv/es.pdf con los textos nuevos y sin `vercel.app` (K-06 cerrado en producción).

3. Search Console: Teo verificó la propiedad de dominio, envió `https://mateojaras.dev/sitemap.xml` y pidió indexación de `/` y `/es` ("listo, hecho", 2026-11-27). El sitemap responde 200 `application/xml` con 9 `<loc>`, y robots.txt lo enlaza.

## Analytics (QUAL-07): tarea de Teo

4. Teo decidió no confirmar el panel de Vercel Analytics antes del cierre y lo deja como tarea suya ("dejemos el tema de analitycs como algo mio y dala por terminada", 2026-11-27). Lo que sí está probado es que el script y el beacon responden 200 en producción (check-live, arriba). QUAL-07 ("Analytics instalado") ya estaba cumplido; la verificación del panel queda en manos de Teo y no bloquea el cierre.

## Compuerta

- 3 revisiones por perfiles (agentes, re-alcance D-07) hechas, 31 de 31 filas del Consolidado con disposición (fixed, dismissed o backlog). La revisión humana queda pendiente (D-10).
- Sitio en producción en mateojaras.dev, check-live all PASS, CI en main verde, `pnpm check` en verde.
- Contenido C-1..C-4 publicado y verificado en en y es; CV v6 con check-cv-pdf PASS.
- Search Console: sitemap enviado e indexación pedida de `/` y `/es`.

RESULT: all PASS (QUAL-07 dashboard check deferred to Teo by his decision, 2026-11-27)
