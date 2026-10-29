# Feature Research

**Domain:** Bilingual (en/es) developer portfolio with case studies, data-driven CV (PDF + JSON Resume) and a single-author admin panel
**Researched:** 2026-10-29
**Confidence:** MEDIUM overall (HIGH on Next.js draft-mode mechanics via Context7; MEDIUM where several independent web sources agree; LOW on remote-hiring expectations in Canada/EU, which came almost entirely from vendor blogs)

Scope guard: everything in `docs/backlog.md` (courses, services, testimonials, blog, generic pages, command palette, live GitHub, view counters, guestbook, changelog, admin demo, AI translation, Lenis, Typst, Sentry) is treated as out of scope below. Where a common "portfolio feature" overlaps with a backlog item, it is listed under anti-features for v1 with a pointer to the backlog.

---

## 1. What convinces the two audiences

The project has two readers with different reflexes. The same case study can serve both if it opens with business framing and keeps the technical reasoning in a clearly labelled, skippable section.

| | Small-business / freelance client | Tech recruiter / hiring manager |
|---|---|---|
| Time on page | Skims; reads the summary, looks at screenshots, checks the live site exists | Seconds on first pass, up to ~3 minutes if interested |
| First question | "Has he done something like my business before, and did it work?" | "What did *he* do, what did he decide, and can I verify it?" |
| Evidence that lands | A real site they can click; before/after in plain language; the fact that it is still online | Role boundaries, named trade-offs, how it was tested, a repo or code sample, a live demo |
| Turn-offs | Jargon, developer-centric framing, no way to contact quickly | Vague "we built", invented metrics, tutorial clones, skill bars, broken demos, heavy animation, no mobile |
| Wants from contact | A form or email that works, reply within a day, a way to book a call | Email, LinkedIn, a downloadable CV, GitHub |

Confidence: MEDIUM. Multiple independent sources (Scrimba's hiring-manager guide, the Profy.dev survey of 60+ hiring managers, DoubleYourFreelancing, Grover Web Design's client checklist, dev.to posts) agree on these points. Exact time-on-page figures vary wildly between sources and should be treated as anecdotal.

Key numbers worth keeping in mind (Profy.dev survey, 2021, ~60 React hiring managers and recruiters): 93% would look at a portfolio site if given one; 51% said the absence of one would not lower a candidate's chances. Implication: the site does not get Teo the interview by existing; the case studies and the CV do the work once a human lands there. Do not spend v1 budget on anything that is not a case study, the CV, or the contact path.

---

## 2. Anatomy of a convincing case study (`/projects/[slug]`, `/es/proyectos/[slug]`)

This is the Core Value. The structure below is the consensus shape (Problem, Role, Approach/Decisions, Challenges, Result, retrospective) mapped onto the existing `projects` columns. Nothing here needs a schema change.

### Recommended page order

| # | Block | Source field(s) | Rule |
|---|---|---|---|
| 0 | Header: title, tagline, mono meta row (dates, type, stack, links) | `title_*`, `tagline_*`, `started_at`, `finished_at`, `project_skills`, `live_url`, `repo_url` | Meta row in Geist Mono. If `live_url` is null, render a localized "Internal tool, no public URL" label from `messages/*.json` instead of hiding the slot. |
| 0b | Summary box (the "first 100 words"): one line problem, one line my role, up to 3 headline metrics | `problem_*` (first sentence), `role_*`, `metrics[0..2]` | Recruiters decide whether to keep reading here. Metrics are optional; if `metrics` is empty the box shows problem + role only. |
| 0c | Cover image 16:10 | `cover_image` | Real screenshot, real `alt`. |
| 01 | Problem | `problem_*` | 2 to 3 sentences, written from the client's point of view. What existed before. |
| 02 | My role | `role_*` | Explicit boundaries: solo or team, who designed, who owned backend, what was inherited. This is the single most requested thing by hiring managers and the one most portfolios blur. |
| 03 | Solution | `solution_*` + `case_study_*` (Tiptap) + `media` | Short paragraph, then rich text with inline screenshots. Media gallery as a static list, not a carousel. |
| 04 | Results | `results_*` (bullets) + `metrics` | Only numbers that exist in `docs/content/`. Qualitative results are fine ("client now updates the catalog without me"). |
| 05 | Technical decisions | `tech_decisions_*.decisions[]` rendered as numbered entries, with `<Marginalia>` beside the matching paragraph on desktop | 2 to 4 decisions, each 40 to 80 words: what I chose, what I rejected, why. |
| 05b | Trade-offs and validation | `tech_decisions_*.tradeoffs`, `.validation`, `.aiTools[]` | "How I verified it" (tests, Lighthouse, client review) is a differentiator almost nobody includes. AI tools listed plainly as tools, in mono. |
| 06 | Footer: prev/next project, CTA to `/contact` | — | One accent element per view; the CTA or the active section number, not both. |

