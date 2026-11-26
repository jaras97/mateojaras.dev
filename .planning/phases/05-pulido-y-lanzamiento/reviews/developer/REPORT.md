Spawned by: orchestrator (Agent, general-purpose), 2026-11-26

**Summary**

The site is well built where a developer looks first. The HTML structure is clean and the headings are in order. It has skip links, visible focus, working dark mode and no console errors. It doesn't scroll sideways at 390 px and its security headers are strong (CSP, HSTS, `frame-ancestors 'none'`). hreflang and canonical tags are correct, and unknown slugs return a real 404. The case studies are unusually honest: they say what isn't built and what hasn't been checked.

The weak points are presentation, not engineering. The public repo's README is still the create-next-app boilerplate. The case study pages contain a few rough strings: literal Markdown backticks, Spanish labels on English pages, and "STATE.md" in a stat caption. The work list is text-only and in no clear order. There are also some timeline inconsistencies that a careful reader will notice.

**Task 1: What does he do, and for whom?**

From the home page fold only: he is a full stack developer who uses AI coding agents. He builds whole products, from the database to the interface, and stresses tests. He is in Medellín, works in UTC-5 and is pitching to clients in Toronto and Madrid time zones.

The fold never says who he builds for. At 1440 px the fold shows only the headline, a status line and "Let's talk"; the Work list starts at about y=936. After exploring, my answer got clearer: he builds internal tools and small-business systems for Colombian SMEs (a pawn shop, a beauty salon, a jewelry store, an exporter). Before that he spent 4 years as a frontend developer at Sofka. So the "for whom" is small businesses that need a complete product. The site shows that through the projects, but the hero never says it.

**Task 2: Case study (Prendo, EN at 1440 and 390; also ManuJ in ES)**

- **Problem:** a compraventa runs two businesses that are measured differently. In the first version, one shared cash register and stock stored as a running balance let the cash drift out of balance without anyone noticing.
- **What he did:** he designs and builds it end to end (domain, data model, API, interface and tests), working with coding agents under specs, decision records and review gates.
- **Result:** honestly stated as "in development … no clients using it." The stats are development facts: 38 ADRs, 767 test files, 9/16 roadmap phases.
- **Standout decision:** an insert-only cash ledger with balances derived from it, plus stock derived from the kardex. I would trust this. It is the right pattern for money and inventory: it can be audited, mistakes are fixed with an adjustment document instead of an edit, and the page names the trade-off (more documents and more derived queries).
- **Weaker decision:** the multi-tenant isolation (forced row-level security per company) is presented as "an active roadmap requirement, not a property already validated." That is honest, but it means the riskiest part of a multi-tenant SaaS is unproven.
- **ManuJ (ES):** "Elegí Supabase porque su servidor MCP hacía más sencillo trabajar con el agente" ("I chose Supabase because its MCP server made it easier to work with the agent") is a weak technical justification for a backend choice.

**Task 3: Contact path**

- **EN:** "Let's talk" on the home page goes to /contact. The form has Name, Email and Message, plus "Or write directly" with mailto and "Copy email".
- **ES:** nav "Contacto" goes to /es/contacto, with the same form.
- I filled it in at 390 ES and stopped before "Enviar" (Send). Nothing blocked me.
- **Small doubts:**
  - The email is a gmail.com address, although the site has its own domain.
  - The field required/validation state isn't shown before submitting: the fields have no `required` attribute and the form uses `noValidate`.
  - There is no scheduling link.

**Question A: What would make me stop reading?**

The repo README. I clicked "Source code" to judge code quality and the first thing I saw was the default create-next-app README ("You can start editing the page by modifying `app/page.tsx`"). For a developer reviewer that undoes much of the case study's credibility, even though `src/` is well organized.

**Question B: What did I expect and not find?**

- A README with the architecture and how to run it.
- A repo description, and a homepage field that points to mateojaras.dev instead of the vercel.app URL.
- A license.
- Thumbnails on the home Work list.
- A diagram or screenshot in the Prendo case study.
- A public code link or demo for Prendo or the arbitrage bot.
- Person JSON-LD (structured data) on the home page.

