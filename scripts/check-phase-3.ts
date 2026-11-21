// Read-only phase-3 content gate over DATABASE_URL (D-09). Never writes.
// Usage: tsx scripts/check-phase-3.ts
//        DATABASE_URL='<Neon main>' tsx scripts/check-phase-3.ts
// Prints one PASS/FAIL line per check; exit 1 when any line is FAIL.
import { eq } from "drizzle-orm";
import { createDb } from "@/db/client";
import {
  experiences,
  projects,
  resumeVersions,
  SITE_SETTINGS_ID,
  siteSettings,
} from "@/db/schema";
import { describeDbTarget } from "@/lib/db-target";
import { requireEnv } from "@/lib/env";
import { loadLocalEnv } from "./lib/env";

const SLUGS = [
  "centro-estetico-manuj",
  "ecoexport-costa-rica",
  "finanzas-personales",
  "sistema-gestion-inventario",
];
const DRAFT_ALLOWED = new Set([
  "ecoexport-costa-rica",
  "finanzas-personales",
  "sistema-gestion-inventario",
]);
const MARKERS = /\[Teo escribe\]|TODO|lorem/i;

let failures = 0;
function line(ok: boolean, scope: string, label: string, detail = "") {
  if (!ok) failures += 1;
  console.log(
    `${ok ? "PASS" : "FAIL"} ${scope}: ${label}${!ok && detail ? ` (${detail})` : ""}`,
  );
}

const filled = (v: unknown) => typeof v === "string" && v.trim().length > 0;
const nonEmptyList = (v: unknown): v is unknown[] =>
  Array.isArray(v) && v.length > 0;

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) collectStrings(v, out);
  else if (value && typeof value === "object")
    for (const v of Object.values(value)) collectStrings(v, out);
  return out;
}

function markers(scope: string, row: Record<string, unknown>) {
  const hits: string[] = [];
  for (const [key, value] of Object.entries(row)) {
    if (collectStrings(value).some((s) => MARKERS.test(s))) hits.push(key);
  }
  line(hits.length === 0, scope, "no placeholder markers", hits.join(", "));
}

type Decisions = { decisions?: { title?: string; body?: string }[] } | null;
type Metric = { label?: string; value?: string };

async function main() {
  loadLocalEnv();
  const url = requireEnv("DATABASE_URL");
  console.log(`target: ${describeDbTarget(url)}`);
  const db = createDb(url);

  const projectRows = await db.select().from(projects);
  const experienceRows = await db.select().from(experiences);
  const [settings] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, SITE_SETTINGS_ID));
  const resumes = await db.select().from(resumeVersions);

  const publishedUpdates: Date[] = [];

  for (const slug of SLUGS) {
    const scope = `project ${slug}`;
    const p = projectRows.find((r) => r.slug === slug);
    if (!p) {
      line(false, scope, "row exists");
      continue;
    }
    console.log(`INFO ${scope}: status=${p.status}`);
    if (p.status === "published") publishedUpdates.push(p.updatedAt);
    // D-10: an unpublished DRAFT_ALLOWED project is Teo's decision: it gets
    // the status line and the placeholder-marker check, no content lines.
    if (p.status !== "published" && DRAFT_ALLOWED.has(slug)) {
      console.log(`INFO ${scope}: kept as draft (D-10, Teo decides)`);
      markers(scope, p as unknown as Record<string, unknown>);
      continue;
    }
    for (const [field, en, es] of [
      ["title", p.titleEn, p.titleEs],
      ["tagline", p.taglineEn, p.taglineEs],
      ["problem", p.problemEn, p.problemEs],
      ["role", p.roleEn, p.roleEs],
      ["solution", p.solutionEn, p.solutionEs],
    ] as const) {
      line(filled(en) && filled(es), scope, `${field} en+es`);
    }
    line(
      nonEmptyList(p.resultsEn) && nonEmptyList(p.resultsEs),
      scope,
      "results en+es",
    );
    const decEn = (p.techDecisionsEn as Decisions)?.decisions ?? [];
    const decEs = (p.techDecisionsEs as Decisions)?.decisions ?? [];
    const decOk = (d: typeof decEn) =>
      d.length >= 2 &&
      d.length <= 3 &&
      d.every((x) => filled(x.title) && filled(x.body));
    line(decOk(decEn) && decOk(decEs), scope, "2-3 decisions en+es");
    const mEn = (p.metricsEn ?? []) as Metric[];
    const mEs = (p.metricsEs ?? []) as Metric[];
    line(
      mEn.length === mEs.length &&
        [...mEn, ...mEs].every((m) => filled(m.label) && filled(m.value)),
      scope,
      "metrics have label+value, same count en/es",
      `${mEn.length}/${mEs.length}`,
    );
    line(filled(p.liveUrl) || filled(p.repoUrl), scope, "liveUrl or repoUrl");
    const media = p.media ?? [];
    line(
      media.length >= 3 &&
        media.every((m) => filled(m.altEn) && filled(m.altEs)),
      scope,
      ">=3 media with alt en+es",
      `${media.length} items`,
    );
    line(
      filled(p.coverImage) && media.some((m) => m.url === p.coverImage),
      scope,
      "coverImage is in media",
    );
    line(p.draft === null, scope, "no pending draft edits");
    markers(scope, p as unknown as Record<string, unknown>);
  }

  if (!settings) {
    line(false, "settings", "row exists");
  } else {
    for (const [field, en, es] of [
      ["headline", settings.headlineEn, settings.headlineEs],
      ["bio", settings.bioEn, settings.bioEs],
    ] as const) {
      line(filled(en) && filled(es), "settings", `${field} en+es`);
    }
    const nowFilled = (v: unknown) => collectStrings(v).some(filled);
    line(
      nowFilled(settings.nowEn) && nowFilled(settings.nowEs),
      "settings",
      "now en+es",
    );
    line(settings.status === "published", "settings", "published");
    line(settings.draft === null, "settings", "no pending draft edits");
    markers("settings", settings as unknown as Record<string, unknown>);
    if (settings.status === "published")
      publishedUpdates.push(settings.updatedAt);
  }

  const publishedExperiences = experienceRows.filter(
    (e) => e.status === "published",
  );
  line(publishedExperiences.length > 0, "experiences", "has published rows");
  for (const e of publishedExperiences) {
    const scope = `experience ${e.company}`;
    publishedUpdates.push(e.updatedAt);
    line(
      e.bulletsEn.length > 0 &&
        e.bulletsEn.length === e.bulletsEs.length &&
        [...e.bulletsEn, ...e.bulletsEs].every(filled),
      scope,
      "bullets en+es non-empty, equal length",
      `${e.bulletsEn.length}/${e.bulletsEs.length}`,
    );
    markers(scope, e as unknown as Record<string, unknown>);
  }

  const newest = publishedUpdates.reduce<Date | null>(
    (acc, d) => (!acc || d > acc ? d : acc),
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

  console.log(failures === 0 ? "RESULT: all PASS" : `RESULT: ${failures} FAIL`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "check failed");
  process.exitCode = 2;
});