### Length and density
- Target 400 to 800 words of prose per case study, plus decisions. Sources converge on "a few hundred words, scannable" and against "a textbook". Confidence MEDIUM.
- Every section is optional in rendering: missing content hides the section (project rule). A project with only problem + role + solution + one decision is still publishable.
- Headings are numbered (01, 02...) per DESIGN.md, which doubles as a scannability device for the 3-minute reader.

### Metrics without inventing them
- Only metrics present in `docs/content/`. Store the provenance inside the label: `{ label: "Lighthouse mobile, Oct 2026", value: "97" }`. This needs no schema change and makes the number auditable.
- Prefer before/after pairs where honest ("page load 6.1 s to 1.8 s"). Never round up; never aggregate across clients.
- If a project has no numbers, do not pad with "improved UX". Use a concrete qualitative outcome instead, or leave `metrics` empty and let the summary box show problem + role.
- Never show a metric the client did not agree to publish. `docs/copy.md` already tracks "permiso del cliente: sí/no" per project.

### Project with no public URL (Sistema de Gestión de Inventario)
Accepted patterns from NDA/internal-work guidance (confidence LOW, blogs and forums, not legal advice):
1. State it up front in the meta row ("Internal tool, no public URL") so nobody hunts for a link.
2. Screenshots with fictional seed data; alt text and a caption say so ("Screenshot with sample data").
3. Let the decisions carry the weight: domain model, roles and permissions, transaction flow, reporting. This is where an internal tool is actually *more* convincing than a brochure site.
4. Close with "walkthrough available on a call" linking to `/contact`. Not a password gate (adds a feature, adds friction, and the data model has no field for it).
5. Repo link only if it is really public and really his.

The App de Finanzas Personales follows the same pattern with `repo_url` set if the repo is public.

---

## 3. What the Canada/EU remote-hiring audience expects

Confidence LOW to MEDIUM. Remote-hiring sources were vendor marketing (Terminal, Lemon.io, Arc, Index.dev); CV-format sources were career blogs. Treat as consistent practitioner opinion, not data.

| Expectation | Evidence level | How v1 answers it | Entity / route |
|---|---|---|---|
| Location and timezone stated plainly, with overlap in hours | MEDIUM (every source mentions overlap; 2 to 4 h is the usual bar) | Status line in hero: "Available from Nov 2026 · Medellín, UTC-5 · overlaps with Toronto and Madrid". Compute overlap from `timezone` against America/Toronto and Europe/Madrid so DST changes stay correct. | `site_settings.timezone`, `.location`, `/` |
| Availability, with a date if not immediate | MEDIUM | `availability_status` (open / from_date / closed) + `available_from`. Also shown on `/contact` and in the PDF header line. | `site_settings`, `/`, `/contact`, PDF |
| Remote-readiness signal | LOW | One sentence in About: works remotely, in English and Spanish, async by default, overlap with Eastern and Central European hours. Also 4 years remote at Sofka shows in `experiences.location`. | `site_settings.bio_*`, `experiences.location` |
| Language proficiency with CEFR level | MEDIUM (EU sources agree; "advanced English" is ambiguous) | **Gap:** there is no `languages` field anywhere in the data model. The PDF and JSON Resume both need "Spanish, native; English, B2". Recommend a `languages` jsonb on `site_settings` (`[{ language, fluency }]`, JSON Resume shape). This is a schema change and needs Teo's approval. | `site_settings` (new field), PDF, `/resume.json` |
| Downloadable CV, PDF, 1 to 2 pages, reverse chronological | HIGH (universal) | Generated from data; English default, Spanish variant. Filename `Mateo-Jaramillo-Frontend-Developer-EN.pdf`. | `resume_versions`, footer link, `/about` |
| ATS-parsable PDF | MEDIUM (consensus on single column, real text layer, standard headings; PDF vs DOCX disputed) | Single column, no tables, no header/footer boxes, no icons, plain bullets, straight quotes, standard headings (Experience, Education, Skills, Languages). Embedded TTF with a Unicode text layer so ñ and tildes survive copy/paste. **Test it:** a Vitest that renders the PDF and runs it through a text extractor asserting "Medellín", "diseño" and the section headings come back intact. | PDF generation |
| No photo, no date of birth, no marital status | HIGH for Canada (human-rights law), MEDIUM for EU tech (varies by country; France and Nordics lean no-photo) | No photo in either language. The Spanish CV targets Spain/LatAm recruiters who are used to photos but do not require them in tech. | PDF |
| Work authorization / contract type | Conflicting advice | Do not state on the site. For freelance, "available as an independent contractor" is reasonable in About; for employment, leave it to conversation. Ask Teo. | `site_settings.bio_*` |
| LinkedIn and GitHub as text URLs | HIGH | Footer + PDF + JSON Resume profiles. | `site_settings.github_url`, `.linkedin_url` |
| JSON Resume | LOW as an expectation (niche, developer-recruiter audience), but cheap and in scope | Serve from own domain. The official hosting is a GitHub Gist; `/resume.json` on your own domain is a self-hosting convention. Schema has no localization, so serve English at `/resume.json` and Spanish via `?lang=es` on the same route handler rather than a new path. Validate the output against the v1 schema in a test. | Route handler reading `site_settings`, `experiences`, `education`, `skills`, `projects` |