| ID | Reviewer | Task/Question | Locale · viewport · URL | Finding | Severity (blocker/major/minor/nit) | Type (content/design/code/a11y) | Evidence |
|---|---|---|---|---|---|---|---|
| D3-01 | developer | Question A | EN · n/a · github.com/jaras97/mateojaras.dev (footer "Source code") | The public repo README is the unmodified create-next-app boilerplate (npm/yarn/bun instructions, "modify app/page.tsx", Geist font note). No architecture, setup or stack notes. It is the first thing a developer sees from the footer link. | major | code | Read through `gh api` (repo README); no screenshot |
| D3-02 | developer | General | n/a · github.com/jaras97/mateojaras.dev | The repo has no description and no license, and its homepage field is https://mateojaras-dev.vercel.app instead of mateojaras.dev. The root is crowded with agent tooling (.agents, .claude, .impeccable, .mcp.json, skills-lock.json) and a public .planning/ folder (seen in the root listing; I did not open it). Recent commits are mostly internal planning messages ("docs(05-07): update state and roadmap"). | minor | code | `gh repo view`, root contents and commit list |
| D3-03 | developer | General | n/a · .github/workflows/ci.yml | CI triggers on both `push` (every branch) and `pull_request`, so PR commits run twice. Each run executes `pnpm db:migrate` against a database from secrets. The e2e job runs only 5 of the roughly 40 specs in e2e/. | minor | code | ci.yml read through `gh api` |
| D3-04 | developer | Task 2 | EN · 1440/390 · /projects/prendo | Literal Markdown backticks show in the text: "row-level security on \`company_id\`". The DOM is a plain `<li>` with the backtick characters, not `<code>`. | minor | content | case-prendo-1440-en-full.png, case-prendo-390-en-full.png |
| D3-05 | developer | Task 2 | EN · 1440 · /projects/prendo | Stat captions leak internal jargon and over-hedge: "Roadmap phases complete (Prendo repository, STATE.md of 2026-11-25. A development fact.)". The "9/16" figure also sits lower than "38" and "767" in the stat row. | minor | content | case-prendo-1440-en-full.png |
| D3-06 | developer | General | EN · all · /, /projects/prendo, /about | The Spanish label "Subagentes y skills" appears in the stack lists on the English site. The About stack also lists "Css" (wrong casing). | minor | content | home-1440-en-full.png, about-1440-en-full.png |
| D3-07 | developer | Task 1 | EN/ES · 1440 · / | The project list mixes a status label ("Internal tool, sample data" / "Herramienta interna, datos de ejemplo") into the tech list as if it were a technology. The same label sits on Metales y Brillantes, described as "in use for more than 18 months", which reads as a contradiction. | minor | design | home-1440-en-full.png |
| D3-08 | developer | Task 1 | EN · 1440 · / | Work order is not chronological (Oct 2026, Aug 2026, Oct 2026, then three undated projects). The list has no thumbnails, and nothing from the Work list is visible above the fold at 1440 × 900. | minor | design | home-1440-en-fold.png, home-1440-en-full.png |
| D3-09 | developer | Task 1 | EN/ES · 390/1440 · / | The hero says what he does but not for whom: no client type or problem space is named until you read the projects. | minor | content | home-1440-en-fold.png, home-390-es-fold.png |
| D3-10 | developer | General | EN · 1440 · /about | Timeline inconsistency: "Since September 2025 I've worked as an independent contractor" sits next to Metales y Brillantes, listed under that freelance role and "in use for more than 18 months" (that is, since about May 2025, while still at Sofka). A recruiter will notice. | minor | content | about-1440-en-full.png |
| D3-11 | developer | General | ES · 390 · /es/proyectos/centro-estetico-manuj | The date range shows "ago 2026 – ago 2026" instead of a single month. | nit | content | case-manuj-390-es-full.png |
| D3-12 | developer | Task 2 | ES · 390 · /es/proyectos/centro-estetico-manuj | The stated reason for the backend is tooling convenience: "Elegí Supabase porque su servidor MCP hacía más sencillo trabajar con el agente de IA durante el desarrollo." The results are qualitative only, with no figures. This decision weakens trust more than it builds it. | minor | content | case-manuj-390-es-full.png |
| D3-13 | developer | Task 2 | EN · 1440 · /projects/prendo | The key multi-tenant safety property (forced row-level security) is labelled "not a property already validated", and the case study has no diagram or screenshot. The core claims can't be checked. | minor | content | case-prendo-1440-en-full.png |
| D3-14 | developer | General | EN · 1440 · / | The "Let's talk" CTA is `<a href="/contact" role="button">`. A navigation link is announced as a button, so screen reader users get the wrong expectation. | minor | a11y | DOM check on / (no screenshot) |
| D3-15 | developer | General | EN · 390 · /projects/prendo | Footer links (GitHub, LinkedIn, Resume, Source code) are 18 px tall and "Ask for a demo" is 21 px, below the 24 px target size (WCAG 2.5.8) on mobile. | nit | a11y | case-prendo-390-en-full.png |
| D3-16 | developer | General | EN · 1440 · /about | Education list is inconsistent: the Claude Code course shows its date twice ("Nov 2026" above and "Completed Nov 2026" below), while the other entries show the year only below. Five Udemy certificates add little next to the work history. | nit | content | about-1440-en-full.png |
| D3-17 | developer | Task 3 | EN/ES · 390/1440 · /contact, /es/contacto | The contact path works: the CTA or nav leads to a 3-field form with a mailto and copy-email alternative. The address is @gmail.com rather than the own domain, and the fields have no `required` attribute (the form is `noValidate`), so the required state isn't shown before sending. I did not send it. | nit | content | contact-390-es-filled-not-sent.png, contact-1440-en.png |
| D3-18 | developer | General | EN · 1440 · / | The home page has no JSON-LD (Person or WebSite). The `<title>` on /es is identical to the English one ("AI full stack developer"). | nit | code | DOM check on / and /es |
| D3-19 | developer | General | EN/ES · all · production | Positive, no action needed: strict security headers, correct hreflang/canonical/OG tags, real 404s, no console errors, no horizontal overflow at 390 px, visible focus ring, working dark mode, descriptive image alt text, and a well-organized `src/` with 82 unit test files. | nit | code | home-390-en-dark-focus.png, `curl -I` header check |

All screenshots are in `/Users/mateojaramillo/projects/mateojaras.dev/.planning/phases/05-pulido-y-lanzamiento/reviews/developer/`. The browser is closed.
