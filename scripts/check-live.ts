// Read-only checks against a deployed origin. Never writes.
// Usage: pnpm tsx scripts/check-live.ts origin [--only=domain,...] [--expect-host=host]
// Prints PASS/FAIL/SKIP lines per group; exit 0 all PASS, 1 any FAIL, 2 crash.
import { loadLocalEnv } from "./lib/env";

loadLocalEnv();

type Ctx = { origin: string; expectHost: string };
type Group = (ctx: Ctx) => Promise<string[]>;

const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

function headers(): Record<string, string> {
  const h: Record<string, string> = {};
  if (bypass) {
    h["x-vercel-protection-bypass"] = bypass;
    h["x-vercel-skip-toolbar"] = "1";
  }
  return h;
}

function get(url: string, manual = false): Promise<Response> {
  return fetch(url, {
    headers: headers(),
    redirect: manual ? "manual" : "follow",
  });
}

const pass = (g: string, what: string) => `PASS ${g}: ${what}`;
const fail = (g: string, what: string, seen: string) =>
  `FAIL ${g}: ${what} (${seen})`;
const skip = (g: string, what: string, why: string) =>
  `SKIP ${g}: ${what} (${why})`;

function tags(html: string, name: string): string[] {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) ?? [];
}

function attr(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, "i"))?.[1];
}

const domain: Group = async ({ origin, expectHost }) => {
  const g = "domain";
  const out: string[] = [];
  const base = `https://${expectHost}`;
  const startsOk = (v: string | undefined) =>
    v !== undefined && (v === base || v.startsWith(`${base}/`));

  for (const path of ["/", "/es"]) {
    const res = await get(`${origin}${path}`);
    if (res.status !== 200) {
      out.push(fail(g, `GET ${path} answers 200`, String(res.status)));
      continue;
    }
    out.push(pass(g, `GET ${path} answers 200`));
    const html = await res.text();

    const links = tags(html, "link");
    const canonical = links.find((t) => attr(t, "rel") === "canonical");
    const canonicalHref = canonical ? attr(canonical, "href") : undefined;
    out.push(
      startsOk(canonicalHref)
        ? pass(g, `canonical on ${path} uses ${base}`)
        : fail(
            g,
            `canonical on ${path} uses ${base}`,
            canonicalHref ?? "missing",
          ),
    );

    const alternates = links.filter(
      (t) => attr(t, "rel") === "alternate" && attr(t, "hreflang"),
    );
    const badAlt = alternates
      .map((t) => attr(t, "href"))
      .filter((h) => !startsOk(h));
    out.push(
      alternates.length > 0 && badAlt.length === 0
        ? pass(g, `hreflang alternates on ${path} use ${base}`)
        : fail(
            g,
            `hreflang alternates on ${path} use ${base}`,
            alternates.length === 0 ? "none found" : badAlt.join(", "),
          ),
    );

    const og = tags(html, "meta").find((t) => attr(t, "property") === "og:url");
    const ogUrl = og ? attr(og, "content") : undefined;
    out.push(
      startsOk(ogUrl)
        ? pass(g, `og:url on ${path} uses ${base}`)
        : fail(g, `og:url on ${path} uses ${base}`, ogUrl ?? "missing"),
    );
  }

  const sitemap = await get(`${origin}/sitemap.xml`);
  if (sitemap.status !== 200) {
    out.push(fail(g, "sitemap.xml answers 200", String(sitemap.status)));
  } else {
    const locs = [
      ...(await sitemap.text()).matchAll(/<loc>([^<]*)<\/loc>/g),
    ].map((m) => m[1]);
    const bad = locs.filter((l) => !startsOk(l));
    out.push(
      locs.length > 0 && bad.length === 0
        ? pass(g, `sitemap has ${locs.length} <loc> all on ${base}`)
        : fail(
            g,
            `sitemap <loc> all on ${base}`,
            locs.length === 0 ? "no <loc>" : `${bad.length} off-host`,
          ),
    );
  }

  const robots = await get(`${origin}/robots.txt`);
  const robotsText = robots.status === 200 ? await robots.text() : "";
  out.push(
    new RegExp(
      `^Sitemap:\\s*${base.replace(/\./g, "\\.")}/sitemap\\.xml\\s*$`,
      "mi",
    ).test(robotsText)
      ? pass(g, "robots.txt Sitemap line uses the expected host")
      : fail(
          g,
          "robots.txt Sitemap line uses the expected host",
          `HTTP ${robots.status}`,
        ),
  );

  for (const path of ["/resume.json", "/resume.es.json"]) {
    const res = await get(`${origin}${path}`);
    let url: unknown;
    if (res.status === 200) {
      try {
        url = ((await res.json()) as { basics?: { url?: string } }).basics?.url;
      } catch {
        url = "invalid JSON";
      }
    }
    out.push(
      url === base || (path === "/resume.es.json" && url === `${base}/es`)
        ? pass(g, `${path} basics.url is ${base}`)
        : fail(
            g,
            `${path} basics.url is ${base}`,
            res.status === 200 ? String(url) : `HTTP ${res.status}`,
          ),
    );
  }

  const host = new URL(origin).host;
  if (host.startsWith("www.") || host.endsWith(".vercel.app")) {
    out.push(skip(g, "www redirects 308 to apex", "not an apex origin"));
  } else {
    const res = await get(`https://www.${host}/`, true);
    const location = res.headers.get("location");
    out.push(
      res.status === 308 && location === `https://${host}/`
        ? pass(g, "www answers 308 to the apex")
        : fail(
            g,
            "www answers 308 to the apex",
            `${res.status} ${location ?? "no location"}`,
          ),
    );
  }
  return out;
};

