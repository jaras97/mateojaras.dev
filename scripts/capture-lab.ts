// Lab harness, always against the production build (run pnpm build first;
// never next dev, whose overlay pollutes the captures).
//
//   node scripts/capture-lab.ts check
//     Starts `next start` on port 3100, runs browser checks against /lab with
//     Playwright's Chromium, prints one PASS or FAIL line per check plus a
//     summary and exits 1 if any check failed. When @axe-core/playwright is
//     installed it also runs axe (WCAG 2.0/2.1 A and AA) on /lab/tokens and
//     on /lab/hero for every variant in light and dark, and fails on any
//     serious or critical violation; otherwise it prints "SKIP axe".
//
//   node scripts/capture-lab.ts capture
//     Writes the D-05 review matrix (24 full-page PNGs) to .lab-captures/ at
//     the root of the main checkout, named {variant}-{theme}-{lang}-{width}.png.
//
// Node 24 strips the types: erasable TypeScript only, no relative .ts imports.

import { type ChildProcess, execFileSync, spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { type Browser, chromium, type Page } from "@playwright/test";

const PORT = 3100;
const BASE = `http://localhost:${PORT}`;
const READY_TIMEOUT_MS = 30_000;
const VIEWPORT: Viewport = { width: 390, height: 844 };
const DESKTOP: Viewport = { width: 1440, height: 900 };

// Variants registered in /lab/hero.
const VARIANTS = ["a", "b", "c"] as const;
const LANGS = ["en", "es"] as const;
const THEMES = ["light", "dark"] as const;

// D-05 capture widths. es is captured in light only, at 390 and 1440.
const CAPTURE_VIEWPORTS: Viewport[] = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];
const ES_CAPTURE_WIDTHS = [390, 1440];

const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const AXE_BLOCKING = new Set(["serious", "critical"]);

type Viewport = { width: number; height: number };

// The slice of @axe-core/playwright this script uses. Typed locally so the
// script typechecks and runs whether or not the package is installed.
type AxeViolation = {
  id: string;
  impact?: string | null;
  nodes: { target: unknown[] }[];
};
type AxeBuilderLike = {
  withTags(tags: string[]): AxeBuilderLike;
  analyze(): Promise<{ violations: AxeViolation[] }>;
};
type AxeBuilderCtor = new (options: { page: Page }) => AxeBuilderLike;
type Check = {
  name: string;
  viewport?: Viewport;
  run: (page: Page) => Promise<void>;
};

function fail(message: string): never {
  throw new Error(message);
}

// The fixture headlines, read from the source so the script needs no import
// of app code. Biome may wrap the string onto the next line.
function fixtureHeadlines(): Record<(typeof LANGS)[number], string> {
  const source = readFileSync("src/features/site-settings/fixture.ts", "utf8");
  const read = (field: string) => {
    const match = source.match(new RegExp(`${field}:\\s*"([^"]*)"`));
    if (match === null) fail(`could not read ${field} from fixture.ts`);
    return match[1];
  };
  return { en: read("headlineEn"), es: read("headlineEs") };
}

async function open(page: Page, path: string): Promise<void> {
  const response = await page.goto(`${BASE}${path}`, {
    waitUntil: "networkidle",
  });
  if (response === null) fail(`${path}: no response`);
  if (response.status() !== 200) {
    fail(`${path}: status ${response.status()}, expected 200`);
  }
  await page.evaluate(() => document.fonts.ready);
}

async function assertNoHorizontalScroll(page: Page): Promise<void> {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  if (scrollWidth > innerWidth) {
    fail(`horizontal scroll: scrollWidth ${scrollWidth} > ${innerWidth}`);
  }
}

