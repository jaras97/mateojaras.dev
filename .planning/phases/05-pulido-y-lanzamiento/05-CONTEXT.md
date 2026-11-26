# Phase 5: Pulido y lanzamiento - Context

**Gathered:** 2026-11-25 (updated 2026-11-25 after Phase 4.1 completed)
**Status:** Ready for planning

<domain>
## Phase Boundary

The public site is accessible (WCAG AA, keyboard, `prefers-reduced-motion`), has a 404 in both languages, enforces its CSP, records visits with Vercel Web Analytics, passes the login / project CRUD / contact e2e in CI, has been reviewed (re-scoped QUAL-08, see D-09), and is live on mateojaras.dev against Neon `main`.

Requirements: SITE-08, QUAL-03, QUAL-05, QUAL-06, QUAL-07, QUAL-08, QUAL-09.

**State at the start of Phase 5 (after 4.1):** Phase 4.1 is complete. Production is already live at `https://mateojaras-dev.vercel.app` (push-main deploy in 04.1-12) with the approved "AI full stack developer" content in Neon `main` and the CV regenerated. Lighthouse mobile is 96–97 on every audited route (LCP on `/` 2.29 s, the smallest margin; see `04.1-PROD-VERIFY.md`). `mateojaras.dev` still points at the Porkbun parking page (verified 2026-11-25: `pixie.porkbun.com`). Every push to `main` auto-deploys Production.

Also in scope (added by Teo in the update): a **favicon / browser icon** to replace the default Next.js `src/app/favicon.ico` (D-20).

</domain>

<decisions>
## Implementation Decisions

### Analytics (QUAL-07)
- **D-01:** **Vercel Web Analytics** with `@vercel/analytics`. Teo approved the dependency by choosing it on 2026-11-25. No Speed Insights and no Umami. Remove `NEXT_PUBLIC_UMAMI_WEBSITE_ID` from `.env.example`. Teo enables Web Analytics in the Vercel dashboard when the task needs it, following the CLAUDE.md accounts rule: give him the exact steps.
- **D-02:** **Visits and referrers only.** No custom events (Vercel Hobby does not include them). It is cookieless, so there is no consent banner.
- **D-03:** The `<Analytics />` component loads **only on the public site** (`[locale]` layout), never in `/admin`. Teo's own visits to the public site count like anyone else's.

### 404 (SITE-08)
- **D-04:** The 404 shows a short **logbook-style message** and below it the **list of published, visible projects** (reuse `EntryList`, the same order as the home), plus links to home and contact. The list query is the existing cached published-projects query. If there are no projects, the list does not render.
- **D-05:** Copy tone is **"bitácora, seco"**, with no jokes and no em-dashes. The idea: "404 · No hay ninguna entrada en esta dirección." with the requested path in mono. **Claude proposes the en/es text and Teo approves it**, because it is copy (CLAUDE.md autonomy rule). Strings go in `messages/en.json` and `messages/es.json` (`Site.notFound`) with parity. The language comes from the URL prefix only (prior decision: Accept-Language is ignored).
- **D-06:** **Fix the soft 404**: unknown or draft project slugs must return a real **HTTP 404**, checked in `src/proxy.ts` against the list of published slugs. The list must stay correct after the admin publishes or unpublishes, so a stale list must never 404 a just-published project. The researcher picks the mechanism (cached read, tag invalidation, or cost of a DB read per project request) within the Lighthouse budget. This reverses the accepted cost logged in `docs/decisions.md` (phase 2 signal 4, 04-10); update that entry. No new route. — **Reversibility:** reversible — it is a proxy check and can be removed.

