import { RATE_WINDOW_MS, signIn } from "./admin-session";
import { expect, test } from "./csp";
import { firstPublishedProject } from "./db";

// QUAL-06: zero CSP violations under the enforced policy across every public
// route in both locales, both color schemes and both motion settings. The
// fixture from ./csp fails a test on any violation.
test.skip(!process.env.DATABASE_URL, "DATABASE_URL is not set");

async function routes() {
  const project = await firstPublishedProject();
  test.skip(!project, "no published project");
  const slug = project?.slug ?? "";
  return [
    "/",
    `/projects/${slug}`,
    "/about",
    "/contact",
    "/es",
    `/es/proyectos/${slug}`,
    "/es/sobre-mi",
    "/es/contacto",
    "/foo",
    "/es/foo",
  ];
}

for (const colorScheme of ["light", "dark"] as const) {
  for (const reducedMotion of ["reduce", "no-preference"] as const) {
    test.describe(`public routes, ${colorScheme}, motion ${reducedMotion}`, () => {
      test.use({ colorScheme, reducedMotion });

      test("no CSP violation", async ({ page }) => {
        test.setTimeout(120_000);
        for (const path of await routes()) {
          await page.goto(path);
          await expect(page.locator("h1").first()).toBeVisible();
          // Motion paths add inline styles while scrolling.
          await page.evaluate(() =>
            window.scrollTo(0, document.documentElement.scrollHeight),
          );
          await page.waitForTimeout(300);
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.waitForLoadState("networkidle");
        }
      });
    });
  }
}

test.describe("admin signed in", () => {
  test.setTimeout(120_000);
  test.skip(
    !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD,
    "ADMIN_EMAIL / ADMIN_PASSWORD are not set",
  );

  test("login, list, editor and CV open without violations", async ({
    page,
  }) => {
    const project = await firstPublishedProject();
    test.skip(!project, "no published project");
    await signIn(page);
    await expect(page).toHaveURL(/\/admin$/);
    for (const path of [
      "/admin",
      "/admin/proyectos",
      `/admin/proyectos/${project?.id}`,
      "/admin/cv",
    ]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
    }
    await page.waitForTimeout(RATE_WINDOW_MS);
  });
});
