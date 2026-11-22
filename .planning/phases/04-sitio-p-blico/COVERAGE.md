# API Coverage — Resend (resend 6.35.0), Upstash Ratelimit (@upstash/ratelimit 2.2.0 + @upstash/redis 1.40.0), Cal.com (link only)

> Full coverage by default. Opt-outs are explicit, reasoned decisions.

## Resend

| capability | decision | reason |
|---|---|---|
| emails.send (text body, from, to, replyTo, subject) | INTEGRATE | |
| emails.send `react:` body | OPT-OUT | not needed: D-11 fixes a plain `text` body and `@react-email/render` is not installed |
| emails.send `html` body | OPT-OUT | not needed: D-11 fixes a plain `text` body |
| emails.send attachments | OPT-OUT | explicitly out of scope: the contact form takes no files |
| emails.send scheduledAt | OPT-OUT | not needed: notification is immediate, sent in `after()` (D-09) |
| batch.send | OPT-OUT | not needed: one notification per message |
| emails.get / emails.list | OPT-OUT | not needed: delivery state is recorded in `contact_messages.email_sent_at` (D-10) |
| emails.update / emails.cancel | OPT-OUT | not needed: nothing is scheduled |
| domains.* (create, verify, list) | OPT-OUT | not needed in code: Teo verifies mateojaras.dev once in the Resend dashboard (04-02) |
| apiKeys.* | OPT-OUT | not needed in code: the key is created by Teo in the dashboard |
| audiences / contacts / broadcasts | OPT-OUT | explicitly out of scope: no newsletter (docs/backlog.md) |
| webhooks (delivered, bounced) | OPT-OUT | not needed yet: `email_sent_at` records the API acceptance; bounces are visible in the Resend dashboard |

## Upstash Ratelimit / Redis

| capability | decision | reason |
|---|---|---|
| Ratelimit.slidingWindow + limit(identifier) | INTEGRATE | |
| limit() `reason` / `success` handling incl. timeout (fail closed) | INTEGRATE | |
| Ratelimit `timeout` option | INTEGRATE | |
| Ratelimit `prefix` option | INTEGRATE | |
| Redis client from explicit url/token (UPSTASH_REDIS_REST_* or KV_REST_API_*) | INTEGRATE | |
| Ratelimit.fixedWindow / tokenBucket | OPT-OUT | not needed: D-12 fixes a sliding window of 3 per hour |
| ephemeralCache | OPT-OUT | not needed: serverless instances are short-lived and the window is 1 h |
| analytics option | OPT-OUT | not needed: no rate-limit dashboard requirement |
| getRemaining / resetUsedTokens / blockUntilReady | OPT-OUT | not needed: the form shows a fixed message when the limit is hit (D-13) |
| MultiRegionRatelimit | OPT-OUT | not needed: single region, single form |
| deny lists / protection | OPT-OUT | not needed yet: honeypot + elapsed time + limit cover CONT-03/04 |
| Redis data commands (get/set/...) | OPT-OUT | not needed: Redis is used only through Ratelimit |

## Cal.com

| capability | decision | reason |
|---|---|---|
| Plain link to the event URL from `site_settings.calendar_url` | INTEGRATE | |
| Embed (inline, popup, floating button) | OPT-OUT | explicitly out of scope: CONT-05 says "enlace simple (sin embed)" |
| Cal.com API (bookings, availability, webhooks) | OPT-OUT | explicitly out of scope: the site only links to the booking page |