### Review (QUAL-08, re-scoped)
- **D-07:** Teo has no reviewers available ("no tengo a nadie, podrias revisarlo tu"). **QUAL-08 is re-scoped:** Claude runs **3 reviews with distinct profiles**: (1) a recruiter hiring in Canada/Europe, (2) a prospective freelance client, (3) a frontend/full-stack developer looking at code and detail. Each runs as a **separate agent** on **production (mateojaras.dev)**, in both languages, with Playwright. These three close the gate.
- **D-08:** Every review follows the **short guide with 3 tasks**: "What does Teo do and for whom?", "Read one case study: what did he decide?", "How would you contact him?", plus 2 open questions. Claude writes the guide in en/es so it can be reused for the human review in D-10.
- **D-09:** Findings go to a log (`docs/reviews.md`). Each finding ends up **fixed** (with its commit) or **dismissed** (with the reason and Teo's OK). Backlog-level findings go to `docs/backlog.md`. A finding counts as resolved only in one of those states. Log the re-scope in `docs/decisions.md` as Teo's decision, and update the QUAL-08 wording in REQUIREMENTS.md and the ROADMAP success criterion 4.
- **D-10:** **One real human review later, non-blocking.** The guide stays ready for when Teo finds someone (ex-Sofka colleague, client). Its findings go to the same log after launch.

### Launch (QUAL-09)
- **D-11:** **Canonical domain is `mateojaras.dev`** (apex). `www.mateojaras.dev` returns a 308 to the apex. Porkbun DNS: A record on the apex and a CNAME for www, pointing to Vercel (remove the Porkbun parking records). Claude gives Teo the exact steps (Vercel → Domains, Porkbun records). Production env vars point at Neon `main`. Preview stays on `dev`. **Updated: connect the domain at the START of Phase 5**, not at the end. The site is already public on vercel.app, so there is no new exposure; DNS propagation and Search Console verification start earlier, and polish and reviews run on the real domain. After the switch, check that `BETTER_AUTH_URL` / `trustedOrigins`, `metadataBase`, canonical/hreflang URLs, sitemap, robots, OG URLs and `/resume.json` use `https://mateojaras.dev` (not the vercel.app host), and that admin login works on the apex.
- **D-12:** **Google Search Console on launch day**: DNS verification (TXT in Porkbun), sitemap submission, and an indexing check of the en and es URLs. Claude gives Teo the exact steps.
- **D-13:** **Content and positioning are NOT in this phase.** That was Phase 4.1, now **complete** and live in production. Phase 5 launches with the 4.1 content. Content changes in Phase 5 come only from review findings (D-18).
- **D-14 (updated):** Order: **domain on mateojaras.dev + Search Console** (D-11, D-12) → polish on a branch (a11y, 404 + soft-404 fix, CSP enforce, analytics, CI e2e, favicon) verified on Preview → merge to `main` (Production) → 3 reviews on mateojaras.dev **after** polish is live → fixes → gate.

### Release flow (new)
- **D-15:** **Polish work goes on a branch, not straight to `main`.** It is verified on the Vercel Preview of that branch (Neon `dev`), then merged to `main` in one or two cuts. Going live is a merge to `main`, which needs Teo's go (outward-facing action). This matters most for the CSP switch to enforce: the zero-violation pass runs on Preview first, then again on Production after the merge.

### CSP (new)
- **D-16:** **Teo approves adding the Vercel Blob hosts to `connect-src`** (`https://*.public.blob.vercel-storage.com` and the Vercel Blob client-upload endpoint on vercel.com; the researcher confirms the exact host the `@vercel/blob` 2.8.2 client calls). This closes the pending condition from `docs/decisions.md` 2026-11-22 (03-07, T-03-26 / AR-03-03). One policy for the whole site (no separate `/admin` CSP). After enforce, an admin image upload must still work (e2e or manual check on Preview).
- **D-17:** **`script-src` keeps `'unsafe-inline'`** when the CSP moves to enforce. No hashes and no SRI in v1 (static shell, no nonce, as in STACK.md). This resolves T-04-06 (hash ThemeScript and the clock script) as **accepted**: log it in `docs/decisions.md` and `04-SECURITY.md`. Hashes/SRI go to `docs/backlog.md`.

### Review fixes and 4.1 leftovers (new)
- **D-18:** **Content findings from the reviews are fixed through the production admin.** Claude proposes the new text in en/es, Teo approves it and enters it in the admin on mateojaras.dev. The 4.1 loader script is **not** run again against `main` in this phase. Code/design findings are fixed in code on a branch (D-15).
- **D-19:** **CR-01 and WR-01..07 from `04.1-CODE-REVIEW.md`** (all about the content loader script) go to **`docs/backlog.md`**, not this phase. The script did its job and does not affect the public site. The backlog entry must say they must be fixed before the loader is used again (CR-01 and WR-06 silently discard drafts).

### Favicon (new, added by Teo)
- **D-20:** **"MJ" monogram favicon**, Funnel Display, terracotta accent on the paper background, with a dark variant. Claude draws it from the DESIGN.md tokens, shows Teo 2–3 variants rendered at real sizes (16, 32, 180 px, light and dark tabs), and **Teo approves one** before it ships (it is identity, CLAUDE.md autonomy rule). It replaces the default `src/app/favicon.ico`. No new dependency. It must comply with DESIGN.md: no rounded tile behind the letters, no gradient. Log the approval in `docs/decisions.md`.

### Claude's Discretion
- **CI e2e (QUAL-05):** add an e2e job to `.github/workflows/ci.yml` against the Neon `dev` branch (secrets already used by `check`), running the login, project CRUD and contact specs. Contact in CI must not send real email or require live Upstash. Use the existing env-check behavior and specs (`e2e/contact.spec.ts` vs `contact-live.spec.ts`), and never add a silent mock that fakes success in production code.
- **CSP enforce (QUAL-06):** switch `Content-Security-Policy-Report-Only` to `Content-Security-Policy` in `next.config.ts` after one pass with zero violations on all public routes (en/es, light/dark, reduced motion) **and the admin** (login, editor, image upload, CV generation), with analytics active. Vercel Analytics is same-origin (`/_vercel/insights`), so check whether `script-src`/`connect-src` need changes. Lighthouse ≥ 95 must not regress (baseline now `04.1-PROD-VERIFY.md`: 96–97, LCP `/` 2.29 s; `04-LIGHTHOUSE.md` is the older one). Keep the Preview-only `vercel.live` allowance.
- **Favicon technique (D-20):** file-based metadata (`icon.svg` with a `prefers-color-scheme` dark variant, plus PNG fallbacks and `apple-icon`), static files or `ImageResponse` with the self-hosted Funnel Display; convert the letters to paths if the SVG would otherwise depend on the font. Applies to both root layouts (`[locale]` and `admin`). Whether to add a web manifest is Claude's call (no new route beyond Next's metadata files).
- **404 for unmatched URLs** (`/foo`, `/es/foo`): make sure they render the localized 404 (multiple root layouts: `[locale]` and `admin`). The researcher checks `global-not-found` vs the current `[locale]/not-found.tsx` and how next-intl rewrites interact.
- **A11y + reduced motion pass (QUAL-03):** keyboard-only walk of every public route in both languages, focus visible, axe with no serious/critical (`e2e/axe.ts`), reduced motion confirms phase 4 behavior. The 404 gets the same screenshots (390/768/1440, light/dark) and impeccable audit/critique as the other public views.
- Whether analytics also loads on Preview deployments (default: production only).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project rules and scope
- `CLAUDE.md`: autonomy limits (deps, copy, routes), accounts/keys rule, security, verification checklist
- `PROJECT.md` (root): source of truth for scope; phase 5 = Pulido
- `.planning/ROADMAP.md` §Phase 5: goal, success criteria, approvals, accounts
- `.planning/REQUIREMENTS.md`: SITE-08, QUAL-03, QUAL-05 to QUAL-09
- `docs/backlog.md`: out-of-scope list (backlog-level findings go here)
- `docs/decisions.md`: soft-404 accepted cost (phase 2 signal 4, line ~207) that D-06 reverses; the 2026-11-22 Blob `connect-src` entry (03-07, line ~434) that D-16 closes; the T-04-06 note (line ~536) that D-17 resolves; log every phase 5 decision here

