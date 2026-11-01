---
phase: 01-identidad-y-contenido
reviewed: 2026-11-01T20:07:51Z
depth: standard
files_reviewed: 40
files_reviewed_list:
  - .gitignore
  - biome.json
  - package.json
  - scripts/capture-lab.ts
  - scripts/capture-material.ts
  - scripts/check-phase-1.sh
  - scripts/fetch-pdf-fonts.sh
  - scripts/verify-pdf-fonts.py
  - src/app/fonts.ts
  - src/app/globals.css
  - src/app/lab/_components/lab-bar.tsx
  - src/app/lab/_components/specimens.tsx
  - src/app/lab/hero/page.tsx
  - src/app/lab/layout.tsx
  - src/app/lab/page.tsx
  - src/app/lab/tokens/page.tsx
  - src/app/layout.tsx
  - src/components/site/hero-copy.ts
  - src/components/site/hero/hero-a.tsx
  - src/components/site/hero/hero-b.tsx
  - src/components/site/hero/hero-c.tsx
  - src/components/site/hero/hero-parts.tsx
  - src/components/site/hero/hero.test.tsx
  - src/components/site/section-number.tsx
  - src/components/site/status-line.test.tsx
  - src/components/site/status-line.tsx
  - src/components/ui/button.tsx
  - src/features/projects/content-file.ts
  - src/features/projects/content-schema.test.ts
  - src/features/projects/content-schema.ts
  - src/features/site-settings/fixture.ts
  - src/features/site-settings/types.ts
  - src/lib/format.test.ts
  - src/lib/format.ts
  - src/lib/i18n-fields.test.ts
  - src/lib/i18n-fields.ts
  - src/lib/messages.test.ts
  - src/lib/messages.ts
  - src/lib/utils.ts
  - vitest.config.ts
findings:
  critical: 0
  warning: 10
  info: 16
  total: 26
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-11-01T20:07:51Z
**Depth:** standard
**Files Reviewed:** 40
**Status:** issues_found

## Summary

Scope: the phase 1 diff since `246f034`. That covers the design tokens and fonts, the temporary `/lab` route, the three hero variants and `StatusLine`, the `docs/content` contract (Zod schema, front-matter parser, number parity), the formatting and i18n helpers, and the local tooling (lab and material capture harnesses, PDF font fetch and verify, the phase 1 gate script).

None of the findings is a blocker. The components live under `/lab` and a fixture, and the Python/shell tooling runs only locally. Several findings still carry straight into phase 2, because the hero, `StatusLine`, `localized()` and the content schema are the pieces the public site and the seed will reuse as they are. The main concerns:

- The hero CTA is announced as a button, not a link. Verified by rendering `HeroCta`: the output is `<a href="/contact" role="button" tabindex="0">`.
- The content contract accepts impossible dates. It also lets `pendingFields` hide values that are present but invalid, which goes further than the documented rule (pending only excuses an absent field).
- `localized()` takes any string as the field name, and every caller casts the result with `as string`.
- Several gates can pass when they should not: axe is skipped when its import fails, `fixture-approved` checks only the English headline, and `pdf-fonts` does not check that the required font files exist.
- `capture-material.ts` types the login credentials into the page before it checks which host the page is on.

## Warnings

### WR-01: Hero CTA link is exposed as `role="button"`

**File:** `src/components/site/hero/hero-parts.tsx:31-36`
**Issue:** With `nativeButton={false}`, Base UI's `useButton` adds `role: 'button'` and `tabIndex: 0` to whatever element is rendered (`node_modules/@base-ui/react/internals/use-button/useButton.js:183-187`). The rendered CTA is `<a href="/contact" role="button" tabindex="0" ...>`. Screen readers announce the main call to action as a button, but activating it navigates to another page, which is a role/behavior mismatch (WCAG 4.1.2, part of the project's AA target). It also hides the link from link lists and rotor navigation. All three variants share `HeroCta`, so this ships on `/` in phase 2. The `biome-ignore lint/a11y/useAnchorContent` comment is a side effect of the same pattern.
**Fix:** Style a real link with the variant classes instead of wrapping it in the Base UI button primitive:
```tsx
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function HeroCta({ cta, className }: { cta: HeroProps["cta"]; className?: string }) {
  return (
    <div className={className}>
      <Link href={cta.href} className={buttonVariants({ size: "lg" })}>
        {cta.label}
      </Link>
    </div>
  );
}
```
Add an assertion to `hero.test.tsx` that the CTA markup does not contain `role="button"`.