### Entity to JSON Resume mapping
| JSON Resume | Source |
|---|---|
| `basics.name/label/email/url/summary/location/profiles` | `site_settings.name`, `.headline_*`, `.email`, site URL, `.bio_*`, `.location` + `countryCode: "CO"`, `.github_url`/`.linkedin_url` |
| `work[]` | `experiences` (published, visible, ordered): `name=company`, `position=role_*`, `startDate/endDate`, `highlights=bullets_*`, `keywords` from `experience_skills` |
| `education[]` | `education`: `institution`, `area=program_*`, `studyType`, dates, `summary=status_*` |
| `skills[]` | `skills` grouped by `category` as `name`, individual skills as `keywords` |
| `languages[]` | new `site_settings.languages` (see gap above) |
| `projects[]` | `projects`: `name=title_*`, `summary=tagline_*`, `highlights=results_*`, `keywords` from `project_skills`, `url=live_url`, `roles=[role_*]`, `type` |
| `meta` | `canonical` = the route URL, `version` = `resume_versions.version`, `lastModified` |

---

## 4. Admin panel table stakes (`/admin`, single author)

Headless-CMS vendors (Ibexa, DatoCMS, Strapi, Pantheon) converge on the same minimum. Confidence MEDIUM. Mapped to the five entities plus Education.

| Feature | Why expected | Complexity | Notes |
|---|---|---|---|
| List view per entity with status, visible, order, updated_at | Baseline orientation | LOW | TanStack Table, compact rows (DESIGN.md §8). Filter by status. |
| Draft / published as an explicit action, not a checkbox buried in the form | Prevents accidental publishing; vendors all separate "save" from "publish" | LOW | Two buttons: Save draft, Publish. Publish = status change + `updateTag` + `exportContent`. Unpublish is the reverse. |
| `visible` toggle independent of status | Hide a published item temporarily without demoting it to draft | LOW | Inline switch in the list. |
| Manual ordering | Projects and experience are curated, not chronological | MEDIUM | dnd-kit sortable list in the entity list view; persist `order` for the whole list in one Server Action. Keyboard-accessible by default with dnd-kit. |
| Side-by-side EN/ES editing | The single most cited translation UX pattern: source on the left, target on the right, same scroll | MEDIUM | Two-column form on desktop for every `_en`/`_es` pair, stacked on mobile. Tabs are the fallback, not the default; tabs hide missing translations. Show a per-field "ES empty" marker. |
| Missing-translation indicator | Public site falls back to English; author needs to see where | LOW | Count of empty `_es` fields in the list row and a badge in the form. |
| Preview of a draft on the real public route | Authors do not trust a form; they trust the page | MEDIUM | Next.js Draft Mode: a Server Action calls `draftMode().enable()` and redirects to `/projects/[slug]`. With `cacheComponents`, every `'use cache'` function re-executes while the draft cookie is present and nothing is written to the cache, so queries only need to check `draftMode().isEnabled` to include `status = 'draft'` rows. `enable()`/`disable()` must run in a Route Handler or Server Action, never inside a cached scope. Show a thin "Preview" bar with an exit action. (Context7, Next.js docs, confidence HIGH.) |
| Image upload with alt text in both languages | Case studies live on screenshots; alt is mandatory | MEDIUM | Vercel Blob; `media[]` already carries `altEn`/`altEs`. Enforce an alt before save. Show dimensions and a 16:10 warning, no cropping tool. |
| Validation with field-level errors | Zod on the server is a project rule; author needs to see why save failed | LOW | RHF + Zod, same schema client and server. |
| Unsaved-changes guard and Cmd+S | DESIGN.md asks for it; losing a 600-word case study is the worst admin experience | LOW | `beforeunload` + route-change guard; Cmd+S triggers Save draft. |
| Immutable slug once published | Rule in data-model.md; broken URLs kill SEO and recruiter links | LOW | Slug field read-only after first publish; auto-generated from `title_en` before that. |
| Repeatable "technical decisions" editor | Decisions are structured, not prose | MEDIUM | Field array for `decisions[]` (title + body), plus `tradeoffs`, `validation`, `aiTools[]` (tag input). Keep it structured; do not put decisions in Tiptap. |
| Linking projects to skills and experiences | Stack chips, JSON Resume keywords | LOW | Multi-select against `skills`; `experience_projects` as multi-select on the experience form. |
| Site settings as a single form | One row, many fields | LOW | Group: identity, status line, SEO, links, Now (Tiptap). |
| Resume generation with history | Author wants to regenerate and keep the previous file | MEDIUM | "Generate PDF (en / es)" button → renders, uploads to Blob, inserts `resume_versions`. List with download links. `overrides` as a small key/value editor for PDF-only tweaks (summary wording, title). |
| Content export after publish | Already a project rule (`exportContent`) | LOW | Status toast "Exported" after publish; failures surface, never swallowed. |
| Session check everywhere | Security rule | LOW | `proxy.ts` cookie check, `getSession` in layout and in every action. |

