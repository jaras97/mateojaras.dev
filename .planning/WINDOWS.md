---
schema_version: 1
open_count: 1
waived_count: 0
fixed_count: 0
total_count: 1
last_updated: 2026-11-01T19:36:07.008Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 01 | unmet-truth | docs/copy.md |  | Sofka Technologies bullets pending (Teo at G6: 'Sofka pendiente'); explicit Pendiente line, no invented text; closes at G7 or in the admin | open |  | 2026-11-01T19:36:07.008Z |  |

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
  }
]
````
