# Phase 5: Pulido y lanzamiento - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-11-25
**Phase:** 5-Pulido y lanzamiento
**Areas discussed:** Analytics, Página 404, Revisión por 3 personas, Lanzamiento

---

## Analytics

| Option | Description | Selected |
|--------|-------------|----------|
| Vercel Web Analytics | Dashboard toggle, cookieless, same origin, @vercel/analytics; no custom events on Hobby | ✓ |
| Umami Cloud | External account, cookieless, free custom events, third-party CSP | |
| Vercel Analytics + Speed Insights | Adds real-user Web Vitals; two deps | |

| Option | Description | Selected |
|--------|-------------|----------|
| Solo visitas y referrers | What QUAL-07 asks | ✓ |
| Visitas + 3 eventos clave | CV, contact, Cal.com; needs Umami or Pro | |

| Option | Description | Selected |
|--------|-------------|----------|
| Excluir /admin, el resto igual | No script in /admin | ✓ |
| Excluir /admin y mi navegador | Plus a localStorage opt-out | |

**User's choice:** all recommended options.

---

## Página 404

| Option | Description | Selected |
|--------|-------------|----------|
| Mensaje + lista de proyectos | EntryList plus links to home and contact | ✓ |
| Solo mensaje + enlaces | Leaner, no DB read | |

| Option | Description | Selected |
|--------|-------------|----------|
| Bitácora, seco | Claude proposes en/es, Teo approves | ✓ |
| Neutro, como está | Keep current copy | |
| Lo escribo yo | Teo writes | |

| Option | Description | Selected |
|--------|-------------|----------|
| Sí, con proxy.ts | Real 404 for unknown slugs | ✓ |
| Dejarlo como está | Keep accepted soft 404 | |

**User's choice:** all recommended options.

---

## Revisión por 3 personas

| Option | Description | Selected |
|--------|-------------|----------|
| Reclutador/a + cliente + dev | One per audience | |
| Los que tenga a mano | Any three | |
| Ya sé quiénes son | Teo names roles | |

**User's choice (free text):** "no tengo a nadie, podrias revisarlo tu"
**Notes:** Claude explained that agent reviews are not real people (shared bias, no real hiring reaction). Follow-up:

| Option | Description | Selected |
|--------|-------------|----------|
| 3 revisiones mías + 1 humana después | 3 Claude personas close the gate; human review later, non-blocking | ✓ |
| Solo mis 3 revisiones | Replace human review entirely | |
| Mantener 3 humanas, bloqueante | Phase waits for real people | |

Format: Guía corta con 3 tareas ✓ (vs Libre). Environment: Producción ✓ (vs Preview). Resolved: Arreglado o descartado con razón ✓ (vs Todo arreglado).

---

## Lanzamiento

| Option | Description | Selected |
|--------|-------------|----------|
| Lanzar con lo que esté completo | Launch with ManuJ if that is all | |
| Esperar a 2 casos mínimo | Block on EcoExport | |

**User's choice (free text):** "necesito actualizar absolutamente todo el contenido de mi app, y configurar el dominio y produccion, ya que el enfoque es como desarrollardor full stack ai, colocar bien toda la info con tus recomendaciones, y ayuda"
**Notes:** Claude flagged the positioning change, the need for real AI evidence, and the scope growth. Follow-ups:

| Option | Description | Selected |
|--------|-------------|----------|
| Fase 4.1 propia, antes de la 5 | Separate content and positioning phase | ✓ |
| Dentro de la fase 5, primera ola | One bigger phase | |

AI evidence (multi-select): Integré LLMs en un producto ✓, Desarrollo con agentes de código ✓, Automatizaciones o tooling con AI ✓ (not selected: Aún no).

Domain: mateojaras.dev, www redirige ✓ (vs www canónico). Search Console: Sí, el día del lanzamiento ✓ (vs Después).

---

## Claude's Discretion

- CI e2e against Neon dev, contact without real email or live Upstash
- CSP switch to enforce after a zero-violation pass, Lighthouse no regression
- 404 for unmatched URLs (global-not-found vs [locale]/not-found)
- A11y and reduced-motion pass, screenshots and impeccable audit for the 404
- Analytics on Preview (default: production only)

## Deferred Ideas

- Phase 4.1 Contenido y posicionamiento full stack + AI
- One human review after launch, non-blocking
- Custom analytics events; Speed Insights
