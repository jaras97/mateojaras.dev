import { expect, type Page, test } from "@playwright/test";
import { firstPublishedProject } from "./db";

test.skip(!process.env.DATABASE_URL, "DATABASE_URL is not set");

async function slugPath() {
  const project = await firstPublishedProject();
  test.skip(!project, "no published project");
  return `/projects/${project?.slug}`;
}

const accentState = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("[data-accent]")].map((el) => ({
      opacity: Number(getComputedStyle(el).opacity),
      section: el.closest("[data-scene-section]")?.id ?? "",
    })),
  );

async function scrollSecondSection(page: Page) {
  await page.evaluate(() => {
    const sections = document.querySelectorAll("[data-scene-section]");
    const target = sections[1] ?? sections[0];
    const top = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top - window.innerHeight * 0.4);
  });
  const id = await page.evaluate(
    () =>
      (
        document.querySelectorAll("[data-scene-section]")[1] ??
        document.querySelectorAll("[data-scene-section]")[0]
      ).id,
  );
  await expect
    .poll(async () => {
      const lit = (await accentState(page)).filter((a) => a.opacity > 0.5);
      return lit.length === 1 ? lit[0].section : lit.length;
    })
    .toBe(id);
}

test.describe("motion allowed, desktop", () => {
  test.use({
    reducedMotion: "no-preference",
    viewport: { width: 1440, height: 900 },
  });

  test("exactly one number is accented, also after back-navigation", async ({
    page,
  }) => {
    const path = await slugPath();
    await page.goto(path);
    await scrollSecondSection(page);
    await page.locator("header a[href='/about']").first().click();
    await expect(page).toHaveURL(/\/about$/);
    await page.goBack();
    await expect(page.locator("[data-scene-section]").first()).toBeAttached();
    await scrollSecondSection(page);
  });

  test("the number wrapper is sticky", async ({ page }) => {
    await page.goto(await slugPath());
    const position = await page
      .locator("[data-margin-number]")
      .first()
      .evaluate((el) => getComputedStyle(el).position);
    expect(position).toBe("sticky");
  });

  // The scene wrapper may be prefetched from links; the library itself
  // (marked by scrollerProxy) must load only when the case page runs the scene.
  test("ScrollTrigger ships only on the case page", async ({ page }) => {
    const hits: string[] = [];
    page.on("response", async (res) => {
      if (res.request().resourceType() !== "script") return;
      const body = await res.text().catch(() => "");
      if (body.includes("scrollerProxy")) hits.push(res.url());
    });
    for (const route of ["/", "/about"]) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
    }
    expect(hits).toEqual([]);
    await page.goto(await slugPath());
    await scrollSecondSection(page);
    expect(hits.length).toBeGreaterThan(0);
  });
});

test.describe("reduced motion", () => {
  test.use({
    reducedMotion: "reduce",
    viewport: { width: 1440, height: 900 },
  });

  test("numbers are static and no accent shows", async ({ page }) => {
    await page.goto(await slugPath());
    await page.evaluate(() => window.scrollTo(0, 1200));
    const accents = await accentState(page);
    expect(accents.length).toBeGreaterThan(0);
    for (const a of accents) expect(a.opacity).toBe(0);
    const position = await page
      .locator("[data-margin-number]")
      .first()
      .evaluate((el) => getComputedStyle(el).position);
    expect(position).not.toBe("sticky");
  });
});

test.describe("mobile", () => {
  test.use({
    reducedMotion: "no-preference",
    viewport: { width: 390, height: 844 },
  });

  test("no margin number is visible", async ({ page }) => {
    await page.goto(await slugPath());
    await expect(page.locator("[data-margin-number]").first()).toBeHidden();
  });
});
