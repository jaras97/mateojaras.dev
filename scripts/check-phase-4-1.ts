// Read-only phase-4.1 content gate over DATABASE_URL. Never writes.
// Usage: tsx scripts/check-phase-4-1.ts [--before-cv] [--baseline=<export:content dir>]
//        DATABASE_URL='<Neon main>' tsx scripts/check-phase-4-1.ts
//   --before-cv         skip the CV freshness check
//   --baseline=<dir>    an export:content folder; enables the Sofka-unchanged check
// Prints one PASS/FAIL line per check; exit 0 all PASS, 1 any FAIL, 2 crash.
import { readFileSync } from "node:fs";
import { eq } from "drizzle-orm";
import { createDb } from "@/db/client";
import {
  education,
  experiences,
  projects,
  resumeVersions,
  SITE_SETTINGS_ID,
  siteSettings,
} from "@/db/schema";
import {
  AI_FEATURE,
  FINISHED,
  IN_PROGRESS,
  type LintIssue,
  lintPair,
  lintStrings,
  V1_CLAIM,
} from "@/lib/content-lint";
import { describeDbTarget } from "@/lib/db-target";
import { requireEnv } from "@/lib/env";
import { positioning } from "./content/positioning";
import { loadLocalEnv } from "./lib/env";

let failures = 0;
function line(ok: boolean, scope: string, label: string, detail = "") {
  if (!ok) failures += 1;
  console.log(
    `${ok ? "PASS" : "FAIL"} ${scope}: ${label}${!ok && detail ? ` (${detail})` : ""}`,
  );
}

const filled = (v: unknown) => typeof v === "string" && v.trim().length > 0;
const has = (v: unknown, needle: string) =>
  typeof v === "string" && v.toLowerCase().includes(needle.toLowerCase());

type Text = { path: string; text: string };

function collect(value: unknown, path: string, out: Text[] = []): Text[] {
  if (typeof value === "string") out.push({ path, text: value });
  else if (Array.isArray(value))
    value.forEach((v, i) => {
      collect(v, `${path}[${i}]`, out);
    });
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value))
      collect(v, path ? `${path}.${k}` : k, out);
  return out;
}

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const PROJECT_SKIP = new Set([
  "id",
  "slug",
  "status",
  "visible",
  "order",
  "draft",
  "createdAt",
  "updatedAt",
  "featured",
  "liveUrl",
  "repoUrl",
  "media",
  "coverImage",
  "startedAt",
  "finishedAt",
]);

function pick(row: Record<string, unknown>, keys: string[]) {
  return Object.fromEntries(keys.map((k) => [k, row[k]]));
}

function flag(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit?.slice(name.length + 3);
}

