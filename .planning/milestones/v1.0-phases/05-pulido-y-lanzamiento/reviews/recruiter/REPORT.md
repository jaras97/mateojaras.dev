Spawned by: orchestrator (Agent, general-purpose), 2026-11-26

# Recruiter review: mateojaras.dev (English, 390 px and 1440 px)

**Summary.** The site is clean, fast to read and honest. Location, timezone overlap, availability and contact are all clear within seconds. The Prendo case study is good engineering writing: it gives a clear problem, an owned role and decisions that each come with a trade-off. It reads more like a senior engineer than a junior one. Three things hold it back for a remote full stack + AI role in Canada or Europe:

- The backend and AI experience is thin and recent ("1 year" across the board), and the hero never says who he works for.
- There are a few credibility gaps: a date that doesn't add up, a tag that contradicts the project, and very thin cases with no visuals.
- Small polish slips (Spanish text on the English site, "Css") that a recruiter notices in a portfolio.

I would shortlist him for a call. I would not put him forward as a senior full stack + AI candidate on this evidence alone.

## Task 1: What does Teo do and for whom?

**From the home page fold only:** he's a full stack developer who uses AI coding agents and writes tests. He builds whole products, database to UI. He's in Medellín, available now, and works hours that overlap with Toronto and Madrid. He doesn't say who he does it for. The hero names no audience (startups, SMBs, product teams, employers). I only guessed "clients abroad" from the Toronto/Madrid line.

**After exploring:** my answer changed a lot.
- He's mainly a frontend developer with 4 years at Sofka (Mid-Senior, lead frontend on one SURA México app). He has been freelance since Sep 2025 and has about 1 year of Python/FastAPI/Postgres.
- "AI" mostly means he builds with Claude Code and agents. Only one shipped project (the arbitrage bot) uses an LLM inside the product.
- The audience turns out to be small Latin American businesses (pawn shops, a beauty salon, a jewelry store, an exporter). The contact copy ("Tell me what you're building") speaks to clients, not employers.

## Task 2: Case study (Prendo)

- **Problem:** a pawn shop with a store runs two businesses that are measured differently. The v1 he built for a client mixed them in one cash register and stored stock as a balance, so the cash could drift without anyone noticing. v1 never reached production, and the client's requests led to a rebuild.
- **What he did:** he designs and builds the whole thing himself (domain, data model, API, UI, tests), using coding agents under a set of rules: one spec per phase, decision records, tests written first, review gates.
- **Result:** honest but thin. It's in development, with no clients yet. 6 of the planned modules are built. The figures are 38 ADRs, 767 test files and 9/16 roadmap phases done.
- **Decision that stands out:** an insert-only cash ledger with derived balances, plus stock derived from movement history instead of a stored balance.
- **Would I trust it?** Yes, the decision itself. It is the textbook answer for auditable money, and he names the cost (more documents and queries, fixes need an adjustment entry). I trust the overall picture less:
  - There are no screenshots and no repo.
  - Row-level isolation per company is "not a property already validated".
  - The figures carry defensive notes ("A development fact, not a business result", "STATE.md").
  - 767 test files and 38 ADRs since Oct 2026 makes me want to ask how much of that the agents generated.

I also skimmed the arbitrage bot, which is the only case with an LLM in the product. Its result is just "Some purchases came out of the bot's alerts", with no numbers.

## Task 3: Contact path

From Home, I clicked "Let's talk" and reached /contact. The form has Name, Email, Message and Send, with "Or write directly" and the email plus a "Copy email" button beside it. It took 1 click, and the form also works at 390 px. I filled all three fields and did **not** press Send.

Nothing slowed me down. The email is also on the home page and the resume PDF and LinkedIn are in the footer. I did miss a booking link for a 15-minute call. The copy is aimed at clients ("Tell me what you're building"), so as a recruiter I wasn't sure the form was meant for job enquiries.

## Question A: What would make me stop reading?

On the Metales y Brillantes case study. The project is "in use for more than 18 months", but freelancing only started in Sep 2025, about 14 months ago. It's also tagged "Internal tool, sample data", even though a real shop uses it. The page body is just "I built the application with Next.js and PostgreSQL" and three one-word bullets. That combination is where I start doubting the rest.

## Question B: What's missing?

- A one-line target in the hero: what kind of role or client he's looking for.
- Screenshots or a short video for Prendo and the bot. Only Centro Estético has images.
- Any public code for the full stack work. Only the salon project and the portfolio itself link to repos.
- Numbers for the AI project: cost per listing, how many listings get filtered out, hit rate.
- A photo.
- Whether he's open to employment (contractor vs. full-time; the remote/relocation question for Canada and the EU).
- A booking link.
- Dates for 3 of the 6 projects.

## Findings