### WR-02: `localized()` accepts any field name, and callers hide the result with `as string`

**File:** `src/lib/i18n-fields.ts:5-12`; callers `src/components/site/hero/hero-a.tsx:15`, `hero-b.tsx:16`, `hero-c.tsx:19`, `src/app/lab/hero/page.tsx:80`
**Issue:** `field` is typed as `string`, and the return type is `T[keyof T]` (the union of every column type). A typo such as `localized(settings, "headine", locale)` compiles, returns `undefined`, and the caller's `as string` cast turns that into a runtime `TypeError` at `headline.trim()`. CLAUDE.md requires this helper everywhere in the UI ("en UI siempre `localized(row, 'title', locale)`"), so every future caller inherits the hole, and casts like these will keep spreading.
**Fix:** Constrain `field` to the base names that have both locale columns, and derive the return type from them:
```ts
type BaseOf<T> = {
  [K in keyof T & string]: K extends `${infer B}En` ? (`${B}Es` extends keyof T ? B : never) : never;
}[keyof T & string];

export function localized<T, F extends BaseOf<T>>(
  row: T, field: F, locale: Locale,
): T[`${F}En` & keyof T] | T[`${F}Es` & keyof T] {
  const en = row[`${field}En` as keyof T];
  const es = row[`${field}Es` as keyof T];
  return (locale === "es" ? (es ?? en) : en) as never;
}
```
Then delete the `as string` casts.

### WR-03: `isoDate` accepts impossible dates, which crash later at render time

**File:** `src/features/projects/content-schema.ts:15-17, 69-70`
**Issue:** `/^\d{4}-\d{2}-\d{2}$/` accepts `"2025-13-45"` and `"2025-02-30"`. Once such a value reaches the UI, `formatMonthYear` (`src/lib/format.ts:8-14`) builds an Invalid Date, and `Intl.DateTimeFormat#format` throws `RangeError: Invalid time value` (reproduced locally). That throw takes down the whole case-study render, which goes against "si falta contenido, el componente no se renderiza". The schema also never checks that `finishedAt >= startedAt`.
**Fix:** Use Zod 4's calendar-aware validator and add a cross-field rule:
```ts
const isoDate = z.iso.date({ error: "expected a quoted 'YYYY-MM-DD' date" });
// in crossFieldIssues:
if (typeof fm.startedAt === "string" && typeof fm.finishedAt === "string" && fm.finishedAt < fm.startedAt) {
  issues.push("finishedAt: earlier than startedAt");
}
```

### WR-04: `pendingFields` hides values that are present but invalid, not only absent ones

**File:** `src/features/projects/content-schema.ts:160-178`
**Issue:** `droppable()` drops every issue whose first path segment is listed as pending, whatever the issue is. `docs/content/README.md:14` and the module doc comment (lines 10-11) say pending only excuses an absent field. As written, a file can list `liveUrl` as pending and still carry `liveUrl: "javascript:alert(1)"`, or list `startedAt` and carry `"2025-99-99"`, and validation reports zero issues. Part of the problem is that `validateProjectContent` returns only `issues` and never the parsed data, so the phase 2 seed has to use the raw, unvalidated `frontMatter`, values included.
**Fix:** Drop an issue only when the field is absent, and return the parsed data so the seed never reads the raw object:
```ts
const fm = asRecord(content.frontMatter);
const droppable = (field: unknown) =>
  typeof field === "string" && !neverPending.has(field) && pending.includes(field) &&
  fm[field] === undefined && content.sections[field] === undefined;
```
Also add a test: a pending field holding an invalid value is still reported.

### WR-05: `capture-material.ts` fills the login form before checking the host

