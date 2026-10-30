// Project captures for docs/content (D-13, D-14, D-15).
//
//   node scripts/capture-material.ts <slug> [--base-url URL]
//
// Captures every view registered for <slug> in VIEWS at a 1440x900 viewport
// and deviceScaleFactor 2 (a 2880x1800 PNG), then encodes a 1600x1000 WebP
// (16:10) with Chromium's canvas, so no image dependency is needed. Output:
// <main-checkout>/material/<slug>/<file>.png and <file>.webp. material/ is
// git-ignored; the reviewed WebP are committed only after Teo's G7 review.
//
// --base-url overrides the registered base and is required for sample-data
// slugs (Teo's local instance, D-14). When an app has a login, the script
// loads <main-checkout>/.env.capture.local (git-ignored by the .env* rule) and
// reads CAPTURE_LOGIN_EMAIL_<APP> and CAPTURE_LOGIN_PASSWORD_<APP>. It never
// prints them.
//
// Node 24 strips the types: erasable TypeScript only, no relative .ts imports.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { type Browser, chromium, type Page } from "@playwright/test";

const VIEWPORT = { width: 1440, height: 900 };
const SCALE = 2;
const WEBP = { width: 1600, height: 1000, quality: 0.9 };
const SETTLE_MS = 800;
// Scroll-triggered entrance animations on EcoExport ignore reduced motion;
// wait until they finish so no card is captured mid-transform.
const SCROLL_SETTLE_MS = 2_500;

type LoginEnv = "INVENTARIO" | "FINANZAS";
type View = {
  file: string;
  path: string;
  setup?: (page: Page) => Promise<void>;
};
type Project = {
  base: string | null;
  sampleData: boolean;
  loginEnv?: LoginEnv;
  views: View[];
};

// ManuJ: a promotional dialog opens on load and the hero is a carousel.
// Close the dialog (Escape, then its close button if the overlay is still
// there) and put the carousel on its first slide.
async function manujSetup(page: Page): Promise<void> {
  const overlay = page.locator("div.fixed.inset-0.z-50");
  if ((await overlay.count()) > 0) {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    if ((await overlay.count()) > 0) {
      await page.getByRole("button", { name: "Cerrar" }).first().click();
    }
    await overlay.first().waitFor({ state: "detached", timeout: 5_000 });
  }
  const firstSlide = page.getByRole("button", { name: "Ir al slide 1" });
  if ((await firstSlide.count()) > 0) {
    await firstSlide.first().click();
    await page.waitForTimeout(SETTLE_MS);
  }
  await page.mouse.move(0, 0);
}

// EcoExport is a one-page site: section views scroll the anchor to the top
// without smooth scrolling, so the frame does not depend on timing.
function scrollTo(id: string): (page: Page) => Promise<void> {
  return async (page) => {
    await page.evaluate((target) => {
      document.documentElement.style.scrollBehavior = "auto";
      const el = document.getElementById(target);
      if (!el) throw new Error(`section #${target} not found`);
      el.scrollIntoView({ block: "start" });
    }, id);
    await page.waitForTimeout(SCROLL_SETTLE_MS);
  };
}

// Views for the live sites were chosen by Claude after Teo delegated G4
// ("rellena con info de prueba que luego desde admin actualizo todo"); Teo
// reviews every capture at G7 (01-12) and can drop or replace any of them.
// The sample-data apps stay empty until Teo's G5 reply gives URLs and views.
const VIEWS: Record<string, Project> = {
  "centro-estetico-manuj": {
    base: "https://centroesteticomanuj.com",
    sampleData: false,
    views: [
      { file: "01-inicio", path: "/", setup: manujSetup },
      { file: "02-galeria", path: "/galeria", setup: manujSetup },
      { file: "03-reservar", path: "/reservar", setup: manujSetup },
    ],
  },
  "ecoexport-costa-rica": {
    base: "https://www.ecoexportcostarica.com",
    sampleData: false,
    views: [
      { file: "01-inicio", path: "/es" },
      { file: "02-nosotros", path: "/es", setup: scrollTo("nosotros") },
      { file: "03-productos", path: "/es", setup: scrollTo("productos") },
      { file: "04-inicio-en", path: "/en" },
    ],
  },
  "sistema-gestion-inventario": {
    base: null,
    sampleData: true,
    views: [],
  },
  "finanzas-personales": {
    base: null,
    sampleData: true,
    views: [],
  },
};

function fail(message: string): never {
  console.error(`capture-material: ${message}`);
  process.exit(1);
}

// The main checkout root: the parent of the shared .git directory, so the
// captures land in the main tree even when run from a linked worktree.
function mainCheckoutRoot(): string {
  const commonDir = execFileSync(
    "git",
    ["rev-parse", "--path-format=absolute", "--git-common-dir"],
    { encoding: "utf8" },
  ).trim();
  return dirname(commonDir);
}

function parseArgs(argv: string[]): { slug: string; baseUrl?: string } {
  const [slug, ...rest] = argv;
  if (!slug || slug.startsWith("-")) {
    fail("usage: node scripts/capture-material.ts <slug> [--base-url URL]");
  }
  let baseUrl: string | undefined;
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === "--base-url" && rest[i + 1]) {
      baseUrl = rest[i + 1];
      i++;
    } else {
      fail(`unknown argument ${rest[i]}`);
    }
  }
  return { slug, baseUrl };
}

