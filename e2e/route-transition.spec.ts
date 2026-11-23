import { expect, test } from "@playwright/test";

// 04-11: soft navigation with motion allowed stays client-side and error free.
// A route-level <ViewTransition> was tried and removed (see docs/decisions.md):
// it left the case ScrollScene without its accent.
test.use({ reducedMotion: "no-preference" });

test("soft navigation home, about, contact, back keeps the shell and logs no errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.evaluate(() => {
    (window as unknown as { __soft: boolean }).__soft = true;
  });
  const nav = page.getByRole("navigation").first();
  await nav.locator("a").nth(1).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator("main h1:visible")).toHaveCount(1);
  await nav.locator("a").nth(2).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator("main h1:visible")).toHaveCount(1);
  await page.goBack();
  await expect(page).toHaveURL(/\/about$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("#hero-title")).toBeVisible();
  expect(
    await page.evaluate(
      () => (window as unknown as { __soft?: boolean }).__soft === true,
    ),
  ).toBe(true);
  // One main: route changes never duplicate the page shell.
  await expect(page.locator("main")).toHaveCount(1);
  expect(errors).toEqual([]);
});