**File:** `scripts/capture-material.ts:259-266`
**Issue:** `loginIfAsked()` (line 262) types `CAPTURE_LOGIN_EMAIL_*` / `CAPTURE_LOGIN_PASSWORD_*` into whatever page the navigation ended on. The `finalHost !== expectedHost` check runs only afterwards (lines 263-266). A redirect to another host (expired domain, hijacked DNS, a third-party SSO page, a typo in `--base-url`) receives Teo's credentials before the script notices. No current project sets `loginEnv`, but the sample-data apps are meant to use this path at G5.
**Fix:** Check the host before any credential is typed, and check it again after login:
```ts
await page.goto(new URL(view.path, base).toString(), { waitUntil: "networkidle" });
const assertHost = () => {
  const host = new URL(page.url()).host;
  if (host !== expectedHost) throw new Error(`landed on ${host}, expected ${expectedHost}`);
};
assertHost();
await loginIfAsked(page, project.loginEnv);
assertHost();
```

### WR-06: `capture-lab.ts check` silently skips axe when the import fails for any reason

**File:** `scripts/capture-lab.ts:209-219, 518-523`
**Issue:** `@axe-core/playwright` is now a pinned devDependency (`package.json:48`), but `loadAxe()` still catches every error and returns `null`. The check then prints `SKIP axe: no instalado` and exits 0. A broken install, an ESM/CJS interop error or a renamed export would quietly remove the a11y gate ("axe sin serious/critical") while the run still looks green.
**Fix:** Fail when the package is declared but cannot load:
```ts
async function loadAxe(): Promise<AxeBuilderCtor> {
  const mod = (await import("@axe-core/playwright")) as { default: AxeBuilderCtor };
  return mod.default;
}
```
If the optional path has to stay, return `null` only on `ERR_MODULE_NOT_FOUND`, and make `check` exit 1 when it skips.

### WR-07: `capture-lab.ts capture` deletes the previous captures before checking it can run

**File:** `scripts/capture-lab.ts:573-581`
**Issue:** The PNG cleanup loop runs before `withServer()` checks `.next/BUILD_ID` and the port. If there is no build, port 3100 is busy, or `next start` fails, the run exits 1 and the previous review matrix in `.lab-captures/` is already gone. That folder is the one Teo reviews.
**Fix:** Do the cleanup inside the `withServer` body, after `waitForServer` succeeds. Better still, write to a temporary directory and swap it into place only when `failed === 0`.

### WR-08: The `fixture-approved` gate checks only the English headline, through a source grep

**File:** `scripts/check-phase-1.sh:776-784`
**Issue:** `g_fixture_approved` greps for `headlineEnStatus: "approved"` and never looks at `headlineEsStatus`. `src/features/site-settings/fixture.ts:51` holds `headlineEsStatus: "draft"`, so `--final` can pass while the Spanish headline is still a draft, which contradicts "Silence never approves" (`hero-copy.ts:47-48`). The checks are also plain greps over the source (the same goes for `herocopy-approved`), so a comment, or a type union written as `"approved" | "draft-translation"`, satisfies them.
**Fix:** Check both statuses and match the object-literal assignment, not arbitrary text. For example, run a tiny `node --experimental-strip-types -e` that imports `fixture.ts` and `hero-copy.ts` and asserts `heroFixtureMeta.headlineEsStatus === "approved" && heroFixtureMeta.headlineEnStatus === "approved" && heroCopyMeta.status === "approved"`.

### WR-09: The `pdf-fonts` gate passes with a partial font set

**File:** `scripts/check-phase-1.sh:750-757`
**Issue:** The gate checks the three OFL files by name but passes `assets/fonts-pdf/*.ttf` (whatever exists) to `verify-pdf-fonts.py`. If, for example, only `HankenGrotesk-Regular.ttf` is present, the gate prints PASS. The phase 3 PDF then fails at `Font.register` for Bold, Italic, SemiBold or Mono.
**Fix:** Check the exact six files that `fetch-pdf-fonts.sh` writes:
```bash
for t in FunnelDisplay-SemiBold FunnelDisplay-Bold HankenGrotesk-Regular HankenGrotesk-Bold HankenGrotesk-Italic GeistMono-Regular; do
  [ -f "assets/fonts-pdf/$t.ttf" ] || r="$r falta $t.ttf;"
done
```

### WR-10: Invalid timezone or date values throw and take down the whole hero render