| ID | Reviewer | Task/Question | Locale · viewport · URL | Finding | Severity (blocker/major/minor/nit) | Type (content/design/code/a11y) | Evidence |
|---|---|---|---|---|---|---|---|
| R1-01 | recruiter | Task 1 | en · 1440 + 390 · / | The hero says what he does but not for whom: no target client or role. The audience only becomes clear after reading the cases (small LatAm businesses). | major | content | home-1440-en-fold.png, home-390-en-fold.png |
| R1-02 | recruiter | Question A | en · 1440 · /about, /projects/metales-y-brillantes, CV | Metales y Brillantes is "in use for more than 18 months" and listed under Freelance, which started Sep 2025 (~14 months ago). The timeline doesn't add up. | major | content | about-1440-en-full.png |
| R1-03 | recruiter | Question A | en · 1440 · / and /projects/metales-y-brillantes | The "Internal tool, sample data" tag sits on a project said to be used by a real store for 18+ months. It reads like a contradiction. The same tag on Prendo/bot/finance is also unclear (does it mean the demo uses sample data?). | minor | content | home-1440-en-full.png |
| R1-04 | recruiter | Question A | en · 1440 · /projects/metales-y-brillantes | The case study is almost empty: role is "I built the application with Next.js and PostgreSQL", the solution is three one-word bullets, and there are no visuals or decisions. It weakens the flagship "in production" claim. | major | content | about-1440-en-full.png (same claim); page text observed |
| R1-05 | recruiter | General | en · 1440 + 390 · /, /projects/prendo, /about, CV PDF | A Spanish tag, "Subagentes y skills", appears on the English site, the stack list and the English CV. | minor | content | home-1440-en-full.png, about-1440-en-full.png, case-prendo-1440-en-full.png |
| R1-06 | recruiter | General | en · 1440 · /about, CV PDF | "Css" is in the wrong case (should be "CSS"). | nit | content | about-1440-en-full.png |
| R1-07 | recruiter | General | en · 1440 · /about | Every backend, AI and tooling skill says "1 year", next to 5 years of frontend. For an "AI full stack" title this makes the backend/AI side look junior. Showing depth (projects per skill) could help. | major | content | about-1440-en-full.png |
| R1-08 | recruiter | Task 2 | en · 1440 + 390 · /projects/prendo | The key figures carry defensive notes ("A development fact, not a business result", "STATE.md of 2026-11-25") that read as internal jargon. 767 test files and 38 ADRs in about 2 months invites "was this agent-generated?" with no explanation. | minor | content | case-prendo-1440-en-full.png, case-prendo-390-en-full.png |
| R1-09 | recruiter | Task 2 | en · 1440 · /projects/prendo | Literal backticks show in the copy: "`company_id`" (markdown not rendered). | minor | code | case-prendo-1440-en-full.png |
| R1-10 | recruiter | Task 2 | en · 1440 · /projects/prendo | The "9/16" figure sits lower than "38" and "767" in the figures row. | nit | design | case-prendo-1440-en-full.png |
| R1-11 | recruiter | Question B | en · 1440 · /projects/prendo, /projects/bot-arbitraje, /projects/metales-y-brillantes | No screenshots, video or repo for the main full stack/AI cases. Only Centro Estético has images and a live link. The trust in the decisions depends on prose alone. | major | content | case-prendo-1440-en-full.png |
| R1-12 | recruiter | Task 2 | en · 1440 · /projects/bot-arbitraje | The only case with AI inside the product reports "Some purchases came out of the bot's alerts", with no numbers (cost per listing, filter rate, hit rate). "The bot learns from feedback" isn't explained. | minor | content | page text observed (no screenshot) |
| R1-13 | recruiter | Task 2 | en · 1440 · /projects/prendo | Domain terms ("kardex", "compraventas", "third parties") aren't explained for a non-Colombian reader. | nit | content | case-prendo-1440-en-full.png |
| R1-14 | recruiter | Task 3 | en · 390 · /contact | The contact path works (Home, then "Let's talk", then the form plus a direct email), but the copy only speaks to clients ("Tell me what you're building"). There's no hint that hiring enquiries are welcome and no call-booking link. | minor | content | contact-390-en-full.png, contact-390-en-filled-not-sent.png |
| R1-15 | recruiter | Question B | en · 1440 · /, /about | Nothing says whether he's open to full-time employment versus contract work only, or his stance on relocation or being hired through an employer-of-record. | minor | content | about-1440-en-full.png |
| R1-16 | recruiter | General | en · 1440 · / | The project list isn't in date order (Oct 2026, Aug 2026, Oct 2026), and 3 of the 6 projects have no date. | nit | content | home-1440-en-full.png |
| R1-17 | recruiter | General | en · 1440 · / | The project URLs are in Spanish on the English site (/projects/bot-arbitraje, /projects/finanzas-personales). | nit | content | home-1440-en-full.png |
| R1-18 | recruiter | General | en · /cv/en.pdf | In the CV's text layer, "fi" and "ff" drop out ("fve years", "ofers", "fnances", "frst"). Applicant-tracking systems that read the text will see broken words. | major | code | CV downloaded to /private/tmp/claude-501/-Users-mateojaramillo-projects-mateojaras-dev/19feb938-9528-4111-8fa1-eafa02befdbb/scratchpad/cv/en.pdf (outside the folder, which is PNG-only) |
| R1-19 | recruiter | General | en · 1440 · /about, CV | Listing five short Udemy courses (including "CSS, 2023" next to "CSS 5 years") under Education dilutes the senior signal. The degree is incomplete ("through 8th semester") and English is B2, which some Canada/EU roles will look at. | minor | content | about-1440-en-full.png |
| R1-20 | recruiter | General | en · 390 · /projects/prendo | The "Let's talk" call to action at the bottom of the case study is a button in the accessibility tree; on the home page it is a link to /contact. | nit | a11y | case-prendo-390-en-full.png |

**Not counted as findings.** The faded sections in case-prendo-390-en-full.png come from the full-page capture catching the reveal animation before it ran. Scrolled normally, the text renders fully (case-prendo-390-en-decisions.png).

All screenshots are in `/Users/mateojaramillo/projects/mateojaras.dev/.planning/phases/05-pulido-y-lanzamiento/reviews/recruiter/`. The contact form was not submitted and the browser is closed.