### Design and copy
- `DESIGN.md`: the 404 follows it (logbook concept, one accent, typography)
- `docs/copy.md`: copy rules; the 404 text needs Teo's approval
- `messages/en.json`, `messages/es.json`: `Site.notFound` keys (parity enforced by `src/lib/messages.test.ts`)

### Prior phase artifacts
- `.planning/phases/04-sitio-p-blico/04-CONTEXT.md`: public site decisions (header, EntryList, routes)
- `.planning/phases/04-sitio-p-blico/deferred-items.md`: soft 404 and og:image:alt notes
- `.planning/phases/04-sitio-p-blico/04-LIGHTHOUSE.md`: Lighthouse baseline that must not regress
- `.planning/phases/04-sitio-p-blico/04-SECURITY.md`: threat model and CSP notes
- `.planning/debug/case-study-500-after-updatetag.md`: why `params` must stay inside Suspense on the case-study route (constraint for D-06: do not move slug resolution back into the page shell)
- `.planning/research/PITFALLS.md` (~line 426): Vercel Analytics plus CSP pitfalls
- `.planning/phases/04.1-contenido-y-posicionamiento-full-stack-ai/04.1-PROD-VERIFY.md`: current production URL, smoke results and the **current Lighthouse baseline** (96–97)
- `.planning/phases/04.1-contenido-y-posicionamiento-full-stack-ai/04.1-CODE-REVIEW.md`: CR-01, WR-01..07 that go to the backlog (D-19)
- `.planning/phases/04.1-contenido-y-posicionamiento-full-stack-ai/04.1-CONTEXT.md`: positioning and content decisions the review guide and reviewer personas must reflect
- `.planning/phases/03-panel-admin-cv/03-SECURITY.md`: AR-03-03 / T-03-26 (Blob `connect-src`), closed by D-16