// #hero-title equals the fixture text, stays at or above 44.8px with
// text-wrap balance, and no StatusLine separator starts a line.
async function assertHero(page: Page, expected: string): Promise<void> {
  const hero = await page.evaluate(() => {
    const title = document.querySelector("#hero-title");
    if (title === null) return null;
    const style = getComputedStyle(title);
    const statusLine = document.querySelector("section p.font-mono");
    const lineLeft = statusLine?.getBoundingClientRect().left ?? 0;
    const separators = Array.from(
      statusLine?.querySelectorAll('span[aria-hidden="true"]') ?? [],
    ).filter((el) => el.textContent?.trim() === "·");
    return {
      text: (title.textContent ?? "").replace(/\s+/g, " ").trim(),
      fontSize: Number.parseFloat(style.fontSize),
      textWrap:
        style.getPropertyValue("text-wrap-style") ||
        style.getPropertyValue("text-wrap"),
      hasStatusLine: statusLine !== null,
      separatorAtLineStart: separators.some(
        (el) => el.getBoundingClientRect().left <= lineLeft + 1,
      ),
    };
  });
  if (hero === null) fail("no #hero-title");
  if (hero.text === "") fail("#hero-title is empty");
  if (hero.text !== expected) {
    fail(`#hero-title is "${hero.text}", expected the fixture headline`);
  }
  if (hero.fontSize < 44.8) fail(`headline font-size ${hero.fontSize}px`);
  if (!hero.textWrap.includes("balance")) {
    fail(`headline text-wrap is "${hero.textWrap}"`);
  }
  if (!hero.hasStatusLine) fail("no StatusLine");
  if (hero.separatorAtLineStart) fail("a StatusLine line starts with ·");
  if ((await page.locator("[data-lab-bar]").count()) !== 0) {
    fail("the lab bar is visible with capture=1");
  }
  await assertSingleAccent(page);
}

// The accent paints at most one element per view (the status dot).
async function assertSingleAccent(page: Page): Promise<void> {
  const painted = await page.evaluate(() => {
    const root = document.querySelector("[data-lab-root]");
    if (root === null) return -1;
    const probe = document.createElement("div");
    probe.style.background = "var(--accent)";
    root.append(probe);
    const accent = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return Array.from(root.querySelectorAll("*")).filter((el) => {
      const style = getComputedStyle(el);
      return (
        style.backgroundColor === accent ||
        style.color === accent ||
        style.borderTopColor === accent ||
        style.borderLeftColor === accent
      );
    }).length;
  });
  if (painted < 0) fail("no [data-lab-root]");
  if (painted > 1)
    fail(`${painted} elements use the accent, expected 1 at most`);
}

// theme=dark: the lab root's background is var(--bg) resolved in dark, and
// it differs from the light body and from var(--bg) outside the root.
async function assertDarkCascade(page: Page): Promise<void> {
  const colors = await page.evaluate(() => {
    const root = document.querySelector("[data-lab-root]");
    if (root === null) return null;
    const probe = (parent: Element) => {
      const el = document.createElement("div");
      el.style.background = "var(--bg)";
      parent.append(el);
      const color = getComputedStyle(el).backgroundColor;
      el.remove();
      return color;
    };
    return {
      root: getComputedStyle(root).backgroundColor,
      darkProbe: probe(root),
      lightProbe: probe(document.body),
      body: getComputedStyle(document.body).backgroundColor,
      hasDarkClass: root.classList.contains("dark"),
    };
  });
  if (colors === null) fail("no [data-lab-root]");
  if (!colors.hasDarkClass) fail("[data-lab-root] has no dark class");
  if (colors.root !== colors.darkProbe) {
    fail(`root background ${colors.root} != var(--bg) ${colors.darkProbe}`);
  }
  if (colors.root === colors.body) {
    fail(`root background equals the body's (${colors.body})`);
  }
  if (colors.root === colors.lightProbe) {
    fail(`root background equals the light var(--bg) (${colors.lightProbe})`);
  }
}

async function loadAxe(): Promise<AxeBuilderCtor | null> {
  // A variable specifier keeps tsc from resolving the module, so the script
  // still typechecks when the package is not installed.
  const specifier = "@axe-core/playwright";
  try {
    const mod = (await import(specifier)) as { default: AxeBuilderCtor };
    return mod.default;
  } catch {
    return null;
  }
}

