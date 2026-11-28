# API Coverage — Vercel Blob (@vercel/blob 2.8.2)

> Full coverage by default. Opt-outs are explicit, reasoned decisions.

| capability | decision | reason |
|---|---|---|
| put | INTEGRATE | |
| upload (client) | INTEGRATE | |
| handleUpload (client token) | INTEGRATE | |
| onUploadCompleted | OPT-OUT | not needed: Vercel cannot call back to localhost; the URL is persisted through the entity Server Action (RESEARCH Pattern 7) |
| del | OPT-OUT | not needed yet: CV history keeps every version (CV-04) and removed images stay as accepted orphans (T-03-27); only e2e cleanup calls it |
| list | OPT-OUT | not needed: CV history reads resume_versions; backups are inspected from the Vercel dashboard |
| head | OPT-OUT | not needed: sizes and types are checked in the browser and by the token policy |
| copy | OPT-OUT | not needed: files are never moved or renamed |
| multipart upload | OPT-OUT | not needed: uploads are capped at 8 MB and upload() handles them |
| getDownloadUrl | OPT-OUT | not needed: the history links use the public URL with the download attribute |
