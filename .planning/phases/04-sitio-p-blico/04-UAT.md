---
status: testing
phase: 04-sitio-p-blico
source: [04-VERIFICATION.md]
started: 2026-11-23T23:51:57Z
updated: 2026-11-23T23:51:57Z
---

## Current Test

number: 1
name: Live contact delivery on the Preview
expected: |
  Confirmation in the visitor's language; row in contact_messages; Teo receives the email with Reply-To = visitor; email_sent_at non-null; 4th send within an hour rejected
awaiting: user response

## Tests

### 1. Live contact delivery: set RESEND_API_KEY (domain verified in Porkbun DNS) and Upstash vars in .env.local and Vercel Production+Preview, submit the form on the Preview
expected: Confirmation in the visitor's language; row in contact_messages; Teo receives the email with Reply-To = visitor; email_sent_at non-null; 4th send within an hour rejected
result: [pending]

### 2. Load ManuJ and EcoExport content from /admin (problem, role, case study, results, metrics, tech decisions in en and es, media), then review /projects/[slug] in en and es
expected: Sections 01-05, Marginalia, metrics with sources and gallery with captions render; Lighthouse stays >= 95 on the populated case
result: [pending]

### 3. Run /impeccable:audit and /impeccable:critique on each public view in en and es
expected: No critical findings
result: [pending]

### 4. Visual review at 390/768/1440 light and dark, including the scrubbed margin-number scene, theme View Transition with no flash, and the new error boundary copy
expected: Matches UI-SPEC; one accent; no horizontal scroll; Site.error copy approved by Teo
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
