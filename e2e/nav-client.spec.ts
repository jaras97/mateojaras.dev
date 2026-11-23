import { expect, test } from "@playwright/test";

// Header links are next-intl Links: navigation stays client-side (no full load)
// and aria-current follows the route.
for (const c of [
  { home: "/", about: "About", contact: "Contact", work: "Work" },
  { home: "/es", about: "Sobre mí", contact: "Contacto", work: "Proyectos" },
] as const) {
  test(`header nav navigates client-side at ${c.home}`, async ({ page }) => {
    await page.goto(c.home);
    const nav = page.getByRole("navigation").first();
    await expect(nav.locator("a").first()).toBeVisible();
    await page.evaluate(() => {
      (window as unknown as { __nav: number }).__nav = 1;
    });
    const links = nav.locator("a");
    await expect(links).toHaveCount(3);
    await links.nth(1).click();
    await expect(page.locator("main h1")).toBeVisible();
    await expect(nav.locator('a[aria-current="page"]')).toHaveCount(1);
    await links.nth(2).click();
    await expect(nav.locator('a[aria-current="page"]')).toHaveAttribute(
      "href",
      /contact|contacto/,
    );
    await links.nth(0).click();
    await expect(page).toHaveURL(/#work$/);
    const marker = await page.evaluate(
      () => (window as unknown as { __nav?: number }).__nav,
    );
    expect(marker).toBe(1);
  });
}