### Next 16 docs (bundled)
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`: proxy runtime and responses
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md`: `notFound`, `global-not-found`, noindex
- `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`: header CSP without nonce

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/site/entry-list.tsx`: the project list for the 404 (D-04)
- `src/features/projects/queries.ts`: `getProjects()` (cached public list) and `getPublishedSlugsCore()`, the source for the proxy slug check (D-06)
- `src/app/[locale]/not-found.tsx`: current minimal 404, to be redesigned
- `src/app/favicon.ico`: default Next.js icon, replaced by D-20
- `src/app/[locale]/opengraph-image.tsx` (and `about/`, `contact/`): existing `ImageResponse` setup with self-hosted fonts, reusable for icon rendering
- `next.config.ts`: `csp` array with `blobHost` already in `img-src`; `connect-src 'self'` gets the Blob hosts (D-16)
- `e2e/axe.ts`, `e2e/keyboard.spec.ts`, `e2e/reduced-motion.spec.ts`, `e2e/headers.spec.ts`, `e2e/seo.spec.ts`: existing a11y, CSP and SEO gates to extend
- `e2e/auth.spec.ts`, `e2e/admin-projects.spec.ts`, `e2e/contact.spec.ts`: QUAL-05 specs to run in CI
- `e2e/screens.ts`: screenshot harness for 390/768/1440 light/dark

### Established Patterns
- Static header CSP in `next.config.ts` (no nonce, so the static shell survives), currently Report-Only, with a Preview-only `vercel.live` allowance
- `src/proxy.ts` composes next-intl rewrites with the optimistic admin cookie check; the slug check must slot in without breaking either
- Cache tags in `src/lib/cache-tags.ts`; Server Actions call `updateTag`
- Playwright `webServer` builds and starts locally unless a remote URL is set (`playwright.config.ts`)

### Integration Points
- `[locale]` root layout: where `<Analytics />` mounts (never the admin root layout)
- `.github/workflows/ci.yml`: today runs only `pnpm db:migrate` + `pnpm check`; the e2e job goes here
- Vercel project settings (domains, env per environment, Web Analytics toggle) and Porkbun DNS: Teo's dashboard actions

</code_context>

<specifics>
## Specific Ideas

- 404 idea text: "404 · No hay ninguna entrada en esta dirección." with the path in mono (Claude proposes, Teo approves).
- Reviewer profiles: a recruiter hiring for Canada/Europe, a freelance client, a dev. At least one review in English.
- Positioning shift to "full stack + AI" changes how the reviewers judge the site (the recruiter persona hires for full-stack/AI roles). 4.1 has landed, so the review guide can be written now. The reviews themselves run after polish is live (D-14).
- Favicon: "MJ" monogram, terracotta on paper, dark variant; Teo picks from 2–3 rendered variants.

</specifics>

<deferred>
## Deferred Ideas

- ~~Phase 4.1: Contenido y posicionamiento full stack + AI~~ — done (2026-11-25).
- Content loader fixes (CR-01, WR-01..07 of 04.1-CODE-REVIEW.md) → `docs/backlog.md` (D-19).
- Hash- or SRI-based `script-src` (drop `'unsafe-inline'`) → `docs/backlog.md` (D-17).
- Human review (1 person), non-blocking, after launch (D-10).
- Custom analytics events (CV download, contact submit, Cal.com click): not now; would need Umami or Vercel Pro.
- Speed Insights: not now.

</deferred>

---

*Phase: 05-pulido-y-lanzamiento*
*Context gathered: 2026-11-25*