**File:** `src/lib/format.ts:8-14, 17-24, 27-33`; `src/components/site/status-line.tsx:30, 69, 117`
**Issue:** `timezone` and `availableFrom` are free-form DB columns (`types.ts:19-20`) that the admin will edit in phase 2. `Intl.DateTimeFormat({ timeZone: "Bogota" })` throws `RangeError: Invalid time zone specified` (reproduced), and a malformed `availableFrom` throws `Invalid time value`. `StatusLine` calls these formatters unguarded, so one bad save turns `/` into an error page instead of dropping a segment.
**Fix:** Validate `timezone` in the site-settings Zod schema (`z.string().refine(tz => Intl.supportedValuesOf("timeZone").includes(tz) || tz === "UTC")`) and `availableFrom` with `z.iso.date()`. Also make `StatusLine` defensive: wrap the offset and entry-date formatting in a helper that returns `null` on `RangeError`, and skip the segment when it gets `null`.

## Info

### IN-01: The axe runs never audit the lab bar or the Spanish render

**File:** `scripts/capture-lab.ts:251-265`
**Issue:** Every `/lab/hero` axe check passes `capture=1`, which removes `LabBar`, the only navigation on the page (links with `aria-current`, `aria-labelledby` lists). All runs also use the default `lang=en`, so the Spanish hero is never audited.
**Fix:** Add one axe run without `capture=1`, and one with `lang=es`.

### IN-02: Dead branch and stale comment in `headlineNotes()`

**File:** `src/app/lab/hero/page.tsx:45-52`
**Issue:** `heroFixtureMeta.headlineSource` is `"Teo, 2026-10-30"`, so the `includes("docs/copy.md")` branch and its `copyDraft` message can never fire. The comment says the Spanish headline is "Claude's completion at Teo's request (01-04 G2)", but `fixture.ts:3-8` says Teo chose Claude's short version at G3 (01-09).
**Fix:** Remove the branch (and `notes.copyDraft` from both message files), and update the comment.

### IN-03: `availabilityText` has no fallback for an unknown status

**File:** `src/components/site/status-line.tsx:104-119`
**Issue:** The `switch` has no `default`. If the DB ever returns a value outside the union (a new enum value added before the code is updated, or a cast from raw SQL), the function returns `undefined`. `undefined !== null` passes the check on line 39, so a dot with no label is rendered.
**Fix:** Add `default: return null;`, or use an `assertNever` helper.

### IN-04: The `dark` custom variant does not match the `.dark` element itself

**File:** `src/app/globals.css:5`
**Issue:** `(&:is(.dark *))` matches only descendants. A `dark:` utility placed on the element that carries `.dark` (for example `[data-lab-root]`, or `<html>` in phase 2) will not apply.
**Fix:** Use `@custom-variant dark (&:where(.dark, .dark *));`.

### IN-05: `button.tsx` imports `cn` straight from the package

**File:** `src/components/ui/button.tsx:3`
**Issue:** The rest of the codebase imports `cn` from `@/lib/utils`. Two import paths for the same helper make a later swap error-prone.
**Fix:** `import { cn } from "@/lib/utils";`

### IN-06: Token values and contrast verdicts are hard-coded copies

**File:** `src/app/lab/_components/specimens.tsx:10-46, 82-126`
**Issue:** `TOKENS` repeats the values in `globals.css`, already with formatting drift (`0.70` vs `0.7`, `0.30` vs `0.3`), so a later token change would leave the specimen out of date. The `CONTRAST_ROWS` verdicts are Spanish interface prose written inside a component, which goes against the rule that interface text lives in `messages/`. Both are lab-only and get deleted in phase 2.
**Fix:** Read the computed values at runtime, or accept the duplication explicitly until `/lab` is removed.

### IN-07: The section parser can silently drop or misread sections

**File:** `src/features/projects/content-file.ts:27, 34-42`
**Issue:** `sections` is a plain object, so a `## __proto__` heading assigns to the prototype setter and its text disappears. That contradicts "nothing is silently dropped". A `## ` line inside a fenced code block in a case study is also taken as a new section.
**Fix:** Use `Object.create(null)` (or a `Map`), and skip heading detection while inside a fenced code block.

### IN-08: `materialPath` is looser than the documented `NN-vista.webp` shape

**File:** `src/features/projects/content-schema.ts:19-21`
**Issue:** `[^/]+` accepts `..`, `.png` or any other name, while `docs/content/README.md:84` and the gate's `WEBP` regex require `material/<slug>/NN-*.webp`.
**Fix:** `/^material\/[a-z0-9-]+\/\d{2}-[a-z0-9-]+\.webp$/`.

