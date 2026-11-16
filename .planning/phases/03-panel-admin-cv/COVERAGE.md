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
</content>
</invoke>
<invoke name="Bash">
<parameter name="command">cd /Users/mateojaramillo/projects/mateojaras.dev && f=.planning/phases/03-panel-admin-cv/03-03-PLAN.md && perl -0pi -e 's/(<flagged_assumptions>\nEdge probe: ADMN-09 empty)/<assumption_delta_decision>\nDetector fired (pluralization) because published values and pending edits now live side by side. Primary noun: the content row (its id and its columns are the published identity). Decision: no-change to the identity model; `draft` is a single pending overlay per row, never a second record, cleared on publish or discard. An invariant is already encoded by the Task 2 action tests (publish leaves columns equal to the submitted values and draft null); 03-08 and 03-09 repeat it per entity.\n<\/assumption_delta_decision>\n\n$1/' $f && grep -c assumption_delta_decision $f