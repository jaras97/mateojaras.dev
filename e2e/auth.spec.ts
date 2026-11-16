import { expect, test } from "@playwright/test";

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

test.skip(!email || !password, "ADMIN_EMAIL / ADMIN_PASSWORD are not set");

test("signs in and sees the admin name", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Correo").fill(email ?? "");
  await page.getByLabel("Contraseña").fill(password ?? "");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  // Seeded admin name (siteFacts.name in scripts/lib/seed-facts.ts).
  await expect(page.locator("header")).toContainText("Mateo Jaramillo");
});
