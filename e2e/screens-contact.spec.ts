import { expect, test } from "@playwright/test";
import { captureMatrix } from "./screens";

test.skip(!process.env.DATABASE_URL, "DATABASE_URL is not set");

// Contact capture matrix (390/768/1440, light and dark, en and es) plus the
// error and confirmation states at 390 and 1440 light. Output: test-results/screens/contact/.
test("contact screenshots", async ({ page }) => {
  test.setTimeout(240_000);
  await captureMatrix(page, {
    name: "contact",
    paths: ["/contact", "/es/contacto"],
  });
  const states = [
    { path: "/contact", slug: "contact", send: "Send", name: "Name" },
    {
      path: "/es/contacto",
      slug: "es-contacto",
      send: "Enviar",
      name: "Nombre",
    },
  ];
  for (const s of states) {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: "light" });
      await page.goto(s.path);
      await page.getByRole("button", { name: s.send }).click();
      await expect(
        page.locator("[role=alert], [id$=-error]").first(),
      ).toBeVisible();
      await page.screenshot({
        path: `test-results/screens/contact/${s.slug}-error-${width}-light.png`,
        fullPage: true,
      });
      await page.goto(s.path);
      await page.getByLabel(s.name, { exact: true }).fill("Bot e2e");
      await page.locator("input[type=email]").fill("e2e-shot@example.com");
      await page.locator("textarea").fill("Mensaje de prueba automatizada.");
      await page.locator('input[name="website"]').fill("x", { force: true });
      await page.waitForTimeout(3200);
      await page.getByRole("button", { name: s.send }).click();
      await expect(page.getByRole("heading", { level: 2 })).toBeVisible();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: `test-results/screens/contact/${s.slug}-confirmation-${width}-light.png`,
        fullPage: true,
      });
    }
  }
});
