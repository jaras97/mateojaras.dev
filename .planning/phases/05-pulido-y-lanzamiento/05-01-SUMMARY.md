---
phase: 05-pulido-y-lanzamiento
plan: 01
subsystem: infra
tags: [domain, dns, vercel, resend, upstash, verification]
requires: []
provides:
  - "scripts/check-live.ts (grupo domain)"
  - "mateojaras.dev como host canónico de Production"
affects: [05-02, 05-03, 05-07]
tech-stack:
  added: []
  patterns: ["checker de solo lectura con líneas PASS/FAIL/SKIP"]
key-files:
  created:
    - scripts/check-live.ts
    - .planning/phases/05-pulido-y-lanzamiento/05-LAUNCH-STEPS.md
    - .planning/phases/05-pulido-y-lanzamiento/05-DOMAIN-VERIFY.md
  modified:
    - scripts/check-cv-pdf.ts
    - .env.example
    - docs/decisions.md
key-decisions:
  - "Una sola base Upstash compartida por Production y Preview (decisión de Teo)"
requirements-completed: [QUAL-09]
duration: partial session
completed: 2026-11-26
---

# Phase 5 Plan 1: Dominio y cuentas Summary

mateojaras.dev sirve Production con canonical, hreflang, og:url, sitemap, robots y resume.json en el apex, y www responde 308; Resend y Upstash quedan pendientes en Vercel.

## Tasks

| Task | Commit |
|---|---|
| 1 Checker de dominio en vivo | 5a2f120 |
| 2 Pasos A-H y comentarios de .env.example | 895157e |
| 3 Redeploy y verificación del apex | 8d2d10d |

## Resultado

`check-live https://mateojaras.dev --only=domain` termina en `RESULT: all PASS` (13 líneas PASS, www 308). Detalle en 05-DOMAIN-VERIFY.md.

## Deviations from Plan

**1. [Rule 3 - Bloqueo] Variables de Production ausentes**
- **Encontrado en:** Task 3, primer redeploy (10 FAIL en el host).
- **Problema:** `NEXT_PUBLIC_SITE_URL` no existía en Production y `BETTER_AUTH_URL` no se había actualizado.
- **Arreglo:** se creó `NEXT_PUBLIC_SITE_URL=https://mateojaras.dev` (Production, no sensible) y se recreó `BETTER_AUTH_URL` con el mismo valor; segundo redeploy. Son valores no secretos que el paso F del plan ya fijaba.

**2. [Limitación] Boolean prod-db != preview-db no verificable**
`vercel env pull` no devuelve los valores de variables Sensitive, así que el criterio `prod-db != preview-db: true` no se cumple. Se registró como pendiente (confirmar en Neon).

**3. Contact-live no ejecutado:** faltan `RESEND_API_KEY` y `KV_REST_API_*` en Vercel pese a "listo A-H"; el código falla cerrado, como estaba previsto.

## Pendientes

Ver `## Pendientes` en 05-DOMAIN-VERIFY.md: Resend key y Upstash en Vercel (Production y Preview), contact-live, confirmación de ramas Neon, login admin en apex, regenerar CV en/es, Search Console y Analytics.

## Known Stubs

Ninguno.

## Self-Check: PASSED

Commits 5a2f120, 895157e, 8d2d10d existen; 05-DOMAIN-VERIFY.md y scratchpad sin archivos de entorno.