Not table stakes for a single author (skip): revision history / rollback (the JSON export is the backup), scheduled publishing, workflow states beyond draft/published, multi-user roles, comments, in-place visual editing (DatoCMS-style click-to-edit; split-pane iframe preview is what Strapi puts behind a paid tier, and a plain Draft Mode redirect gets 90% of the value).

---

## 5. Contact flow (`/contact`, `/es/contacto`)

Confidence MEDIUM for anti-spam (consistent across Formspree, Basin, Flavio Copes, dev.to posts); LOW for Cal.com link vs embed (no benchmark exists, reasoning from script weight).

| Feature | Why expected | Complexity | Notes |
|---|---|---|---|
| Three fields: name, email, message | Already in copy; fewer fields convert better for a portfolio | LOW | No phone, no budget, no company, no "how did you hear". |
| Intro line with reply promise and languages | Sets expectations; the copy already says "I reply within a day, in English or Spanish" | LOW | From `messages/*.json` (UI text) or `site_settings` if Teo wants it editable. |
| Honeypot with a realistic name, validated server-side | First layer, zero friction | LOW | Field named `website` or `company`, visually hidden, `tabindex=-1`, `autocomplete=off`. |
| Time-to-submit check | Bots submit in under 2 s | LOW | Hidden timestamp field or server-issued token; reject under ~3 s. |
| Per-IP rate limit | Second layer; 3 to 5 per hour is the common setting | LOW | Upstash sliding window keyed on hashed IP; store `ip_hash` as already modelled. Friendly message on limit, never a 500. |
| No CAPTCHA | Adds friction for every real visitor; honeypot + rate limit is enough at this traffic | — | Anti-feature. Revisit only if spam gets through. |
| Email to Teo via Resend with `reply-to` set to the sender | So he can answer from his inbox | LOW | Sandbox sender works for sending to his own address; a verified domain is needed before any auto-reply to visitors. |
| Persist message in `contact_messages` | Resilience if email fails; table already exists | LOW | Insert first, send second; if send fails, message is not lost. |
| Success state inline, localized | Copy already defines it | LOW | Keep the user on the page; no redirect. |
| Direct email with click-to-copy, plus LinkedIn | Some people (most recruiters) never fill forms; eduardbodak.com uses copy-to-clipboard | LOW | Mono text, copy button, `mailto:` fallback. |
| Cal.com as a plain link, not an embed | Inline/popup embeds load a third-party script on first paint; Lighthouse ≥ 95 mobile is a gate | LOW | `site_settings.calendar_url`, rendered only when set. Opens in new tab. Env/URL requested in phase 4 per CLAUDE.md. |
| Contact messages list in admin | Table has `read_at`, so an inbox is implied | LOW | Read-only list with mark-as-read. P2: email already delivers the message; build only if phase 3 has slack. |

---