### IN-09: The gate reads front-matter differently from the TS contract

**File:** `scripts/check-phase-1.sh:211-226, 238-245`
**Issue:** PyYAML `safe_load` follows YAML 1.1, so `clientPermission: yes` becomes `True` and `--permission` reports `con-permiso`. The TS contract (yaml 2.x, core schema) rejects that same value. `front_matter()` also takes the first two `---` lines found anywhere in the file, while `splitContentFile` requires line 0.
**Fix:** Require `lines[0].strip() == "---"`, and treat only an exact boolean `true` in the raw YAML text as permission. Alternatively, reuse the TS parser through `node`.

### IN-10: Conflicting policy on whether `material/` is versioned

**File:** `.gitignore:44-45`; `scripts/capture-material.ts:8-9`; `scripts/check-phase-1.sh:554-579`
**Issue:** `.gitignore` says the files "se suben a Blob desde el admin" (never versioned). `capture-material.ts` says the reviewed WebP files are committed after G7, and `material-committed` requires at least three tracked WebP files per slug, which only `git add -f` can produce.
**Fix:** Pick one policy, log it in `docs/decisions.md`, and align the comment and the gate with it. If the files are to be versioned, whitelist `!/material/*/[0-9][0-9]-*.webp`.

### IN-11: Dependency hygiene in `package.json`

**File:** `package.json:39-40, 52-54, 64`
**Issue:** `@types/node ^20` violates vitest 5's peer range (`^22 || >=24`), as flagged in the stack research. `react`/`react-dom` stay pinned at 19.3.0, although the research recommends the 19.3.1 patch (ask Teo). `@testing-library/react` and `@testing-library/jest-dom` are installed but unused (there is no setup file, and the tests use `renderToStaticMarkup`). `yaml` is a devDependency but is imported from `src/features/projects/content-file.ts`, which the phase 2 seed/export is meant to reuse.
**Fix:** Settle these with Teo (dependency changes need his approval). Move `yaml` to `dependencies` if `exportContent()` will import it at runtime.

### IN-12: The HeroC index numbers are announced twice

**File:** `src/components/site/hero/hero-c.tsx:41-48`
**Issue:** An `<ol>` already exposes positions to assistive tech ("1 of 3"), and every item also renders "01", "02", "03" as text.
**Fix:** Use a `<ul>`, or mark `SectionNumber` `aria-hidden` inside this list.

### IN-13: `verify-pdf-fonts.py` crashes on fonts missing tables instead of reporting FAIL

**File:** `scripts/verify-pdf-fonts.py:41, 45`
**Issue:** `font["OS/2"]` and `font["post"]` raise `KeyError` outside the `try`. The script stops with a traceback, and the files after that one are never checked.
**Fix:** Wrap the table reads, e.g. `if "OS/2" not in font: return False, "no OS/2 table"`.

### IN-14: No structural parity check between ES and EN content

**File:** `src/features/projects/content-schema.ts:236-272`
**Issue:** Number parity compares digits only. `techDecisionsEs` can have 2 decisions while `techDecisionsEn` has 3, and `resultsEs`/`resultsEn` can differ in length, without any issue being reported. A translation can add or drop a claim this way.
**Fix:** In `crossFieldIssues`, check that `resultsEs.length === resultsEn.length` and that both `decisions` arrays have the same length.

### IN-15: The lab is gated only on `VERCEL_ENV === "production"`

**File:** `src/app/lab/layout.tsx:11-13`
**Issue:** Any non-Vercel production run (`pnpm start` on a server, another host) serves `/lab` with the draft fixture copy. Previews are reachable as well, which D-02 accepts.
**Fix:** Allow the lab explicitly: `if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview") notFound();`. Or simply delete `/lab` at the start of phase 2, as planned.

### IN-16: The `content-schema` test file loads `docs/content` while Vitest collects the file

**File:** `src/features/projects/content-schema.test.ts` (`describe("docs/content project files")`)
**Issue:** `loadContentDir(dir)` runs in the `describe` body. A single malformed content file throws during collection and hides the results of every synthetic contract test in the file.
**Fix:** Move the `loadContentDir` call into the `it` (or a `beforeAll`), so failures are reported per test.

---

_Reviewed: 2026-11-01T20:07:51Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
