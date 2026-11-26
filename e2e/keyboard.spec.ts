import { expect, type Page, test } from "@playwright/test";
import { firstPublishedProject } from "./db";

// QUAL-03 backstop: skip link first, a visible 2px accent focus ring on every
// interactive element, honeypot never focused, one tab stop per home entry.
test.skip(!process.env.DATABASE_URL, "DATABASE_URL is not set");
test.use({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });

type Focused = {
  tag: string;
  text: string;
  name: string;
  outlineStyle: string;
  outlineWidth: number;
  outlineOffset: number;
  outlineColor: string;
  boxShadow: string;
  accent: string;
};

async function tabThrough(page: Page, max = 80) {
  const seen: Focused[] = [];
  let first = true;
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab");
    const f = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const probe = document.createElement("i");
      probe.style.color = "var(--accent)";
      document.body.appendChild(probe);
      const accent = getComputedStyle(probe).color;
      probe.remove();
      return {
        tag: el.tagName.toLowerCase(),
        text: (el.textContent ?? "").trim().slice(0, 40),
        name: (el as HTMLInputElement).name ?? "",
        outlineStyle: cs.outlineStyle,
        outlineWidth: Number.parseFloat(cs.outlineWidth),
        outlineOffset: Number.parseFloat(cs.outlineOffset),
        outlineColor: cs.outlineColor,
        boxShadow: cs.boxShadow,
        accent,
      } satisfies Focused;
    });
    if (!f) break;
    if (first) first = false;
    seen.push(f);
    if (seen.length > 3 && seen[0].text === f.text && seen.length > 8) break;
  }
  return seen;
}

function hasRing(f: Focused) {
  const outline =
    f.outlineStyle === "solid" &&
    f.outlineWidth === 2 &&
    f.outlineOffset === 2 &&
    f.outlineColor === f.accent;
  const shadow = f.boxShadow !== "none" && f.boxShadow.includes(f.accent);
  return outline || shadow;
}

async function allRoutes() {
  const project = await firstPublishedProject();
  test.skip(!project, "no published project");
  const slug = project?.slug ?? "";
  return [
    "/",
    `/projects/${slug}`,
    "/about",
    "/contact",
    "/es",
    `/es/proyectos/${slug}`,
    "/es/sobre-mi",
    "/es/contacto",
    "/foo",
    "/es/foo",
  ];
}

async function walk(page: Page, path: string, width: number) {
  await page.goto(path);
  await page.locator("h1").first().waitFor();
  const seen = await tabThrough(page);
  expect(seen.length, `${path} @${width}`).toBeGreaterThan(3);
  for (const f of seen) {
    expect(
      hasRing(f),
      `${path} @${width}: no accent ring on <${f.tag}> "${f.text}" ${JSON.stringify(f)}`,
    ).toBe(true);
    expect(f.name, `${path}: honeypot focused`).not.toBe("website");
  }
}

for (const theme of ["light", "dark"] as const) {
  test.describe(`${theme} theme`, () => {
    test.use({ colorScheme: theme });

    test("skip link is first and moves focus to #main", async ({ page }) => {
      await page.goto("/");
      await page.keyboard.press("Tab");
      const first = await page.evaluate(() =>
        (document.activeElement as HTMLAnchorElement).getAttribute("href"),
      );
      expect(first).toBe("#main");
      await page.keyboard.press("Enter");
      await expect(page.locator("#main")).toBeFocused();
    });

    test("every focused element shows the accent ring; honeypot is skipped", async ({
      page,
    }) => {
      for (const path of await allRoutes()) await walk(page, path, 1440);
    });

    test("focus order: skip link, then the header", async ({ page }) => {
      for (const path of await allRoutes()) {
        await page.goto(path);
        await page.locator("h1").first().waitFor();
        await page.keyboard.press("Tab");
        expect(
          await page.evaluate(() =>
            (document.activeElement as HTMLAnchorElement).getAttribute("href"),
          ),
          `${path}: first stop`,
        ).toBe("#main");
        await page.keyboard.press("Tab");
        expect(
          await page.evaluate(
            () => !!document.activeElement?.closest("header"),
          ),
          `${path}: second stop inside header`,
        ).toBe(true);
      }
    });

    test.describe("390 px", () => {
      test.use({ viewport: { width: 390, height: 844 } });

      test("rings on every tabbable, header neighbours included", async ({
        page,
      }) => {
        for (const path of await allRoutes()) {
          await walk(page, path, 390);
          // Adjacent header controls each keep their own detectable ring.
          await page.goto(path);
          const stops = await tabThrough(page, 12);
          const headerCount = await page
            .locator("header a, header button")
            .count();
          const inHeader = stops.slice(1, 1 + headerCount);
          for (const f of inHeader) {
            expect(hasRing(f), `${path} header <${f.tag}> "${f.text}"`).toBe(
              true,
            );
          }
        }
      });
    });
  });
}

test("each home entry is one tab stop", async ({ page }) => {
  await page.goto("/");
  const entries = await page.locator("#work li").count();
  test.skip(entries === 0, "no entries");
  const stops = await page.locator("#work a, #work button").count();
  expect(stops).toBe(entries);
});