## Feature Landscape

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Project list on `/` as dated entries (3 to 5 projects) | Every source: projects first, above the fold or one scroll down | LOW | `EntryList`; `featured` controls home, full list is the same four in v1 |
| Case study page per project with the anatomy in §2 | Core Value; hiring managers want problem, role, decisions, result | HIGH | Content quality gates this, not code |
| Live link and repo link per project where they exist | "A project nobody can see does not exist" | LOW | Explicit "no public URL" state for the inventory system |
| Real screenshots with real alt text | Clients look at pictures first | MEDIUM | Blob upload in admin; 16:10; no lorem placeholders |
| About page: short bio, how he works, stack with context (years), experience timeline, education | Recruiters confirm seniority; clients confirm a human | MEDIUM | `skills.years_used` replaces skill bars; `experiences` as dated entries; `education` minimal |
| Downloadable CV (PDF) linked from footer and About | Universally expected by recruiters | HIGH | Generated from data, en/es, ATS rules in §3 |
| Contact page with working form and direct email | Both audiences need a path; recruiters prefer email/LinkedIn | MEDIUM | §5 |
| GitHub and LinkedIn links | Minimum social proof | LOW | Footer and About |
| Language switch that keeps the current page | Bilingual site that drops you to the home page on switch feels broken | MEDIUM | next-intl localized pathnames; `LangSwitch` maps `/projects/x` ↔ `/es/proyectos/x` |
| hreflang, per-locale titles/descriptions, OG image | Recruiters share links in Slack; Google must not merge the locales | MEDIUM | From `site_settings.seo_*` and per-project fields; `alternates.languages` in metadata |
| Sitemap and robots | SEO hygiene | LOW | Both locales, published projects only |
| Mobile-first, fast, accessible | Hiring managers check on phones; Lighthouse ≥ 95 is the project gate | MEDIUM | Already constrained by CLAUDE.md |
| Dark mode following system, with toggle | Expected on developer sites; light default per DESIGN.md | LOW | No-flash inline script; View Transition on toggle is in the motion budget |
| 404 page in both locales | Dead links are a listed red flag | LOW | Localized, links back to projects |
| Admin: CRUD for all six entities with draft/publish, visible, order | Required to meet "content loaded only from admin" gate | HIGH | §4 |
| Admin: single login, no sign-up | Security rule | LOW | Better Auth |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Technical decisions as `<Marginalia>` with explicit trade-offs and "how I verified it" | Almost no portfolio names what was rejected and how the result was checked; this is exactly what a hiring manager probes in interview | MEDIUM | Already modelled in `tech_decisions_*`; rendering is the work |
| Role boundaries stated per project | Separates "I built this" from "I was on the team" and earns trust with both audiences | LOW | `role_*` rendered as its own numbered section, never folded into Solution |
| Live status line (availability, city, UTC-5, computed overlap with Toronto and Madrid) | Answers the three remote-hiring questions before the first scroll | LOW | Computed from `site_settings`; DST-safe |
| CV and JSON Resume generated from the same data as the site | No drift between site and CV; a recruiter-facing proof of fullstack work | HIGH | Already in scope; history in `resume_versions` |
| Spanish version that reads native, not translated | Opens LatAm and Spain; most bilingual portfolios have a weak second language | MEDIUM | Side-by-side editing in admin keeps parity visible; copy is Teo's |
| "Now" section with a date | Signals the site is alive (stale content is a listed red flag) | LOW | `site_settings.now_*`, dated with `updated_at`; short and on `/about` |
| Honest AI-tools disclosure per project | Positions AI as a tool with tests and review, which is what senior-leaning teams want to hear | LOW | `tech_decisions_*.aiTools[]` in mono; one line, no essay |
| Public source of the portfolio itself ("View source" in footer) | The repo is already public; a recruiter can read the admin, tests and Server Actions without a demo | LOW | A link, nothing more. The admin demo and the self case study stay in backlog |
| Metrics with provenance in the label | Auditable numbers stand out against the industry's invented "+300%" | LOW | Convention, no code |
| Export of published content as JSON after every publish | Operational safety and a quiet credibility signal in the repo | LOW | Already a rule |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Skill bars / percentage rings | "Shows skill level" | Universally listed as a red flag; meaningless numbers | `years_used` and the projects that used the skill |
| Testimonials section | Social proof | In backlog; requires client permission workflow and content that does not exist yet | Results written from the client's point of view inside the case study |
| Pricing / packages | Clients ask | Teo's decision: no prices anywhere | "Tell me what you're building" on `/contact` |
| Blog / articles | "Shows thinking" | Backlog; empty or stale blogs hurt more than none | Decisions and Now section carry the "thinking" signal |
| Inline Cal.com embed or floating booking button | Keeps the visitor on page | Third-party script on first paint vs Lighthouse ≥ 95 gate; floating buttons are a listed design tell | Plain link, new tab |
| CAPTCHA on the contact form | "Stops spam" | Friction for every real visitor; at this traffic honeypot + timing + rate limit is enough | §5 layers; revisit if spam passes |
| Auto-reply email to visitors | "Feels professional" | Needs a verified sending domain and invites bounce/spam-reputation issues; adds a Resend setup step before phase 4 | Inline success message with the reply promise |
| Embedded PDF viewer for the CV | "Preview before download" | Heavy iframe, poor on mobile, no SEO value | Direct download link with filename and size; the About page is the preview |
| Email-gated CV download | Lead capture | Recruiters leave; feels like marketing | Free download |
| Screenshot carousel / autoplay video | "Shows more" | Carousels are prohibited by DESIGN.md; autoplay hurts LCP and a11y | Static vertical gallery; `media.type = 'video'` only as click-to-play |
| Animated counters for metrics | "Impact" | Prohibited design tell; draws attention to small numbers | Plain mono figures with provenance |
| Live GitHub graph / latest commits | Developer credibility | Backlog; external API, cache, failure modes | "View source" link and `repo_url` per project |
| Multi-step admin wizards | "Guides the author" | One author who knows the fields; wizards slow down edits | Single long form with sections, side-by-side locales |
| Tiptap for every text field | Consistency | Rich text in `problem`/`role`/`results` encourages formatting drift and complicates PDF/JSON Resume output | Tiptap only for `case_study_*` and `now_*`; plain text/arrays elsewhere, as modelled |
| Revision history for content | Safety | Over-engineering for one author; JSON export already restores | `exportContent` + `pnpm seed --from-content` |
| Automatic AI translation button | Speed | Backlog; and the Spanish must read like Teo | Side-by-side editing with an "ES empty" marker |
| Work-authorization statement on the site | Some Canadian CV guides suggest it | Advice conflicts; it is a conversation, not a banner | Nothing on the site; optionally "independent contractor" in About if Teo wants |
| Password-gated case study for the internal tool | NDA pattern | Adds a feature and a field; the project is Teo's own | "Internal tool, sample data" label + walkthrough on request |

