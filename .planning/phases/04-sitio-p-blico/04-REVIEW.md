---
phase: 04-sitio-p-blico
reviewed: 2026-11-23T00:00:00Z
depth: standard
scope: incremental follow-up (diff 6038037..HEAD, gap-closure plans 04-13 and 04-14)
supersedes: prior 04-REVIEW.md for the files listed below
files_reviewed: 20
files_reviewed_list:
  - docs/decisions.md
  - e2e/contact-live.spec.ts
  - e2e/contact.spec.ts
  - messages/en.json
  - messages/es.json
  - src/app/[locale]/error.test.tsx
  - src/app/[locale]/error.tsx
  - src/app/[locale]/layout.tsx
  - src/components/site/case-study/case-gallery.tsx
  - src/components/site/case-study/case-study.test.tsx
  - src/components/site/site-error-provider.tsx
  - src/features/contact/components/contact-form.test.tsx
  - src/features/contact/components/contact-form.tsx
  - src/features/projects/validation.test.ts
  - src/features/projects/validation.ts
  - src/lib/format.test.ts
  - src/lib/format.ts
  - src/lib/rate-limit.ts
  - src/lib/upstash-env.test.ts
  - src/lib/upstash-env.ts
findings:
  critical: 0
  warning: 4
  info: 4
  total: 8
status: issues_found
---

# Phase 04: Code Review Report (gap-closure follow-up)

**Reviewed:** 2026-11-23
**Depth:** standard
**Files Reviewed:** 20
**Status:** issues_found

This is an incremental review of the changes since `6038037` (plans 04-13 and 04-14). For these 20 files it supersedes the previous 04-REVIEW.md, which covered 146 files. Findings from that review on files outside this scope (WR-04 through WR-08, IN-01 through IN-08) were not re-checked here. They stay open as recorded in the prior report and in the git history of this file.

## Narrative Findings (AI reviewer)

## Summary

### Status of the prior findings this round targeted

| Prior ID | Status | Evidence |
|---|---|---|
| CR-01: the contact form crashes when the Server Action call throws | **Resolved** | `contact-form.tsx:127-135` wraps `submitContact` in `try/catch` and sets `formError("unavailable")`. The typed values are kept because nothing calls `reset()`. `src/app/[locale]/error.tsx` adds a localized boundary that uses `retry` (the correct prop name in Next 16.3+, checked in the bundled `error.md`) and offers a mailto. `SiteErrorProvider` sits in the layout above the segment's error boundary, so the context is available when the boundary renders. Tests cover both rejection kinds and the retry path. Residual issue: WR-01 below. |
| WR-02: the `??` env fallback ignores `KV_REST_API_*` when `UPSTASH_*` is set but empty | **Resolved** | `resolveUpstashCredentials` picks one complete, trimmed pair: `UPSTASH_*` first, otherwise `KV_*`, and it never mixes the two. `rate-limit.ts` and both e2e specs now share it, so `HAS_LIMITER` matches what the app actually uses. The tests cover empty, blank, mixed and trimmed values. |
| WR-03: an invalid `capturedAt` crashes the published case study | **Resolved (render path)** | `toCalendarDay` round-trips the date parts, so `2025-13`, `2025-00` and `2025-02-31` return `null`. `CaseGallery` drops the date segment instead of throwing, which protects rows already stored in the database. `projectDraftSchema` now rejects impossible dates. Residual issues: WR-02 and IN-01 below. |

### Prior findings in these files that are still open
- Prior WR-01 (rate limit per exact IPv6 address, no global cap) is still open in `rate-limit.ts`. It is carried forward as WR-03.
- Prior WR-09 (the name max-length error says "Write your name.") is still open. `messages/*.json` has no `nameLong` key. It is carried forward as WR-04.
- Prior IN-09 (the limit of 3 is hardcoded in both the copy and the limiter) is still open. It is carried forward as IN-03.

No new blockers. The new code is small and the fixes are correct. Most of what is left is about how the fixes look to the user: the error text after a redeploy gives the wrong advice, and an admin save fails without any visible field message.

## Warnings

### WR-01: After a redeploy (action-ID skew), the fallback tells the visitor to "try again in a few minutes", but retrying can never work

**File:** `src/features/contact/components/contact-form.tsx:128-135`, `messages/en.json:100`, `messages/es.json:100`
**Issue:** Every rejection, including "Failed to find Server Action", maps to `unavailable`: "I couldn't send your message right now. Try again in a few minutes, or write to {email}." When the cause is deploy skew, the action ID in the visitor's bundle is gone for good. Every later click on Send fails the same way until the page is reloaded. The bundled Next guide (`02-guides/server-actions.md:180`) says to surface a retry path "so a refresh recovers the user". The contact page is a long-cached static shell, so a stale tab is the likely case.

The new unit test (`contact-form.test.tsx`, last lines of the `it.each`) proves that a second click succeeds. That holds for a network blip and is false for skew, so the test encodes the wrong expectation for half of its parameters.
**Fix:** Tell the two cases apart and offer a reload for skew. Keep the typed values across the reload:
```tsx
} catch (error) {
  const skew = error instanceof Error && /Server Action/.test(error.message);
  if (skew) sessionStorage.setItem("contact-draft", JSON.stringify(values));
  setFormError(skew ? "stale" : "unavailable"); // "stale": "This page is out of date. Reload it to send, or write to {email}." + reload button
  return;
}
```
Restore the draft from `sessionStorage` on mount. If a new message key is too much for now, at least change the `unavailable` copy to "Reload the page and try again" (copy change, so ask Teo). Also enable Vercel Skew Protection, which avoids the problem at the platform level.

