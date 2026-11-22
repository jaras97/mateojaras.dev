import { expect, test } from "@playwright/test";
import { expectNoBlockingViolations } from "./axe";

const routes = [
  { path: "/about", lang: "en", h1: "About" },
  { path: "/es/sobre-mi", lang: "es", h1: "Sobre mí" },
  { path: "/contact", lang: "en", h1: "Contact" },
  { path: "/es/contacto", lang: "es", h1: "Contacto" },
] as const;

for (const { path, lang, h1 } of routes) {
  test(`${path} renders one main landmark and a skip link`, async ({
    page,
  }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
    await expect(page.getByRole("main")).toHaveCount(1);
    await page.keyboard.press("Tab");
    const skip = page.locator("a[href='#main']");
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await expectNoBlockingViolations(page);
  });
}

// next-intl canonicalizes an English pathname under /es to the localized one
// (same as /es/projects/[slug] in public.spec.ts), so /es/about is never served.
test("/es/about redirects to /es/sobre-mi", async ({ page }) => {
  await page.goto("/es/about");
  expect(new URL(page.url()).pathname).toBe("/es/sobre-mi");
  await page.goto("/es/contact");
  expect(new URL(page.url()).pathname).toBe("/es/contacto");
});