async function main() {
  loadLocalEnv();
  const url = requireEnv("DATABASE_URL");
  console.log(`target: ${describeDbTarget(url)}`);
  const db = createDb(url);
  const beforeCv = process.argv.includes("--before-cv");
  const baselineDir = flag("baseline");

  const projectRows = await db.select().from(projects);
  const experienceRows = await db.select().from(experiences);
  const educationRows = await db.select().from(education);
  const resumes = await db.select().from(resumeVersions);
  const [s] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, SITE_SETTINGS_ID));

  // Every text column the loader writes, with its path; now_* kept apart.
  const nowTexts: Text[] = [];
  const otherTexts: Text[] = [];
  const lintIssues: LintIssue[] = [];

  // settings
  if (!s) {
    line(false, "settings", "row exists");
  } else {
    line(
      has(s.headlineEn, "full stack") && has(s.headlineEs, "full stack"),
      "settings",
      "headline en+es contain full stack (D-01)",
    );
    line(
      has(s.seoTitleEn, "full stack") && has(s.seoTitleEs, "full stack"),
      "settings",
      "seo_title en+es contain full stack (D-01)",
    );
    line(
      !has(s.headlineEn, "frontend") && !has(s.headlineEs, "frontend"),
      "settings",
      "headlines do not say frontend (D-01)",
    );
    line(
      (s.seoTitleEn?.length ?? 0) <= 60 &&
        (s.seoTitleEs?.length ?? 0) <= 60 &&
        (s.seoDescriptionEn?.length ?? 0) <= 160 &&
        (s.seoDescriptionEs?.length ?? 0) <= 160,
      "settings",
      "seo_title <= 60 and seo_description <= 160",
    );
    const nowOk = (v: unknown) =>
      v !== null &&
      v !== undefined &&
      collect(v, "now")
        .map((t) => t.text)
        .join(" ")
        .includes("Prendo");
    line(
      nowOk(s.nowEn) && nowOk(s.nowEs),
      "settings",
      "now en+es not null and mention Prendo (D-03)",
    );
    const textKeys = [
      "headlineEn",
      "headlineEs",
      "bioEn",
      "bioEs",
      "seoTitleEn",
      "seoTitleEs",
      "seoDescriptionEn",
      "seoDescriptionEs",
    ];
    otherTexts.push(
      ...collect(pick(s as Record<string, unknown>, textKeys), "settings"),
    );
    nowTexts.push(
      ...collect(s.nowEn, "settings.nowEn"),
      ...collect(s.nowEs, "settings.nowEs"),
    );
    lintIssues.push(
      ...lintStrings(pick(s as Record<string, unknown>, textKeys), "settings"),
      ...lintStrings(s.nowEn, "now_en", { scope: "now" }),
      ...lintStrings(s.nowEs, "now_es", { scope: "now" }),
      ...lintPair(s.headlineEn, s.headlineEs, "settings.headline"),
      ...lintPair(s.bioEn, s.bioEs, "settings.bio"),
      ...lintPair(s.nowEn, s.nowEs, "settings.now"),
    );
  }

  // projects
  line(
    !projectRows.some((p) => p.slug === "e2e-stale-probe"),
    "projects",
    "e2e-stale-probe absent",
  );
  for (const placement of positioning.projects) {
    const scope = `project ${placement.slug}`;
    const p = projectRows.find((r) => r.slug === placement.slug);
    if (!p) {
      line(false, scope, "row exists");
      continue;
    }
    const status = placement.publish ? "published" : "draft";
    line(
      p.order === placement.order &&
        p.featured === placement.featured &&
        p.visible === placement.visible &&
        p.status === status,
      scope,
      "order, featured, visible, status match positioning (D-11)",
      `order=${p.order} featured=${p.featured} visible=${p.visible} status=${p.status}`,
    );
  }
  const prendoPlacement = positioning.projects.find((p) =>
    p.slug.startsWith("prendo"),
  );
  const prendo = prendoPlacement
    ? projectRows.find((r) => r.slug === prendoPlacement.slug)
    : undefined;
  line(
    Boolean(
      prendo &&
        prendo.status === "published" &&
        (has(prendo.taglineEs, "en desarrollo") ||
          has(prendo.problemEs, "en desarrollo")) &&
        (has(prendo.taglineEn, "in development") ||
          has(prendo.problemEn, "in development")),
    ),
    "projects",
    "Prendo published and marked in development en+es (D-05)",
    prendo ? `status=${prendo.status}` : "no Prendo row or placement",
  );
  const unsourced = projectRows.flatMap((p) =>
    [...(p.metricsEn ?? []), ...(p.metricsEs ?? [])]
      .filter((m) => !(m.label.includes("(") && m.label.includes(")")))
      .map((m) => `${p.slug}: ${m.label}`),
  );
  line(
    unsourced.length === 0,
    "projects",
    "every metric label carries its source in parentheses",
    unsourced.join("; "),
  );
  for (const p of projectRows) {
    const keys = Object.keys(p).filter((k) => !PROJECT_SKIP.has(k));
    const text = pick(p as Record<string, unknown>, keys);
    otherTexts.push(...collect(text, `projects[${p.slug}]`));
    lintIssues.push(...lintStrings(text, `projects[${p.slug}]`));
    for (const k of keys) {
      if (!k.endsWith("En")) continue;
      const base = k.slice(0, -2);
      lintIssues.push(
        ...lintPair(text[k], text[`${base}Es`], `projects[${p.slug}].${base}`),
      );
    }
  }

  // experiences
  for (const e of experienceRows) {
    const scope = `experience ${e.company}`;
    line(
      e.bulletsEn.length === e.bulletsEs.length,
      scope,
      "bullets en/es same length",
      `${e.bulletsEn.length}/${e.bulletsEs.length}`,
    );
    if (e.type === "freelance") {
      line(
        !has(e.roleEn, "frontend") && !has(e.roleEs, "frontend"),
        scope,
        "role does not say frontend (D-01)",
      );
    }
    if (has(e.company, "sofka")) {
      line(
        has(e.roleEn, "Frontend") && has(e.roleEs, "Frontend"),
        scope,
        "role keeps Frontend (D-04)",
      );
    }
    const text = pick(e as Record<string, unknown>, [
      "roleEn",
      "roleEs",
      "bulletsEn",
      "bulletsEs",
    ]);
    otherTexts.push(...collect(text, `experiences[${e.company}]`));
    lintIssues.push(
      ...lintStrings(text, `experiences[${e.company}]`),
      ...lintPair(e.roleEn, e.roleEs, `experiences[${e.company}].role`),
      ...lintPair(
        e.bulletsEn,
        e.bulletsEs,
        `experiences[${e.company}].bullets`,
      ),
    );
  }
  if (baselineDir) {
    const raw = JSON.parse(
      readFileSync(`${baselineDir}/experiences.json`, "utf8"),
    ) as {
      rows: { company: string; bulletsEn: string[]; bulletsEs: string[] }[];
    };
    const before = raw.rows.find((r) => has(r.company, "sofka"));
    const now = experienceRows.find((r) => has(r.company, "sofka"));
    line(
      Boolean(
        before &&
          now &&
          JSON.stringify(before.bulletsEn) === JSON.stringify(now.bulletsEn) &&
          JSON.stringify(before.bulletsEs) === JSON.stringify(now.bulletsEs),
      ),
      "experience Sofka",
      "bullets equal the baseline (D-04)",
    );
  }

  // education
  line(
    educationRows.length >= 6 &&
      educationRows.some((r) => has(r.programEn, "Claude Code")),
    "education",
    "at least 6 rows and one Claude Code program (D-12)",
    `${educationRows.length} rows`,
  );
  for (const r of educationRows) {
    const text = pick(r as Record<string, unknown>, [
      "institution",
      "programEn",
      "programEs",
      "statusEn",
      "statusEs",
    ]);
    otherTexts.push(...collect(text, `education[${r.institution}]`));
    lintIssues.push(
      ...lintStrings(text, `education[${r.institution}]`),
      ...lintPair(r.programEn, r.programEs, `education[${r.institution}]`),
    );
  }

  // lint and claims
  line(
    lintIssues.length === 0,
    "lint",
    "no lint issues in any loaded text",
    lintIssues
      .slice(0, 5)
      .map((i) => `${i.path} ${i.kind}`)
      .join("; "),
  );
  const aiOutside = otherTexts.filter((t) => AI_FEATURE.test(t.text));
  const nowSentences = (prefix: string) =>
    nowTexts
      .filter((t) => t.path.startsWith(prefix))
      .flatMap((t) => sentences(t.text))
      .filter((x) => AI_FEATURE.test(x));
  const nowOk = (prefix: string) => {
    const list = nowSentences(prefix);
    return (
      list.length > 0 &&
      list.some((x) => IN_PROGRESS.test(x)) &&
      !list.some((x) => FINISHED.test(x))
    );
  };
  line(
    aiOutside.length === 0 &&
      nowOk("settings.nowEn") &&
      nowOk("settings.nowEs"),
    "claims",
    "Prendo AI feature only in the Now",
    aiOutside.length > 0
      ? aiOutside.map((t) => t.path).join(", ")
      : "Now en/es lacks an in-progress AI feature sentence",
  );
  const v1 = [...otherTexts, ...nowTexts].filter((t) =>
    sentences(t.text).some((x) => V1_CLAIM.test(x)),
  );
  line(
    v1.length === 0,
    "claims",
    "no Prendo v1 production/users claim",
    v1.map((t) => t.path).join(", "),
  );

  // CV
  if (!beforeCv) {
    const published = [
      ...projectRows.filter((p) => p.status === "published"),
      ...experienceRows.filter((e) => e.status === "published"),
      ...educationRows.filter((e) => e.status === "published"),
      ...(s?.status === "published" ? [s] : []),
    ];
    const newest = published.reduce<Date | null>(
      (acc, r) => (!acc || r.updatedAt > acc ? r.updatedAt : acc),
      null,
    );
    for (const locale of ["en", "es"] as const) {
      const latest = resumes
        .filter((r) => r.locale === locale)
        .sort((a, b) => b.version - a.version)[0];
      line(Boolean(latest), `resume ${locale}`, "latest version exists");
      if (latest && newest) {
        line(
          latest.generatedAt > newest,
          `resume ${locale}`,
          "generated after newest published content update",
          `generatedAt ${latest.generatedAt.toISOString()} vs ${newest.toISOString()}`,
        );
      }
    }
  }

  console.log(failures === 0 ? "RESULT: all PASS" : `RESULT: ${failures} FAIL`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "check failed");
  process.exitCode = 2;
});
