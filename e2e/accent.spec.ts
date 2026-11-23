import { expect, type Page, test } from "@playwright/test";
import { firstPublishedProject } from "./db";

// DESIGN.md §3 / UI-SPEC accent table: one accent element per view at rest, and
// the accent never colors text below 24px.
test.skip(!process.env.DATABASE_URL, "DATABASE_URL is not set");

type Hit = { tag: string; how: string; text: string; size: number };

async function accentElements(page: Page): Promise<Hit[]> {
  return page.evaluate(() => {
    const probe = document.createElement("i");
    probe.style.color = "var(--accent)";
    document.body.appendChild(probe);
    const accent = getComputedStyle(probe).color;
    probe.remove();
    const hits: Hit[] = [];
    for (const el of document.querySelectorAll<HTMLElement>("body *")) {
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      // Effective opacity along the ancestors (hidden margin numbers are 0).
      let opacity = 1;
      for (let n: HTMLElement | null = el; n; n = n.parentElement) {
        opacity *= Number(getComputedStyle(n).opacity);
      }
      if (opacity < 0.5) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const ownText = [...el.childNodes]
        .filter((c) => c.nodeType === Node.TEXT_NODE)
        .map((c) => c.textContent?.trim() ?? "")
        .join("");
      const size = Number.parseFloat(cs.fontSize);
      if (ownText && cs.color === accent) {
        hits.push({
          tag: el.tagName,
          how: "text",
          text: ownText.slice(0, 30),
          size,
        });
      }
      if (cs.backgroundColor === accent) {
        hits.push({
          tag: el.tagName,
          how: "background",
          text: ownText.slice(0, 30),
          size,
        });
      }
      if (
        cs.textDecorationLine.includes("underline") &&
        cs.textDecorationColor === accent
      ) {
        hits.push({
          tag: el.tagName,
          how: "underline",
          text: ownText.slice(0, 30),
          size,
        });
      }
    }
    return hits;
  });
}

const paths = [
  { path: "/", expected: 1 },
  { path: "/es", expected: 1 },
  { path: "/about", expected: 1 },
  { path: "/es/sobre-mi", expected: 1 },
  { path: "/contact", expected: 1 },
  { path: "/es/contacto", expected: 1 },
];

test.describe("at rest, reduced motion", () => {
  test.use({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
  for (const { path, expected } of paths) {
    test(`${path} has ${expected} accent element`, async ({ page }) => {
      await page.goto(path);
      const hits = await accentElements(page);
      // Home: the status dot only shows when availability is open or dated.
      if (path === "/" || path === "/es") {
        expect(hits.length, JSON.stringify(hits)).toBeLessThanOrEqual(expected);
      } else {
        expect(hits.length, JSON.stringify(hits)).toBe(expected);
      }
      for (const h of hits.filter((x) => x.how === "text")) {
        expect(h.size, JSON.stringify(h)).toBeGreaterThanOrEqual(24);
      }
    });
  }

  test("case study with reduced motion shows no accent", async ({ page }) => {
    const project = await firstPublishedProject();
    test.skip(!project, "no published project");
    await page.goto(`/projects/${project?.slug}`);
    const hits = await accentElements(page);
    expect(hits.filter((h) => h.how === "text" && h.size < 24)).toEqual([]);
  });
});

test.describe("case study with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("1440: one current number; 390: none", async ({ page }) => {
    const project = await firstPublishedProject();
    test.skip(!project, "no published project");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/projects/${project?.slug}`);
    await page.evaluate(() => {
      const s = document.querySelectorAll("[data-scene-section]");
      const t = s[1] ?? s[0];
      window.scrollTo(0, t.getBoundingClientRect().top + window.scrollY - 360);
    });
    await expect
      .poll(async () => (await accentElements(page)).length, { timeout: 5000 })
      .toBe(1);
    const hits = await accentElements(page);
    for (const h of hits.filter((x) => x.how === "text")) {
      expect(h.size).toBeGreaterThanOrEqual(24);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/projects/${project?.slug}`);
    await page.waitForTimeout(400);
    expect(await accentElements(page)).toEqual([]);
  });
});