async function assertAxe(page: Page, AxeBuilder: AxeBuilderCtor) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(AXE_TAGS)
    .analyze();
  const blocking = violations.filter((v) => AXE_BLOCKING.has(v.impact ?? ""));
  if (blocking.length > 0) {
    fail(
      blocking
        .map((v) => {
          const targets = v.nodes
            .map((node) => node.target.map(String).join(" "))
            .join(", ");
          return `${v.id} (${v.impact}) at ${targets}`;
        })
        .join("; "),
    );
  }
}

function axeChecks(AxeBuilder: AxeBuilderCtor): Check[] {
  const checks: Check[] = [
    {
      name: "axe /lab/tokens at 1440px: no serious or critical violation",
      viewport: DESKTOP,
      run: async (page) => {
        await open(page, "/lab/tokens");
        await assertAxe(page, AxeBuilder);
      },
    },
  ];
  for (const variant of VARIANTS) {
    for (const theme of THEMES) {
      checks.push({
        name: `axe /lab/hero?variant=${variant}&theme=${theme} at 1440px: no serious or critical violation`,
        viewport: DESKTOP,
        run: async (page) => {
          await open(
            page,
            `/lab/hero?variant=${variant}&theme=${theme}&capture=1`,
          );
          await assertAxe(page, AxeBuilder);
        },
      });
    }
  }
  return checks;
}

function buildChecks(): Check[] {
  const headlines = fixtureHeadlines();
  const checks: Check[] = [
    {
      name: "/lab answers 200 and links to /lab/tokens and /lab/hero",
      run: async (page) => {
        await open(page, "/lab");
        for (const href of ["/lab/tokens", "/lab/hero"]) {
          if ((await page.locator(`a[href="${href}"]`).count()) === 0) {
            fail(`no link to ${href}`);
          }
        }
      },
    },
    {
      name: "/lab/tokens answers 200, is noindex and shows 8+ format samples in section 05",
      run: async (page) => {
        await open(page, "/lab/tokens");
        const robots = await page
          .locator('meta[name="robots"]')
          .getAttribute("content");
        if (robots === null || !robots.includes("noindex")) {
          fail(`robots meta is "${robots}"`);
        }
        const samples = await page.evaluate(() => {
          const section = Array.from(document.querySelectorAll("section")).find(
            (s) => s.querySelector("span")?.textContent?.trim() === "05",
          );
          if (section === undefined) return -1;
          return (
            (section.textContent ?? "").split("Muestra de formato:").length - 1
          );
        });
        if (samples < 0) fail("no section 05");
        if (samples < 8) fail(`${samples} format sample labels, expected 8+`);
      },
    },
    {
      name: "/lab/hero with no params shows the lab bar on A, Claro, EN and the headline notes",
      run: async (page) => {
        await open(page, "/lab/hero");
        const current = await page
          .locator('[data-lab-bar] a[aria-current="true"]')
          .allTextContents();
        if (current.join(",") !== "A,Claro,EN") {
          fail(`active options are ${current.join(",")}`);
        }
        const bar = (await page.locator("[data-lab-bar]").textContent()) ?? "";
        for (const note of ["Headline ES: borrador", "Headline EN:"]) {
          if (!bar.includes(note)) fail(`lab bar lacks "${note}"`);
        }
      },
    },
  ];

  for (const variant of VARIANTS) {
    for (const lang of LANGS) {
      checks.push({
        name: `/lab/hero?variant=${variant}&lang=${lang}&capture=1 renders the fixture headline at 390px`,
        run: async (page) => {
          await open(
            page,
            `/lab/hero?variant=${variant}&lang=${lang}&capture=1`,
          );
          await assertHero(page, headlines[lang]);
        },
      });
    }
    checks.push({
      name: `/lab/hero?variant=${variant}&theme=dark resolves var(--bg) in dark inside the lab root`,
      run: async (page) => {
        await open(page, `/lab/hero?variant=${variant}&theme=dark&capture=1`);
        await assertDarkCascade(page);
      },
    });
  }

  checks.push({
    name: "/lab/hero?variant=c at 1440px puts the index in the right columns behind a 1px rule, top-aligned with the headline",
    viewport: DESKTOP,
    run: async (page) => {
      await open(page, "/lab/hero?variant=c&capture=1");
      const layout = await page.evaluate(() => {
        const title = document.querySelector("#hero-title");
        const list = document.querySelector("section ol");
        if (title === null || list === null) return null;
        const t = title.getBoundingClientRect();
        const l = list.getBoundingClientRect();
        const style = getComputedStyle(list);
        return {
          titleRight: t.right,
          titleTop: t.top,
          listLeft: l.left,
          listTop: l.top,
          items: list.querySelectorAll("li").length,
          links: list.querySelectorAll("a").length,
          borderLeft: style.borderLeftWidth,
          borderTop: style.borderTopWidth,
        };
      });
      if (layout === null) fail("no headline or index");
      if (layout.listLeft <= layout.titleRight) {
        fail("the index does not sit to the right of the headline");
      }
      if (Math.abs(layout.listTop - layout.titleTop) > 1) {
        fail(`index top ${layout.listTop} != headline top ${layout.titleTop}`);
      }
      if (layout.items !== 3) fail(`${layout.items} index items`);
      if (layout.links !== 0) fail("the index items are links");
      if (layout.borderLeft !== "1px" || layout.borderTop !== "0px") {
        fail(
          `index borders left ${layout.borderLeft}, top ${layout.borderTop}`,
        );
      }
    },
  });

  checks.push({
    name: "/lab/hero?variant=zz shows the unknown-variant message with links to A, B and C",
    run: async (page) => {
      await open(page, "/lab/hero?variant=zz");
      const text = (await page.locator("body").textContent()) ?? "";
      if (!text.includes("no existe. Elige A, B o C.")) {
        fail("no unknown-variant message");
      }
      for (const variant of ["a", "b", "c"]) {
        const links = await page
          .locator(`[data-lab-root] > div a[href*="variant=${variant}"]`)
          .count();
        if (links === 0) fail(`no link to variant ${variant}`);
      }
    },
  });

  return checks;
}

