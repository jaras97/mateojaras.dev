# 05 Approvals

## 2026-11-26 (batch from plan 05-03)

Teo's reply, verbatim:

```
404:ok
favicon:a
cv:hecho:
contacto:ok
```

| Item | Answer | Effect |
|------|--------|--------|
| 404: | ok | Redesigned 404 copy (en and es) approved as-is. No copy edits, no `approved 404 copy` commit needed. |
| favicon: | a | Variant a (terracotta MJ, Bold, full-bleed paper square, dark variant on #0d1014). Files: `.planning/phases/05-pulido-y-lanzamiento/favicon/mj-a.svg`. Plan 05-05 installs it in `src/app` and logs the decision in `docs/decisions.md`. |
| cv: | hecho | CV en/es regenerated at /admin/cv. Orchestrator verified with check-cv-pdf (see 05-DOMAIN-VERIFY.md). |
| contacto: | ok | Teo submitted the production form himself: thanks screen, email received, message visible in /admin/messages. |

Other decisions recorded the same day:

- Teo waived the prod-db != preview-db check ("no importa"). Vercel shows separate DATABASE_URL entries per environment.
- Upstash vars exist in Production only (Teo's decision). Preview contact fails closed by design.