---

## Feature Dependencies

```
Real content in docs/content/ (phase 1 gate)
    └──requires──> Seed with real data
                       └──requires──> Admin CRUD (projects, experience, skills, education, settings)
                                          ├──requires──> Auth (single admin) + session checks
                                          ├──requires──> Blob upload  ──> media[] with alt  ──> Case study gallery
                                          └──requires──> Draft/publish + visible + order  ──> Public queries (published only)

Case study page (/projects/[slug])
    ├──requires──> projects row published + cover_image + at least problem/role/solution
    ├──requires──> project_skills (stack chips)
    ├──requires──> tech_decisions_* (Marginalia)
    └──enhances──> Contact CTA

Status line (hero)
    └──requires──> site_settings.availability_status / available_from / timezone / location

CV PDF (en/es)
    ├──requires──> experiences, education, skills, site_settings (headline, bio, email, links)
    ├──requires──> languages field (GAP: not in data model)
    ├──requires──> static TTF fonts with latin-ext
    └──produces──> resume_versions (history, download link in footer/About)

/resume.json (+ ?lang=es)
    └──requires──> same entities as the PDF, plus projects; schema validation test

Admin preview
    └──requires──> Draft Mode server action + queries that honour draftMode().isEnabled

Language switch keeping the page
    └──requires──> next-intl localized pathnames for /projects ↔ /es/proyectos, /about ↔ /es/sobre-mi, /contact ↔ /es/contacto

Contact form
    ├──requires──> Upstash (rate limit), Resend (delivery)  [accounts created in phase 4]
    ├──requires──> contact_messages table (insert before send)
    └──enhances──> Cal.com link (site_settings.calendar_url, optional)

Dark mode toggle ──conflicts──> CSP without unsafe-inline for the no-flash script (hash the inline script)
Cal.com inline embed ──conflicts──> Lighthouse ≥ 95 gate (use a link)
Tiptap in short fields ──conflicts──> PDF and JSON Resume generation (keep plain text)
```

### Dependency Notes

- **Content gates everything:** the admin cannot be verified and the case studies cannot be designed against lorem ipsum. Phase 1's "material loaded" gate is the real critical path.
- **Admin before public site:** the public pages only read `published AND visible`, so the publish action must exist before any public route can show real content. This matches the project's phase order (3 before 4).
- **PDF needs the languages field:** flag the schema addition early (phase 2 migration) so the PDF in phase 3 does not stall on a question.
- **Preview depends on query design:** every public query in `queries.ts` must branch on `draftMode().isEnabled` from day one; retrofitting means touching every query.
- **Contact depends on external accounts:** code it behind env checks with clear messages (project rule) so phase 4 does not block on account creation.

---

## MVP Definition

### Launch With (v1)

- [ ] Four case studies with the §2 anatomy, real screenshots, decisions, provenance-labelled metrics, explicit "internal tool" handling. The Core Value.
- [ ] Home with status line and dated project entries.
- [ ] About with bio, Now, stack with years, experience, education; CV download links (en/es).
- [ ] Contact with form (honeypot, timing, rate limit, Resend, DB insert), direct email with copy, LinkedIn, optional Cal.com link.
- [ ] CV PDF en/es from data, ATS-safe, with a text-extraction test; `/resume.json` with `?lang=es` and schema validation.
- [ ] Admin: CRUD for six entities, draft/publish, visible, drag ordering, side-by-side EN/ES with empty markers, Blob upload with alt, Draft Mode preview, Cmd+S, unsaved guard, resume generation with history.
- [ ] i18n with page-preserving switch, hreflang, per-locale SEO, sitemap, 404.
- [ ] Dark mode, motion budget, WCAG AA, Lighthouse ≥ 95.

### Add After Validation (v1.x)