async function waitForServer(server: ChildProcess): Promise<void> {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      fail(`next start exited with code ${server.exitCode}`);
    }
    try {
      const response = await fetch(`${BASE}/lab`);
      if (response.status === 200) return;
    } catch {
      // not listening yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  fail(`/lab did not answer 200 within ${READY_TIMEOUT_MS / 1000} s`);
}

async function portIsFree(): Promise<boolean> {
  try {
    await fetch(BASE);
    return false;
  } catch {
    return true;
  }
}

function stopServer(server: ChildProcess | undefined): void {
  if (
    server === undefined ||
    server.exitCode !== null ||
    server.pid === undefined
  ) {
    return;
  }
  try {
    // detached: the server leads its own process group, so this also stops
    // the workers next start spawns.
    process.kill(-server.pid, "SIGTERM");
  } catch {
    server.kill("SIGTERM");
  }
}

async function runCheck(browser: Browser, check: Check): Promise<boolean> {
  const context = await browser.newContext({
    viewport: check.viewport ?? VIEWPORT,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  try {
    await check.run(page);
    await assertNoHorizontalScroll(page);
    console.log(`PASS ${check.name}`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`FAIL ${check.name}: ${message}`);
    return false;
  } finally {
    await context.close();
  }
}

// Starts next start on PORT, launches Chromium, runs the body and always
// stops both. Returns the body's exit code, or 1 on a harness failure.
async function withServer(
  label: string,
  body: (browser: Browser) => Promise<number>,
): Promise<number> {
  if (!existsSync(".next/BUILD_ID")) {
    console.error(
      "No production build found (.next/BUILD_ID). Run pnpm build first.",
    );
    return 1;
  }
  if (!(await portIsFree())) {
    console.error(
      `Port ${PORT} is already in use. Stop that process and retry.`,
    );
    return 1;
  }

  let server: ChildProcess | undefined;
  let browser: Browser | undefined;
  const onSignal = () => {
    stopServer(server);
    process.exit(130);
  };
  process.on("SIGINT", onSignal);
  process.on("SIGTERM", onSignal);

  try {
    server = spawn("node_modules/.bin/next", ["start", "-p", String(PORT)], {
      detached: true,
      stdio: "ignore",
    });
    await waitForServer(server);
    browser = await chromium.launch();
    return await body(browser);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`FAIL harness: ${message}`);
    console.log(`${label}: harness failed`);
    return 1;
  } finally {
    await browser?.close();
    stopServer(server);
  }
}

async function check(): Promise<number> {
  return withServer("lab check", async (browser) => {
    const AxeBuilder = await loadAxe();
    const checks = buildChecks();
    if (AxeBuilder === null) {
      console.log("SKIP axe: no instalado");
    } else {
      checks.push(...axeChecks(AxeBuilder));
    }

    let passed = 0;
    let failed = 0;
    for (const item of checks) {
      if (await runCheck(browser, item)) passed += 1;
      else failed += 1;
    }
    console.log(`lab check: ${passed} passed, ${failed} failed`);
    return failed > 0 ? 1 : 0;
  });
}

// The main checkout root: the parent of the shared .git directory. In a
// normal checkout that is the repo root; from a linked worktree it is the
// main tree, so the captures land where Teo looks.
function mainCheckoutRoot(): string {
  const commonDir = execFileSync(
    "git",
    ["rev-parse", "--path-format=absolute", "--git-common-dir"],
    { encoding: "utf8" },
  ).trim();
  return dirname(commonDir);
}

type Capture = {
  variant: (typeof VARIANTS)[number];
  theme: (typeof THEMES)[number];
  lang: (typeof LANGS)[number];
  viewport: Viewport;
};

function captureMatrix(): Capture[] {
  const matrix: Capture[] = [];
  for (const variant of VARIANTS) {
    for (const viewport of CAPTURE_VIEWPORTS) {
      for (const theme of THEMES) {
        matrix.push({ variant, theme, lang: "en", viewport });
      }
    }
    for (const viewport of CAPTURE_VIEWPORTS) {
      if (ES_CAPTURE_WIDTHS.includes(viewport.width)) {
        matrix.push({ variant, theme: "light", lang: "es", viewport });
      }
    }
  }
  return matrix;
}

async function capture(): Promise<number> {
  const outDir = join(mainCheckoutRoot(), ".lab-captures");
  mkdirSync(outDir, { recursive: true });
  // Drop earlier PNGs so the folder holds exactly this run's matrix.
  for (const file of readdirSync(outDir)) {
    if (file.endsWith(".png")) rmSync(join(outDir, file));
  }

  return withServer("lab capture", async (browser) => {
    let written = 0;
    let failed = 0;
    for (const item of captureMatrix()) {
      const file = `${item.variant}-${item.theme}-${item.lang}-${item.viewport.width}.png`;
      const context = await browser.newContext({
        viewport: item.viewport,
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      try {
        await open(
          page,
          `/lab/hero?variant=${item.variant}&theme=${item.theme}&lang=${item.lang}&capture=1`,
        );
        await page.screenshot({ path: join(outDir, file), fullPage: true });
        written += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.log(`FAIL capture ${file}: ${message}`);
        failed += 1;
      } finally {
        await context.close();
      }
    }
    console.log(`lab capture: ${written} written to ${outDir}`);
    return failed > 0 ? 1 : 0;
  });
}

const mode = process.argv[2];
if (mode === "check") {
  process.exitCode = await check();
} else if (mode === "capture") {
  process.exitCode = await capture();
} else {
  console.error("Usage: node scripts/capture-lab.ts check|capture");
  process.exitCode = 1;
}