### WR-02: A newly rejected `capturedAt` makes the admin save fail with no message next to the field, and existing projects with such a value can no longer be saved

**File:** `src/features/projects/validation.ts:45-49`, `src/components/admin/image-uploader.tsx:244-252`, `src/features/projects/components/project-form.tsx:126-145`
**Issue:** The `.refine(...)` has no message, so Zod reports its English default ("Invalid input"). `issueMessage` passes non-`required` messages through unchanged. `showIssues` calls `setError("media.N.capturedAt", ...)`, but the `capturedAt` `<Input type="month">` in `image-uploader.tsx` renders no error text, no `aria-invalid` and no `aria-describedby`. The admin sees only the generic "save failed" alert (or "publish blocked: 1 issue"), and focus lands on a month field that shows nothing wrong.

This is more likely than before. Desktop Safari renders `type="month"` as free text, which is how a value like `2025-13` gets in (the original WR-03 scenario). Any project already stored with an impossible `capturedAt` now fails `projectDraftSchema` on every save, including saves that only change other fields, and the UI does not say why. The admin also has no other way to clear the value.
**Fix:** Give the refine a code and render it:
```ts
capturedAt: z.string()
  .refine((v) => toCalendarDay(v) !== null, "capturedAtInvalid")
  .optional(),
```
Then, in `image-uploader.tsx`, read `fieldMessage(errors, \`media.${index}.capturedAt\`)` and render it with `aria-invalid`/`aria-describedby`, as the alt-text fields already do. Map `capturedAtInvalid` to a Spanish admin string in `messages/es.json`.

### WR-03 (carried from prior WR-01): The rate limit is still keyed by the exact IP, so rotating IPv6 addresses gets around it, and there is no global cap

**File:** `src/lib/rate-limit.ts:14-19` (with `src/features/contact/public-actions.ts:19-30`)
**Issue:** Not changed by 04-14. The limiter is still a single `slidingWindow(3, "1 h")` keyed by the hash of the full client address. A host with an IPv6 /64 can rotate its source address on every request. Each message inserts a row and sends a Resend email to Teo. The honeypot and elapsed-time checks are supplied by the client, so they do not bound the volume.
**Fix:** Same as before. Normalize IPv6 to its /64 prefix before hashing (expand `::` first), and add a second limiter, `slidingWindow(30, "1 h")` on the key `"global"`, checked after the per-IP one. Both limiters fail closed in the same way.

### WR-04 (carried from prior WR-09): The name max-length error still tells the visitor to "Write your name."

**File:** `src/features/contact/validation.ts:9`, `messages/en.json` / `messages/es.json` (`Site.contact.errors`)
**Issue:** Not changed. `.max(100, "nameRequired")` reuses the "required" code, so a visitor whose name is over 100 characters is told to write a name in a field that is already filled. The message files changed in this round but still have no `nameLong` key.
**Fix:** Add `nameLong` to `Site.contact.errors` in both locales, use `.max(100, "nameLong")`, and add it to the `ErrorCode` union in `contact-form.tsx`.

## Info

### IN-01: The seed/import schema still accepts impossible `capturedAt` values

**File:** `src/features/projects/content-schema.ts:51-54` (outside the listed files, but it is the other write path for the same field)
**Issue:** `mediaSchema.capturedAt` still uses only the `\d{4}-\d{2}(-\d{2})?` regex. `pnpm seed` can store `2025-02-31`. The gallery now hides the value instead of crashing, so the result is only a missing date, but the project then hits WR-02 the first time it is saved from the admin.
**Fix:** Apply the same `.refine((v) => toCalendarDay(v) !== null)` there, ideally through one shared `capturedAtSchema` exported next to `toCalendarDay`.

### IN-02: The regex before the refine in `projectDraftSchema` is redundant

**File:** `src/features/projects/validation.ts:47-48`
**Issue:** `toCalendarDay` already applies the same pattern and returns `null` when it does not match, so `.regex(...)` only adds a second issue with a different message for the same value.
**Fix:** Keep only the refine, with a message code (see WR-02).

### IN-03 (carried from prior IN-09): The limit of 3 per hour is hardcoded in both the copy and the limiter

**File:** `src/lib/rate-limit.ts:16`, `messages/en.json:99`, `messages/es.json:99`
**Issue:** Unchanged. Changing one side leaves the other wrong. With a real limiter, the e2e contact specs use up the 3-per-hour window from the test machine's IP.
**Fix:** Export a `CONTACT_LIMIT` constant and pass it as an ICU argument (`{limit}`). For e2e runs, use a separate limiter prefix.

### IN-04: The error boundary renders a blank `<main>` without its provider, ignores `error`, and its copy is still unapproved

**File:** `src/app/[locale]/error.tsx:7-19`, `docs/decisions.md` (entry 2026-11-23)
**Issue:**
- `if (!site) return null` leaves an empty `<main>` with no heading and no retry. Today the layout always provides the context, but a future layout refactor would fail silently. A dev-only `console.error` or a minimal fallback would make the problem visible.
- `error` is discarded. There is no `useEffect` that reports `error.digest`, so client-side errors that reach this boundary leave no trace once analytics exists (phase 5).
- The decision log says the `Site.error` copy is "una propuesta pendiente de Teo". CLAUDE.md requires asking before touching copy, so make sure this is on Teo's list before closing the phase.

**Fix:** Render a minimal fallback (or throw in development) when the provider is missing. Add `useEffect(() => { /* report error.digest */ }, [error])` when analytics lands. Track the copy approval as an open item.

---

_Reviewed: 2026-11-23_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
