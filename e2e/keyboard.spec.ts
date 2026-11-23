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
      const project = await firstPublishedProject();
      test.skip(!project, "no published project");
      for (const path of [
        "/",
        `/projects/${project?.slug}`,
        "/about",
        "/contact",
      ]) {
        await page.goto(path);
        const seen = await tabThrough(page);
        expect(seen.length, path).toBeGreaterThan(3);
        for (const f of seen) {
          expect(
            hasRing(f),
            `${path}: no accent ring on <${f.tag}> "${f.text}" ${JSON.stringify(f)}`,
          ).toBe(true);
          expect(f.name, `${path}: honeypot focused`).not.toBe("website");
        }
      }
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