- [ ] Contact messages inbox in admin (mark as read) once there are real messages to read.
- [ ] Per-project "related experience" block using `experience_projects` if the Sofka projects become publishable.
- [ ] A "what I would do differently" line per case study if Teo wants it (fits in `tradeoffs` today; could become its own field).

### Future Consideration (v2+)

Everything in `docs/backlog.md`. Nothing from that list is promoted here.

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Case study page (full anatomy) | HIGH | HIGH | P1 |
| Technical decisions + trade-offs + validation (Marginalia) | HIGH | MEDIUM | P1 |
| Explicit role section | HIGH | LOW | P1 |
| Project screenshots with alt (Blob) | HIGH | MEDIUM | P1 |
| Status line with computed overlap | HIGH | LOW | P1 |
| CV PDF en/es, ATS-safe | HIGH | HIGH | P1 |
| Admin CRUD with draft/publish/visible/order | HIGH (enables everything) | HIGH | P1 |
| Side-by-side EN/ES editing | MEDIUM | MEDIUM | P1 |
| Draft Mode preview | MEDIUM | MEDIUM | P1 |
| Contact form with layered anti-spam | HIGH | MEDIUM | P1 |
| Direct email + copy + LinkedIn on contact | HIGH | LOW | P1 |
| Language switch keeping page + hreflang | HIGH | MEDIUM | P1 |
| `/resume.json` | LOW | LOW | P1 (in scope, cheap) |
| Languages field (CEFR) in settings | MEDIUM | LOW | P1 (needs approval) |
| Now section | MEDIUM | LOW | P1 |
| "View source" footer link | MEDIUM | LOW | P1 |
| Cal.com link | MEDIUM | LOW | P2 (when URL exists) |
| Contact inbox in admin | LOW | LOW | P2 |
| Resume `overrides` editor | LOW | LOW | P2 |
| Metrics provenance convention | MEDIUM | none | P1 (convention) |

---

## Competitor Feature Analysis

Reference sites named in PROJECT.md, reviewed for structure only (finethought.com.au was not fetched in this pass).

| Feature | eduardbodak.com | antfu.me | Our Approach |
|---------|-----------------|----------|--------------|
| Home structure | Hero, 3 selected works, positioning line, services, closing line, CTA to /work | Short bio, work listed as text lines with inline links, activity links, "find me on" | Hero with status line, numbered sections, projects as dated entries, short about teaser, contact CTA |
| Project entry | Title + media + "View" link; detail pages per project | Text links to repos, no case studies | Date, title, one context line, stack in mono; full case study per project |
| Location / timezone | "Germany / Remote Worldwide" + live local clock in contact panel | None | City, UTC offset, computed overlap with two target cities, availability |
| Contact | Email with click-to-copy, social links, pricing in the same panel | Email + social row, sponsorship | Form + click-to-copy email + LinkedIn + optional Cal link; no pricing |
| CV | None | None | PDF en/es + JSON Resume, generated from data |
| Language switch | EN/DE toggle | None | EN/ES with localized pathnames |
| Services / pricing | Yes, with price ranges | No | No (decided); services in backlog |

Takeaway: neither reference ships a CV or structured case studies. Shipping both, with decisions and provenance, is the differentiation; the visual direction is already fixed by DESIGN.md.

---

## Open Questions for Teo (surface in requirements)

1. Add `languages` (CEFR) to `site_settings`? Needed by the PDF and JSON Resume; schema change.
2. State "independent contractor" availability in About, or keep contract type out of the site?
3. Should the metrics provenance live in the label (no schema change) or as an optional `note` field?
4. Client permission status per project: which of ManuJ and EcoExport allow screenshots and numbers?
5. Is the Finance app repo public? Determines `repo_url` and how much the case study can lean on code.

---

## Sources

Confidence tiers come from `gsd_run query classify-confidence`: unverified websearch = LOW, cross-verified websearch = MEDIUM, Context7 = MEDIUM (treated as HIGH here only for the Draft Mode mechanics because it is first-party documentation).

Case studies and hiring managers (MEDIUM, cross-verified)
- Scrimba, "How to Build a Web Developer Portfolio That Gets You Hired": https://scrimba.com/articles/how-to-build-a-web-developer-portfolio-that-gets-you-hired
- Profy.dev survey of 60+ hiring managers (via dev.to): https://dev.to/profydev/this-survey-among-60-hiring-managers-reveals-don-t-waste-your-time-on-a-react-portfolio-website-17ge
- dev.to, "Recruiters aren't clicking your portfolio": https://dev.to/dev_tips/recruiters-arent-clicking-your-portfoliotheyre-looking-here-instead-2884
- GreatFrontEnd, frontend portfolio guide: https://www.greatfrontend.com/blog/frontend-developer-portfolio
- Artisan Talent, "Does your portfolio show the ROI of your work?": https://creative.artisantalent.com/portfolio-show-value
- Lettercounter, portfolio description length: https://lettercounter.org/blog/portfolio-description-length/