// Unmatched URLs answer a real 404 (D-21). The localized lang lives in the
// client-rendered error shell, so the e2e checks it; here only the status.
const notfound: Group = async ({ origin }) => {
  const g = "notfound";
  const out: string[] = [];
  for (const path of [
    "/foo",
    "/es/foo",
    "/projects/no-existe-check-live",
    "/es/proyectos/no-existe-check-live",
  ]) {
    const res = await get(`${origin}${path}`);
    out.push(
      res.status === 404
        ? pass(g, `GET ${path} answers 404`)
        : fail(g, `GET ${path} answers 404`, String(res.status)),
    );
  }
  return out;
};

// Web Analytics: the script loads same-origin and its view beacon answers 2xx.
const analytics: Group = async ({ origin }) => {
  const g = "analytics";
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch({
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const seen: { url: string; status: number }[] = [];
  try {
    // The analytics script ignores automated browsers (navigator.webdriver or
    // a Headless user agent), so the check presents as a regular Chrome.
    const context = await browser.newContext({
      extraHTTPHeaders: headers(),
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    });
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    });
    const page = await context.newPage();
    page.on("response", (r) => {
      const u = new URL(r.url());
      if (u.origin === new URL(origin).origin)
        seen.push({ url: u.pathname, status: r.status() });
    });
    await page.goto(`${origin}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
  } finally {
    await browser.close();
  }
  const script =
    seen.find(
      (s) => s.url.endsWith("/script.js") && s.url.includes("insights"),
    ) ??
    seen.find((s) => s.url.endsWith("/script.js") && !s.url.includes("_next"));
  const view = seen.find((s) => s.url.endsWith("/view"));
  const dump = seen
    .filter((s) => /script\.js|\/view|insights/.test(s.url))
    .map((s) => `${s.status} ${s.url}`)
    .join("; ");
  return [
    script?.status === 200
      ? pass(g, `analytics script answers 200 (${script.url})`)
      : fail(g, "analytics script answers 200", dump || "not requested"),
    view && view.status >= 200 && view.status < 300
      ? pass(g, `view beacon answers ${view.status} (${view.url})`)
      : fail(g, "view beacon answers 2xx", dump || "not requested"),
  ];
};

// The CSP is enforced (not Report-Only) and allows the Blob client upload API.
const headersGroup: Group = async ({ origin }) => {
  const g = "headers";
  const out: string[] = [];
  for (const path of ["/", "/es"]) {
    const res = await get(`${origin}${path}`);
    const csp = res.headers.get("content-security-policy");
    const reportOnly = res.headers.get("content-security-policy-report-only");
    out.push(
      csp?.includes("connect-src 'self' https://vercel.com/api/blob/")
        ? pass(g, `${path} sends an enforced CSP with the Blob connect-src`)
        : fail(
            g,
            `${path} sends an enforced CSP with the Blob connect-src`,
            csp ?? "no header",
          ),
    );
    out.push(
      reportOnly === null
        ? pass(g, `${path} has no Report-Only header`)
        : fail(g, `${path} has no Report-Only header`, "present"),
    );
  }
  return out;
};

const groups: Record<string, Group> = {
  domain,
  notfound,
  analytics,
  headers: headersGroup,
};

async function main() {
  const args = process.argv.slice(2);
  const originArg = args.find((a) => !a.startsWith("--"));
  if (!originArg) {
    console.error(
      "Usage: pnpm tsx scripts/check-live.ts origin [--only=domain,...] [--expect-host=host]",
    );
    process.exit(2);
  }
  const origin = originArg.replace(/\/+$/, "");
  const only = args
    .find((a) => a.startsWith("--only="))
    ?.slice("--only=".length)
    .split(",");
  const expectHost =
    args
      .find((a) => a.startsWith("--expect-host="))
      ?.slice("--expect-host=".length) ?? new URL(origin).host;

  const names = only ?? Object.keys(groups);
  const unknown = names.filter((n) => !groups[n]);
  if (unknown.length > 0) {
    console.error(`Unknown group: ${unknown.join(", ")}`);
    process.exit(2);
  }

  let failures = 0;
  for (const name of names) {
    for (const l of await groups[name]({ origin, expectHost })) {
      if (l.startsWith("FAIL")) failures += 1;
      console.log(l);
    }
  }
  console.log(failures === 0 ? "RESULT: all PASS" : `RESULT: ${failures} FAIL`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error((error as Error).message);
  process.exit(2);
});
