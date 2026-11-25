# Phase 5: Pulido y lanzamiento - Context

**Gathered:** 2026-11-25
**Status:** Ready for planning (depends on Phase 4.1, to be inserted)

<domain>
## Phase Boundary

The public site is accessible (WCAG AA, keyboard, `prefers-reduced-motion`), has a 404 in both languages, enforces its CSP, records visits with Vercel Web Analytics, passes the login / project CRUD / contact e2e in CI, has been reviewed (re-scoped QUAL-08, see D-09), and is live on mateojaras.dev against Neon `main`.

Requirements: SITE-08, QUAL-03, QUAL-05, QUAL-06, QUAL-07, QUAL-08, QUAL-09.

**New dependency:** Phase 5 launches only after **Phase 4.1 "Contenido y posicionamiento full stack + AI"** (to be inserted, see D-13). Polish work (a11y, 404, CSP, analytics, CI e2e) does not depend on 4.1 and can run first. Production launch, the reviews and Search Console come after 4.1 is complete.

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
- **D-11:** **Canonical domain is `mateojaras.dev`** (apex). `www.mateojaras.dev` returns a 308 to the apex. Porkbun DNS: A record on the apex and a CNAME for www, pointing to Vercel. Claude gives Teo the exact steps (Vercel → Domains, Porkbun records). Production env vars point at Neon `main`. Preview stays on `dev`.
- **D-12:** **Google Search Console on launch day**: DNS verification (TXT in Porkbun), sitemap submission, and an indexing check of the en and es URLs. Claude gives Teo the exact steps.
- **D-13:** **Content and positioning are NOT in this phase.** Teo wants to update all site content and reposition as **"full stack + AI" developer** (today everything says "frontend, React/Next"). That work goes to a new **Phase 4.1** before Phase 5's launch. Its scope: headline, bio, Now, experience, the 4 case studies, stack order, SEO texts, OG, CV en/es, loaded in Neon `main`, with Claude's recommendations and help. Teo confirmed real AI evidence: **LLM integration in a product, systematic development with coding agents, and AI automations/tooling**. The 4.1 interview collects the concrete facts. Nothing invented. Phase 5 launches with the 4.1 content.
- **D-14:** Order: polish (a11y, 404, CSP, analytics, CI e2e) → [Phase 4.1 complete] → production on mateojaras.dev → Search Console → 3 reviews on production → fixes → gate.

### Claude's Discretion
- **CI e2e (QUAL-05):** add an e2e job to `.github/workflows/ci.yml` against the Neon `dev` branch (secrets already used by `check`), running the login, project CRUD and contact specs. Contact in CI must not send real email or require live Upstash. Use the existing env-check behavior and specs (`e2e/contact.spec.ts` vs `contact-live.spec.ts`), and never add a silent mock that fakes success in production code.
- **CSP enforce (QUAL-06):** switch `Content-Security-Policy-Report-Only` to `Content-Security-Policy` in `next.config.ts` after one pass with zero violations on all public routes (en/es, light/dark, reduced motion) and with analytics active. Vercel Analytics is same-origin (`/_vercel/insights`), so check whether `script-src`/`connect-src` need changes. Lighthouse ≥ 95 must not regress (04-LIGHTHOUSE.md is the baseline).
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
- `docs/decisions.md`: soft-404 accepted cost (phase 2 signal 4, line ~207) that D-06 reverses; log every phase 5 decision here

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
- Positioning shift to "full stack + AI" changes how the reviewers judge the site (the recruiter persona hires for full-stack/AI roles). Write the review guide after 4.1 lands.

</specifics>

<deferred>
## Deferred Ideas

- **Phase 4.1: Contenido y posicionamiento full stack + AI** (new phase, before Phase 5's launch). Rewrite all content around the new positioning with Claude's recommendations; interview Teo for the AI evidence (LLM integration in a product, coding-agent workflow, AI automations); decide whether this portfolio (built with an agent workflow) becomes a case study; update headline, bio, Now, experience, case studies, stack, SEO, OG and CV en/es in Neon `main`; update PROJECT.md / CLAUDE.md wording ("frontend" → "full stack + AI") with Teo's approval. Insert with `/gsd-phase` and discuss separately.
- Human review (1 person), non-blocking, after launch (D-10).
- Custom analytics events (CV download, contact submit, Cal.com click): not now; would need Umami or Vercel Pro.
- Speed Insights: not now.

</deferred>

---

*Phase: 05-pulido-y-lanzamiento*
*Context gathered: 2026-11-25*
