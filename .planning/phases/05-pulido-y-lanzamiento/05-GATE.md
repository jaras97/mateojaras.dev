# 05-GATE: cierre de la fase 5 (parcial, 2026-11-26)

Estado: NO cerrada. Hay pasos de Teo pendientes (abajo).

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
- pendiente de Teo (entrar texto aprobado en el admin): K-11, K-12 (texto), K-17 (texto), K-26

## Pendiente de Teo

1. Entrar en https://mateojaras.dev/admin los textos aprobados C-1, C-2, C-3 y C-4 (ver 05-FIXES.md `## Contenido propuesto`). Después Claude los verifica en la página pública en en y es.
2. Pulsar "Generar CV" en el admin, en inglés y en español, para que el PDF de producción salga sin las letras perdidas (K-06). Después Claude lo comprueba con `scripts/check-cv-pdf.ts`.
3. Search Console: enviar `https://mateojaras.dev/sitemap.xml` y pedir indexación de `https://mateojaras.dev/` y `https://mateojaras.dev/es` (D-12).
4. Vercel Analytics: confirmar si el panel muestra visitas de mateojaras.dev (QUAL-07).

## No cumplido todavía

La línea del gate "Revisión por 3 perfiles hecha y resuelta + sitio en producción" no se marca hasta cerrar los puntos 1 a 4. REQUIREMENTS.md no se ha modificado: QUAL-07 espera la respuesta de analytics y QUAL-08 espera las filas `pendiente de Teo`.
