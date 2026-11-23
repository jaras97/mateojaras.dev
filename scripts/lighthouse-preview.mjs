// Lighthouse mobile against a protected Vercel Preview (method (a), 04-02 Lectura E).
// Usage: node scripts/lighthouse-preview.mjs <preview-origin> [path ...]
// Loads .env.local internally. The bypass secret goes to a temp JSON file that is
// deleted afterwards; it is never printed, logged or written into the repo.
// Reports (JSON) go to os.tmpdir(); only scores and lab metrics are printed.
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.loadEnvFile(".env.local");
const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
if (!secret) {
  console.error("VERCEL_AUTOMATION_BYPASS_SECRET is not set");
  process.exit(2);
}
const [origin, ...argPaths] = process.argv.slice(2);
if (!origin) {
  console.error("usage: lighthouse-preview.mjs <origin> [path ...]");
  process.exit(2);
}
const slug = process.env.LH_SLUG ?? "centro-estetico-manuj";
const runs = Number(process.env.LH_RUNS ?? 1);
const paths = argPaths.length
  ? argPaths
  : [
      "/",
      `/projects/${slug}`,
      "/about",
      "/contact",
      "/es",
      `/es/proyectos/${slug}`,
      "/es/sobre-mi",
      "/es/contacto",
    ];

if (process.env.LH_PROBE) {
  for (const path of paths) {
    const res = await fetch(`${origin}${path}`, {
      headers: { "x-vercel-protection-bypass": secret },
      redirect: "manual",
    });
    const html = await res.text();
    const title = html.match(/<title[^>]*>([^<]*)/)?.[1] ?? "";
    console.log(path, res.status, title, `${html.length}b`);
  }
  process.exit(0);
}

const dir = mkdtempSync(join(tmpdir(), "lh-"));
const headersFile = join(dir, "headers.json");
writeFileSync(
  headersFile,
  JSON.stringify({ "x-vercel-protection-bypass": secret }),
  { mode: 0o600 },
);

const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const rows = [];
try {
  for (const path of paths) {
    const results = [];
    for (let i = 0; i < runs; i++) {
      const out = join(dir, `r-${rows.length}-${i}.json`);
      const url = `${origin}${path}${path.includes("?") ? "&" : "?"}__vercel_toolbar=0`;
      const r = spawnSync(
        "pnpm",
        [
          "dlx",
          "lighthouse",
          url,
          "--preset=perf",
          "--form-factor=mobile",
          "--output=json",
          `--output-path=${out}`,
          `--extra-headers=${headersFile}`,
          "--chrome-flags=--headless=new --no-sandbox",
          "--quiet",
        ],
        { encoding: "utf8", stdio: ["ignore", "ignore", "pipe"] },
      );
      if (r.status !== 0) {
        console.error(`lighthouse failed for ${path} (status ${r.status})`);
        continue;
      }
      const j = JSON.parse(readFileSync(out, "utf8"));
      const a = j.audits;
      results.push({
        perf: Math.round(j.categories.performance.score * 100),
        lcp: a["largest-contentful-paint"].numericValue / 1000,
        cls: a["cumulative-layout-shift"].numericValue,
        tbt: a["total-blocking-time"].numericValue,
        fcp: a["first-contentful-paint"].numericValue / 1000,
        lcpEl:
          a["largest-contentful-paint-element"]?.details?.items?.[0]?.items?.[0]
            ?.node?.snippet ?? "",
        status: j.runWarnings?.length ? j.runWarnings.length : 0,
        final: j.finalDisplayedUrl?.replace(/\?.*$/, "") ?? "",
      });
    }
    if (!results.length) continue;
    const row = {
      path,
      runs: results.length,
      perf: median(results.map((r) => r.perf)),
      lcp: +median(results.map((r) => r.lcp)).toFixed(2),
      cls: +median(results.map((r) => r.cls)).toFixed(3),
      tbt: Math.round(median(results.map((r) => r.tbt))),
      fcp: +median(results.map((r) => r.fcp)).toFixed(2),
      lcpEl: results[0].lcpEl.replace(/\s+/g, " ").slice(0, 100),
      warnings: results[0].status,
    };
    rows.push(row);
    console.log(JSON.stringify(row));
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}
