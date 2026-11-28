---
phase: 04-sitio-p-blico
plan: 07
subsystem: contact
tags: [contact, copy-email, cal-link, activity, motion, e2e]
requires: [04-02, 04-03, 04-06, 04-12]
provides:
  - ContactAside (email + CopyEmail + https-only Cal.com link)
  - Activity-safe confirmation with 200 ms Motion fade
  - e2e/contact-live.spec.ts (gated), e2e/screens-contact.spec.ts
affects: [04-11]
key-files:
  created:
    - src/features/contact/components/contact-aside.tsx
    - src/features/contact/components/contact-aside.test.tsx
    - e2e/contact-live.spec.ts
    - e2e/screens-contact.spec.ts
  modified:
    - src/app/[locale]/contact/page.tsx
    - src/features/contact/components/contact-form.tsx
    - src/features/contact/components/contact-form.test.tsx
    - e2e/contact.spec.ts
requirements-completed: [CONT-01, CONT-05, MOTN-01, QUAL-04]
requirements-partial: [CONT-02]
duration: ~25 min
completed: 2026-11-22
---

# Phase 4 Plan 07: Contact view finish Summary

Contact page now has an "Or write directly" aside (copyable email, plain Cal.com link only for https URLs), a confirmation that resets on Activity hide/show and fades in over 200 ms via Motion (reduced motion respected), and a live-delivery e2e that is defined but skipped until Teo's keys exist.

## Tasks

1. Aside, Activity reset, Motion fade, Reveal 0/1 (H1 static): `f4bcaa8`
2. Live spec, screenshot matrix, review: `a9263d5`

## live delivery: pending keys

04-02 answers A (Resend) and B (Upstash) are "luego", so `e2e/contact-live.spec.ts` skips with the reason printed (2 skipped). This is not a pass. Verified instead: the fail-closed path (form shows the unavailable alert with mailto, no row written) in `e2e/contact.spec.ts`, en and es. Open verification item for 04-11 / end-of-phase human check: once keys exist, run the live spec and have Teo confirm the email arrived with Reply-To = the test address. Calendar (C: luego): no calendar_url set, so the Cal block is absent; unit-tested for null, `javascript:x` and https.

## impeccable

Formal `/impeccable:audit` and `/impeccable:critique` were not run in this session (pending, not blocking). Scripted captures taken (20 PNGs in `test-results/screens/contact/`: 390/768/1440 x light/dark x en/es, plus error and confirmation at 390/1440 light) and reviewed manually (1440 light, 390 dark): no horizontal overflow (asserted), hierarchy clear, aside aligned with first field, no banned patterns. Dispositions: no criticals found, no fixes needed in contact files. Axe on the form state passes excluding header/footer (known 04-11 items: language link label, nav `<a>`).

## Decisiones

- Quién: Claude. Confirmation reset uses a `shouldReset` ref plus `useLayoutEffect` cleanup (documented Activity pattern); it also resets `startedAt` so the honeypot timing check stays valid after return.
- Quién: Claude. Rate-limit e2e burst is opt-in (`E2E_RATE_LIMIT=1`) to avoid burning Teo's window.

## Deviations from Plan

None. The old standalone mailto paragraph on the page was replaced by the aside (CopyEmail renders the mailto link).

## Self-Check: PASSED

`pnpm check` exit 0; commits f4bcaa8 and a9263d5 present; files exist.
