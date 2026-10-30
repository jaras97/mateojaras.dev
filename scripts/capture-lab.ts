// Lab harness. Run: node scripts/capture-lab.ts check (after pnpm build).
// Starts `next start` on port 3100, runs browser checks against /lab with
// Playwright's Chromium, prints one PASS or FAIL line per check plus a
// summary, stops the server and exits 1 if any check failed.
// Node 24 strips the types: erasable TypeScript only, no relative .ts imports.
// 01-08 adds the capture mode and the axe gate.

import { type ChildProcess, spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { type Browser, chromium, type Page } from "@playwright/test";

const PORT = 3100;
const BASE = `http://localhost:${PORT}`;
const READY_TIMEOUT_MS = 30_000;
const VIEWPORT = { width: 390, height: 844 };

// Variants registered in /lab/hero.
const VARIANTS = ["a"] as const;
const LANGS = ["en", "es"] as const;

type Check = { name: string; run: (page: Page) => Promise<void> };

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
    viewport: VIEWPORT,
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

async function check(): Promise<number> {
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

    let passed = 0;
    let failed = 0;
    for (const item of buildChecks()) {
      if (await runCheck(browser, item)) passed += 1;
      else failed += 1;
    }
    console.log(`lab check: ${passed} passed, ${failed} failed`);
    return failed > 0 ? 1 : 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`FAIL harness: ${message}`);
    console.log("lab check: 0 passed, 1 failed");
    return 1;
  } finally {
    await browser?.close();
    stopServer(server);
  }
}

const mode = process.argv[2];
if (mode === "check") {
  process.exitCode = await check();
} else {
  console.error("Usage: node scripts/capture-lab.ts check");
  process.exitCode = 1;
}