Freelance clients (MEDIUM)
- DoubleYourFreelancing, "Important portfolio": https://doubleyourfreelancing.com/important-portfolio/
- dev.to, "Stop building portfolio projects for other developers": https://dev.to/xandertaylor/stop-building-your-portfolio-projects-for-other-developers-build-them-for-clients-2igb
- Grover Web Design, how clients evaluate a portfolio: https://groverwebdesign.com/news/how-to-evaluate-a-web-development-portfolio-10-critical-factors-every-client-should-know/
- Webflow, freelance portfolio guide: https://webflow.com/blog/freelance-portfolio

NDA / no public URL (LOW)
- freelancermap, NDA-protected work in portfolios: https://www.freelancermap.com/blog/can-i-share-nda-protected-work-on-my-portfolio-tips-and-advice/
- Skillhub, "The NDA Trap": https://skillhub.com/blog/digital-portfolio-building-under-nda
- Filter Digital, showcasing confidential work: https://medium.com/filterdigital/can-you-keep-a-secret-how-to-showcase-confidential-work-c93825ec5643

Remote hiring, Canada/EU (LOW; vendor content)
- Index.dev, Europe/US overlap: https://www.index.dev/blog/europe-us-time-zone-overlap-remote-teams
- Jobrise, remote software engineer jobs from Canada: https://jobrise.io/de/blog/remote-software-engineer-jobs-from-canada-2026/
- Asanify, hiring developers in Canada: https://asanify.com/blog/hiring-in-canada/hire-software-developer-in-canada-2025-guide/

CV conventions (MEDIUM for Canada no-photo/no-age; LOW elsewhere)
- Monster, Canadian resume format: https://www.monster.com/career-advice/resume/canadian-resume-format
- ResumeGeni, Canadian resume incl. bilingual rules: https://resumegeni.com/blog/how-to-write-resume-canada
- WelcomeAide, Canadian resume for newcomers: https://welcomeaide.com/vi/blog/canadian-resume-format-newcomers-2026
- Migaku, French CV photo rules: https://migaku.com/blog/language-fun/how-to-write-a-french-cv-format-photo-rules-and-mistakes-to-avoid
- CVOwl, Europass trends: https://www.cvowl.com/blog/europass-cv-trends-across-europe
- LiveCareer UK, language levels on a CV: https://cdn-images.livecareer.co.uk/cv/language-skills

ATS-friendly PDF (MEDIUM)
- Jobscan, ATS-friendly templates: https://jobscan.co/blog/20-ats-friendly-resume-templates/
- Enhancv, ATS-friendly fonts: https://enhancv.com/blog/ats-friendly-fonts
- ATS Verification, format guide: https://atsverification.com/blog/ats-friendly-resume-format-guide-2026/
- AIResume.guru, special characters that break ATS: https://airesume.guru/blog/special-characters-that-break-ats-what-to-avoid-on-your-resume

JSON Resume (MEDIUM)
- Schema reference: https://jsonresume.org/schema
- Hosting docs: https://docs.jsonresume.org/hosting
- Getting started: https://jsonresume.org/getting-started

Admin / CMS UX (MEDIUM)
- Ibexa, translations management (side-by-side): https://doc.ibexa.co/en/5.0/multisite/translations_management/translations_management_guide/
- DatoCMS, visual editing: https://www.datocms.com/docs/general-concepts/visual-editing.md
- Strapi, live preview: https://strapi.io/blog/introducing-live-preview-client-library
- Rangle, headless CMS playbook, live preview: https://tbw.rangle.io/headless-cms-playbook/authoring-experience/live-preview

Next.js Draft Mode with Cache Components (HIGH, first-party via Context7)
- Draft Mode guide: https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/draft-mode.mdx
- `use cache` directive, Draft Mode constraints: https://github.com/vercel/next.js/blob/canary/docs/01-app/03-api-reference/01-directives/use-cache.mdx

Contact form and anti-spam (MEDIUM)
- Formspree, frontend-only spam filtering: https://formspree.io/blog/frontend-spam-filtering/
- Basin, six spam prevention strategies: https://usebasin.com/blog/six-form-spam-prevention-strategies-you-can-deploy-today
- Flavio Copes, rate limits and bots: https://flaviocopes.com/courses/forms/rate-limits-and-bots/
- Splitforms, server-side spam checklist: https://splitforms.com/blog/server-side-form-spam-protection-checklist
- Cal.com embed options: https://cal.com/docs/core-features/embed/adding-embed-to-your-webpage

Reference portfolios (fetched 2026-10-29)
- https://eduardbodak.com
- https://antfu.me

---
*Feature research for: bilingual developer portfolio with case studies, data-driven CV and single-author admin*
*Researched: 2026-10-29*