function localeFor(path: string): string {
  return /^\/en(\/|$|\?|#)/.test(path) ? "en-US" : "es-CO";
}

// Width and height from a RIFF/WebP header (VP8, VP8L or VP8X chunk).
function webpSize(buf: Buffer): { width: number; height: number } {
  if (
    buf.toString("ascii", 0, 4) !== "RIFF" ||
    buf.toString("ascii", 8, 12) !== "WEBP"
  ) {
    throw new Error("not a WebP file");
  }
  const chunk = buf.toString("ascii", 12, 16);
  if (chunk === "VP8X") {
    return {
      width: 1 + buf.readUIntLE(24, 3),
      height: 1 + buf.readUIntLE(27, 3),
    };
  }
  if (chunk === "VP8 ") {
    return {
      width: buf.readUInt16LE(26) & 0x3fff,
      height: buf.readUInt16LE(28) & 0x3fff,
    };
  }
  if (chunk === "VP8L") {
    const bits = buf.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  throw new Error(`unknown WebP chunk ${chunk}`);
}

function loadCaptureEnv(root: string): void {
  const file = join(root, ".env.capture.local");
  if (existsSync(file)) process.loadEnvFile(file);
}

async function loginIfAsked(page: Page, app: LoginEnv | undefined) {
  const password = page.locator('input[type="password"]');
  if ((await password.count()) === 0) return;
  if (!app) {
    throw new Error(
      "a login form appeared but this slug has no loginEnv; ask Teo which app needs a login",
    );
  }
  const emailVar = `CAPTURE_LOGIN_EMAIL_${app}`;
  const passwordVar = `CAPTURE_LOGIN_PASSWORD_${app}`;
  const email = process.env[emailVar];
  const secret = process.env[passwordVar];
  if (!email) throw new Error(`missing ${emailVar} in .env.capture.local`);
  if (!secret) throw new Error(`missing ${passwordVar} in .env.capture.local`);
  await page
    .locator('input[type="email"], input[name="email"], input[name="username"]')
    .first()
    .fill(email);
  await password.first().fill(secret);
  await password.first().press("Enter");
  await page.waitForLoadState("networkidle");
}

async function encodeWebp(browser: Browser, png: Buffer): Promise<Buffer> {
  const page = await browser.newPage();
  try {
    const dataUrl = await page.evaluate(
      async ({ src, width, height, quality }) => {
        const img = new Image();
        img.src = src;
        await img.decode();
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no 2d context");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);
        return canvas.toDataURL("image/webp", quality);
      },
      {
        src: `data:image/png;base64,${png.toString("base64")}`,
        width: WEBP.width,
        height: WEBP.height,
        quality: WEBP.quality,
      },
    );
    if (!dataUrl.startsWith("data:image/webp;base64,")) {
      throw new Error("Chromium did not encode WebP");
    }
    return Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");
  } finally {
    await page.close();
  }
}

async function captureView(
  browser: Browser,
  project: Project,
  base: string,
  view: View,
  outDir: string,
): Promise<void> {
  const expectedHost = new URL(base).host;
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: SCALE,
    reducedMotion: "reduce",
    locale: localeFor(view.path),
  });
  const page = await context.newPage();
  try {
    await page.goto(new URL(view.path, base).toString(), {
      waitUntil: "networkidle",
    });
    await loginIfAsked(page, project.loginEnv);
    const finalHost = new URL(page.url()).host;
    if (finalHost !== expectedHost) {
      throw new Error(`landed on ${finalHost}, expected ${expectedHost}`);
    }
    if (view.setup) await view.setup(page);
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    const png = await page.screenshot({ fullPage: false });
    writeFileSync(join(outDir, `${view.file}.png`), png);
    const webp = await encodeWebp(browser, png);
    const webpPath = join(outDir, `${view.file}.webp`);
    writeFileSync(webpPath, webp);
    const size = webpSize(readFileSync(webpPath));
    if (size.width !== WEBP.width || size.height !== WEBP.height) {
      throw new Error(`WebP is ${size.width}x${size.height}`);
    }
    console.log(
      `material ${outDir.split("/").pop()}: ${view.file}.webp ${size.width}x${size.height}`,
    );
  } finally {
    await context.close();
  }
}

async function main(): Promise<number> {
  const { slug, baseUrl } = parseArgs(process.argv.slice(2));
  const project = VIEWS[slug];
  if (!project) {
    fail(`unknown slug ${slug}; known: ${Object.keys(VIEWS).join(", ")}`);
  }
  if (project.sampleData && !baseUrl) {
    fail(`${slug} uses sample data on Teo's local instance: pass --base-url`);
  }
  const base = baseUrl ?? project.base;
  if (!base) fail(`${slug} has no base URL`);
  if (project.views.length === 0) {
    fail(`${slug} has no views yet: they come from Teo (G5), never invented`);
  }

  const root = mainCheckoutRoot();
  if (project.loginEnv) loadCaptureEnv(root);
  const outDir = join(root, "material", slug);
  mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  let failed = 0;
  try {
    for (const view of project.views) {
      try {
        await captureView(browser, project, base, view, outDir);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.log(`FAIL ${slug} ${view.file}: ${message}`);
        failed += 1;
      }
    }
  } finally {
    await browser.close();
  }
  console.log(
    `material ${slug}: ${project.views.length - failed} of ${project.views.length} views in ${outDir}`,
  );
  return failed > 0 ? 1 : 0;
}

process.exitCode = await main();
