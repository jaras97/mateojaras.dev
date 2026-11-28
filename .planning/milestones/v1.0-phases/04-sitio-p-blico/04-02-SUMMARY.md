---
phase: 04-sitio-p-blico
plan: 02
subsystem: planning
tags: [accounts, resend, upstash, cal-com, lighthouse, checkpoint]
requires: []
provides:
  - "04-02-ANSWERS.md with Lectura A..E and G for 04-06, 04-07, 04-11"
affects: [04-06, 04-07, 04-08, 04-11]
key-files:
  created:
    - .planning/phases/04-sitio-p-blico/04-02-ANSWERS.md
  modified:
    - docs/decisions.md
    - .planning/phases/04-sitio-p-blico/deferred-items.md
decisions:
  - "Resend, Upstash and Cal.com deferred (luego); code stays behind env checks"
  - "Lighthouse measured by Claude with pnpm dlx lighthouse and Vercel Protection Bypass (04-11 asks for the secret)"
  - "Language link aria-label starts with visible text, no em-dash (approved by Teo)"
metrics:
  completed: 2026-11-22
  tasks: 1
  files: 3
---

# Phase 4 Plan 02: Account and content requests Summary

Teo's single reply ("como segun recomiendes") accepted every default: keys deferred, ManuJ to be completed from the admin, Lighthouse run by Claude against the Preview.

## Readings (consumed by later plans)

- A, B, C: luego. Contact success path is not verifiable live in 04-07; messages save with "Email no enviado", the form fails closed without Upstash, the Cal link is hidden without a URL.
- D: sí. Teo completes ManuJ before day 10 and moves `e2e-stale-probe` to draft. 04-11 must verify it is draft before screenshots and ask or handle it if still published.
- E: a. `VERCEL_AUTOMATION_BYPASS_SECRET` not set; 04-11 requests it.
- G: sí (label). Language-link aria-label fix approved, assigned to 04-11 with the nav-links `Link` fix (pointer in deferred-items.md, entry in docs/decisions.md).

## Pre-checks (read-only, before the request)

No RESEND, UPSTASH, KV_REST_API or bypass variables in Production or Preview; no Resend DKIM/SPF DNS records; ManuJ fields empty as listed in ANSWERS.

## Deviations from Plan

None. The ANSWERS file includes an extra G line and per-item notes, as instructed.

## Commits

- 8ffa4ee: docs(04-02): record Teo answers, label decision and deferred pointer

## Self-Check: PASSED

ANSWERS file exists, `^[A-E]:` count is 5, secret-shape grep is 0.
