---
phase: 03-panel-admin-cv
plan: 10
subsystem: admin-contact-inbox
tags: [admin, contact, tanstack-table, server-actions, e2e, xss]
requires: [03-04]
provides: [listMessagesForAdmin, markMessageRead, markMessageUnread, deleteMessage, replyMailto, MessagesTable, MessageReader, /admin/mensajes]
affects: [phase-4-contact-form]
key-files:
  created: [src/features/contact/admin-queries.ts, src/features/contact/actions.ts, src/features/contact/actions.test.ts, src/features/contact/components/messages-table.tsx, src/features/contact/components/message-reader.tsx, src/lib/mailto.ts, src/lib/mailto.test.ts, "src/app/admin/(panel)/mensajes/page.tsx", e2e/admin-messages.spec.ts]
  modified: []
decisions:
  - "replyMailto takes { email, message, prefix } (not subject) and derives 'Re: <first line, 60 chars>' itself, so the first-line and length rules are unit-tested in one place"
  - "Row opens via a name button (keyboard) plus a row click; the Sheet is controlled from the selected id so router.refresh updates the open reader"
metrics:
  completed: 2026-11-16
requirements-completed: [ADMN-13]
---

# Phase 3 Plan 10: Contact inbox Summary

Inbox at `/admin/mensajes`: newest-first TanStack v9 table with "Nuevo" badge and mono "{n} sin leer", a right Sheet reader (body as a text node, `whitespace-pre-wrap break-words`), read/unread toggle, AlertDialog delete and an encoded `mailto:` reply. Opening an unread message marks it read and refreshes the nav badge. The copy already existed in `messages/es.json`, so no message files changed.

## Tasks and commits

1. RED `6cbacb8`: failing tests for the three actions (no session, uuid validation, read/unread/delete writes, no tag or export) and `replyMailto` (encoding, first line, 60-char cut, no header injection); 8 failing against stubs.
2. GREEN and feature `7a03a97`: implementation, UI, page and e2e. `pnpm check` exit 0 (unit tests, build); `e2e/admin-messages.spec.ts` 1 passed.

## Verification

- E2E with two temporary rows: list order, badge count, open marks read (DB `read_at` set, badge drops), literal `<script>` text shown with zero script elements in the Sheet, mailto href starts `mailto:e2e%40example.com?`, mark unread restores the count, delete removes exactly one row. Axe (serious/critical) clean on the list and the open reader. Rows are deleted in `beforeAll`/`afterAll`; seeded content untouched.
- `grep dangerouslySetInnerHTML` in contact components: 0. `content-export.ts` untouched. Acceptance grep for `requireActionSession` after each exported action: 3.

## Deviations from Plan

**1. [Rule 3 - Blocking] e2e badge locator.** The open modal hides the sidebar from the role tree, so the badge is found with a CSS locator (`[role="img"][aria-label$="sin leer"]`).

**2. replyMailto signature** differs from the plan's `{ email, subject }`, see decisions.

## Findings (not fixed)

- Same build log NeonDbError "HANGING_PROMISE_REJECTION" for admin routes as noted in 03-04 (session read during prerender); build and runtime fine.
- The shadcn Sheet close button label is English ("Close"); the reader hides it and uses its own "Cerrar" button.

## Pending manual items

None new (BLOB_READ_WRITE_TOKEN still pending, unrelated).

## Known Stubs

None. With zero rows the screen shows the empty state until the phase 4 form writes messages.

## Self-Check: PASSED

Commits 6cbacb8 and 7a03a97 exist; all listed files present; `pnpm check` green.
