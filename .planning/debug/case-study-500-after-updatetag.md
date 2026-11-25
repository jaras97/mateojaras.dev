---
status: resolved
trigger: "Full pnpm test:e2e: 6 fails on /[locale]/projects/[slug] (draft-mode.spec:65, public.spec:84, public.spec:114) with NEXT_STATIC_GEN_BAILOUT / 500 / no h1; same specs pass alone."
created: 2026-11-16T00:00:00Z
updated: 2026-11-25T00:00:00Z
---

## Current Focus

reasoning_checkpoint:
  hypothesis: "ProjectPage awaits `params` at the top, outside any <Suspense>. The route's App Shell (fallback render where `slug` is unknown, /[locale]/projects/[slug]) therefore hangs on fallback params. The shell's only tags come from what renders before the hang: the [locale] layout's generateMetadata -> getSiteSettings (tag `settings`). updateTag(settings) invalidates that shell; regenerating it at runtime throws 'Accessed fallback params during prerendering' -> NEXT_STATIC_GEN_BAILOUT -> 500 for every slug (listed, unlisted, unknown). updateTag(projects) never invalidates the shell because getProject is never reached in it, so it is harmless."
  confirming_evidence:
    - "Fresh build+start: all slug URLs 200. After a publish-only repro (one updateTag(settings), no Draft Mode): every slug URL 500 on every request; / stays 200."
    - "Spec-by-spec bisect: admin-education/experience/guards/images/messages/projects/reorder leave slugs healthy; admin-settings (the only spec calling updateTag(settings)) breaks them."
    - "--debug-prerender stack ends at fallbackParamsProxyHandler (Proxy.then on params) which calls abortOnDynamicAccess('fallback-params', 'Accessed fallback `params` during prerendering')."
    - "Docs adopting-partial-prefetching.md 'Move URL data behind Suspense' and ISR-with-cache-components: with partialPrefetching on, params must be awaited inside <Suspense> so the App Shell has no URL data."
  falsification_test: "After moving the params read into a child inside <Suspense>, run the same publish-only repro: if slug URLs still 500, the hypothesis is wrong."
  fix_rationale: "The shell stops depending on URL data, so its runtime regeneration after any tag invalidation succeeds; listed slugs stay fully static (params known at build)."
  blind_spots: "Why the build tolerates the same shell (likely treats it as a blocking fallback) but runtime regeneration bails out is Next-internal; 'Unexpected cache miss after warming' warning may be a separate Draft-Mode-related effect."
next_action: apply Suspense fix to src/app/[locale]/projects/[slug]/page.tsx, rebuild, rerun publish-only repro

## Symptoms

expected: case-study pages render h1 (published) or not-found (draft/unknown) in both locales regardless of earlier admin mutations
actual: after earlier specs, pages return 500 or no h1; server log "Next.js encountered uncached or runtime data during prerendering ... NEXT_STATIC_GEN_BAILOUT"
errors: NEXT_STATIC_GEN_BAILOUT; build warning "Unexpected cache miss after cache warming phase" for /[locale] and /[locale]/projects/[slug]; HANGING_PROMISE_REJECTION on admin routes during build
reproduction: full pnpm test:e2e; public.spec + draft-mode.spec alone pass 16/16
started: after plan 03-06 (draft-aware reads)

## Eliminated

- hypothesis: Draft Mode (draftMode() in DraftBanner / cached reads) is required for the bailout
  evidence: publish-only repro (no Draft Mode request) reproduces the 500s deterministically
  timestamp: 2026-11-16

- hypothesis: stale-first-request after updateTag on a build-prerendered slug (03-04 observation)
  evidence: probe with own prerendered fixture, waiting for the DB publish to commit: GET #1 already fresh, both pre-fix and post-fix builds. Earlier observation most likely a race (asserting on 'Guardado' already visible from the draft save).
  timestamp: 2026-11-16

## Evidence

- timestamp: 2026-11-16
  checked: bundled docs use-cache.md / draft-mode.md
  found: reading draftMode().isEnabled inside 'use cache' is allowed
  implication: draftMode() inside getProject/getSiteSettings is not by itself illegal

- timestamp: 2026-11-16
  checked: bisect over e2e spec files with a curl probe of 6 slug URLs + / after each
  found: only admin-settings.spec flips slugs to 500 (persistent); others leave 200
  implication: trigger is updateTag(tags.settings)

- timestamp: 2026-11-16
  checked: temp repro e2e/zz-repro.spec.ts MODE=publish (sign in, Publicar cambios unchanged) on fresh server
  found: all slug URLs 500 every request; / 200; no Draft Mode involved; no 'cache miss' warning this time
  implication: Draft Mode not required; deterministic repro

- timestamp: 2026-11-16
  checked: next build --debug-prerender + repro, server stack
  found: bailout raised from fallbackParamsProxyHandler 'Accessed fallback `params` during prerendering'
  implication: App Shell regeneration with unknown slug hits `await params` outside Suspense in ProjectPage

## Resolution

root_cause: ProjectPage awaited `params` outside <Suspense>. The route's App Shell (unknown slug) hung on fallback params; its only tag was `settings` (layout generateMetadata -> getSiteSettings). updateTag(settings) invalidated the shell and its runtime regeneration threw 'Accessed fallback `params` during prerendering' -> NEXT_STATIC_GEN_BAILOUT -> 500 for every slug until restart. updateTag(projects) never touched the shell, hence harmless.
fix: Read the slug inside a <Suspense>-wrapped CaseStudy child (docs adopting-partial-prefetching "Move URL data behind Suspense"); locale + back link stay in the shell. Listed slugs remain fully static (○).
verification: publish-only repro 500 -> 200/404; regression e2e (admin-settings.spec "case studies still render after a settings publish") red on pre-fix build, green after; pnpm check green (291 unit tests); full e2e 64 passed, 3 skipped (Blob token), 0 bailouts. Commit c6b71f5.
files_changed: [src/app/[locale]/projects/[slug]/page.tsx, e2e/admin-settings.spec.ts]

## Closure

Fix c6b71f5 ("read the case-study slug inside Suspense") is an ancestor of origin/main (verified with `git merge-base --is-ancestor c6b71f5 origin/main`). Regression e2e lives in e2e/admin-settings.spec.ts. Closed in phase 4.1 plan 03 (low relevance, decided by Claude, not asked to Teo).
