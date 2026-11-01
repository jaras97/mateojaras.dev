---
schema_version: 1
open_count: 4
waived_count: 0
fixed_count: 0
total_count: 4
last_updated: 2026-11-01T19:58:27.084Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 01 | unmet-truth | docs/copy.md |  | Sofka Technologies bullets pending (Teo at G6: 'Sofka pendiente'); explicit Pendiente line, no invented text; closes at G7 or in the admin | open |  | 2026-11-01T19:36:07.008Z |  |
| 2 | 01 | unmet-truth | docs/content |  | IDEN-05: narrative, dates, covers, media, permission and URLs of the 4 projects deferred by Teo to the admin at G7 ('todo eso lo subo desde admin') | open |  | 2026-11-01T19:58:26.857Z |  |
| 3 | 01 | unmet-truth | material |  | IDEN-06: no capture tracked; 7 existing captures unreviewed (2 with faces excluded), inventario and finanzas have none; deferred by Teo to the admin at G7 | open |  | 2026-11-01T19:58:26.965Z |  |
| 4 | 01 | unmet-truth | docs/copy.md |  | IDEN-07: English copy, fixture headline and hero strings still draft-translation/draft; Teo approves them in the admin (G7 deferral) | open |  | 2026-11-01T19:58:27.084Z |  |

````json
[
  {
    "id": 1,
    "kind": "unmet-truth",
    "phase": "01",
    "file": "docs/copy.md",
    "line": null,
    "description": "Sofka Technologies bullets pending (Teo at G6: 'Sofka pendiente'); explicit Pendiente line, no invented text; closes at G7 or in the admin",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-11-01T19:36:07.008Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 2,
    "kind": "unmet-truth",
    "phase": "01",
    "file": "docs/content",
    "line": null,
    "description": "IDEN-05: narrative, dates, covers, media, permission and URLs of the 4 projects deferred by Teo to the admin at G7 ('todo eso lo subo desde admin')",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-11-01T19:58:26.857Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 3,
    "kind": "unmet-truth",
    "phase": "01",
    "file": "material",
    "line": null,
    "description": "IDEN-06: no capture tracked; 7 existing captures unreviewed (2 with faces excluded), inventario and finanzas have none; deferred by Teo to the admin at G7",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-11-01T19:58:26.965Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 4,
    "kind": "unmet-truth",
    "phase": "01",
    "file": "docs/copy.md",
    "line": null,
    "description": "IDEN-07: English copy, fixture headline and hero strings still draft-translation/draft; Teo approves them in the admin (G7 deferral)",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-11-01T19:58:27.084Z",
    "resolved_at": null,
    "milestone": null
  }
]
````
