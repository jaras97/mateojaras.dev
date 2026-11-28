# Phase 2: Base técnica - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-11-15
**Phase:** 2-Base técnica
**Areas discussed:** Aprobaciones de arranque

Areas offered but not selected: Seed con contenido pendiente, Entornos y despliegue, Admin mínimo de la fase 2 (resolved as Claude defaults D-05 to D-09).

---

## Aprobaciones de arranque

### Dependencias
| Option | Description | Selected |
|--------|-------------|----------|
| Apruebo todo | React 19.3.1, direct deps, @types/node ^24 | ✓ |
| Todo menos React | React stays 19.3.0 | |
| Solo lo de la fase 2 | Tiptap/dnd-kit requested in phase 3 | |

### docs/data-model.md
| Option | Description | Selected |
|--------|-------------|----------|
| Sí, las dos | languages CEFR + Better Auth CLI fix | ✓ |
| Solo languages | | |
| No | | |

### CLAUDE.md
| Option | Description | Selected |
|--------|-------------|----------|
| Sí, enmendar | proxy.ts also does next-intl rewrites; AuthGate in Suspense + requireSession() | ✓ |
| No, dejarlo | | |

### Biome
| Option | Description | Selected |
|--------|-------------|----------|
| No, quedarse en 2.4.2 | | ✓ |
| Sí, subir a 2.6.4 | | |

**User's choice:** all recommended options.

---

## Claude's Discretion

- Seed: ManuJ and EcoExport published, inventory and finance draft, pending fields null, no images.
- Seed runs manually from local, never in the build. Production on *.vercel.app; the domain is attached in phase 5. CI runs against Neon dev.
- Minimal admin: login plus a shell with logout, in Spanish.
- Driver, auth helper, CSP contents, plan B test method, export format.

## Deferred Ideas

- Biome 2.6 bump: revisit in phase 5.
