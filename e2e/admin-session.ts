import type { Page } from "@playwright/test";

// The sign-in rate limit is 3 per 10 s in the production build. Every UI
// sign-in waits for a fresh window.
export const RATE_WINDOW_MS = 11_000;

export async function signIn(page: Page) {
  await page.waitForTimeout(RATE_WINDOW_MS);
  await page.goto("/admin/login");
  await page.getByLabel("Correo").fill(process.env.ADMIN_EMAIL ?? "");
  await page.getByLabel("Contraseña").fill(process.env.ADMIN_PASSWORD ?? "");
  await page.getByRole("button", { name: "Entrar" }).click();
}
