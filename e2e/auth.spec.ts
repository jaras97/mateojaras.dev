import { type Browser, expect, type Page, test } from "@playwright/test";
import { expectNoBlockingViolations } from "./axe";

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const baseURL = "http://localhost:3100";
// Seeded admin name (siteFacts.name in scripts/lib/seed-facts.ts).
const adminName = "Mateo Jaramillo";

test.skip(!email || !password, "ADMIN_EMAIL / ADMIN_PASSWORD are not set");

// The sign-in rate limit is 3 per 10 s in the production build. Every UI
// sign-in waits for a fresh window, and the file leaves one for the next spec.
const RATE_WINDOW_MS = 11_000;
test.afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, RATE_WINDOW_MS));
});

async function signIn(page: Page, pass = password ?? "") {
  await page.waitForTimeout(RATE_WINDOW_MS);
  await page.goto("/admin/login");
  await page.getByLabel("Correo").fill(email ?? "");
  await page.getByLabel("Contraseña").fill(pass);
  await page.getByRole("button", { name: "Entrar" }).click();
}

async function freshPage(browser: Browser) {
  const context = await browser.newContext({ baseURL });
  return { context, page: await context.newPage() };
}

test("signs in, survives a reload and signs out", async ({ page }) => {
  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.locator("header")).toContainText(adminName);

  await page.reload();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.locator("header")).toContainText(adminName);

  await expectNoBlockingViolations(page);

  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("a session cookie replayed after logout is rejected", async ({
  page,
  browser,
}) => {
  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  const cookies = (await page.context().cookies()).filter((c) =>
    c.name.endsWith("better-auth.session_token"),
  );
  expect(cookies.length).toBeGreaterThan(0);

  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);

  // The cookie still exists client side, so the proxy lets it through;
  // AuthGate must reject it against the session table.
  const replay = await freshPage(browser);
  await replay.context.addCookies(cookies);
  const raw = await replay.context.request.get("/admin", { maxRedirects: 0 });
  // Inside Suspense the redirect streams after a 200 shell, so the status is
  // not asserted; the body must still carry no admin content.
  expect(await raw.text()).not.toContain(adminName);
  await replay.page.goto("/admin");
  await expect(replay.page).toHaveURL(/\/admin\/login$/);
  expect(await replay.page.content()).not.toContain(adminName);
  await replay.context.close();
});

test("a forged session cookie passes the proxy but not AuthGate", async ({
  browser,
}) => {
  const forged = await freshPage(browser);
  await forged.context.addCookies([
    { name: "better-auth.session_token", value: "forged", url: baseURL },
  ]);
  const raw = await forged.context.request.get("/admin", { maxRedirects: 0 });
  // Inside Suspense the redirect streams after a 200 shell, so the status is
  // not asserted; the body must still carry no admin content.
  const html = await raw.text();
  expect(html).not.toContain(adminName);
  expect(html).not.toContain("Cerrar sesión");
  await forged.page.goto("/admin");
  await expect(forged.page).toHaveURL(/\/admin\/login$/);
  await forged.context.close();
});

test("a wrong password shows the generic error and stays on the login", async ({
  page,
}) => {
  await signIn(page, "definitely-not-the-password");
  await expect(
    page.getByText("Correo o contraseña incorrectos."),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expectNoBlockingViolations(page);
});

test("the login page has no blocking accessibility violations", async ({
  page,
}) => {
  await page.goto("/admin/login");
  await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  await expectNoBlockingViolations(page);
});
