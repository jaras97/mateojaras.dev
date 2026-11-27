import { expect, test } from "@playwright/test";

// Phase 5 review fixes (05-09): behavior a visitor or screen reader sees.
// Read-only, so it also runs against production.

const PAGES = [
  ["/", "en"],
  ["/es", "es"],
] as const;

for (const [path, lang] of PAGES) {
  test(`K-24 the hero CTA is a link, not announced as a button (${lang})`, async ({
    page,
  }) => {
    await page.goto(path);
    const cta = page
      .getByRole("link", { name: /let.s talk|hablemos/i })
      .first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", /contact/);
    await expect(
      page.getByRole("button", { name: /let.s talk|hablemos/i }),
    ).toHaveCount(0);
  });

  test(`K-29 footer links are at least 24px tall (${lang})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    const links = page.locator("footer a");
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const box = await links.nth(i).boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(24);
    }
  });
}

test("K-13 no literal backticks in any case study", async ({ page }) => {
  await page.goto("/");
  const hrefs = await page
    .locator('a[href^="/projects/"]')
    .evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute("href")))]);
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) {
    await page.goto(href as string);
    await expect(page.locator("main")).not.toContainText("`");
  }
});

test("K-28 a one-month project period is printed once", async ({ page }) => {
  await page.goto("/");
  const hrefs = await page
    .locator('a[href^="/projects/"]')
    .evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute("href")))]);
  for (const href of hrefs) {
    await page.goto(href as string);
    const text = (await page.locator("main").innerText()).replace(/\s+/g, " ");
    expect(text).not.toMatch(/\b(\w{3} \d{4}) – \1\b/);
  }
});
