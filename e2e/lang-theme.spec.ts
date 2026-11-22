import { expect, test } from "@playwright/test";
import { firstPublishedProject } from "./db";
import { captureMatrix } from "./screens";

const pairs: [string, string][] = [
  ["/", "/es"],
  ["/about", "/es/sobre-mi"],
  ["/contact", "/es/contacto"],
];

for (const [en, es] of pairs) {
  test(`language link pairs ${en} and ${es}`, async ({ page }) => {
    await page.goto(en);
    await page.getByRole("link", { name: /español/i }).click();
    await expect(page).toHaveURL(new RegExp(`${es}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await page.getByRole("link", { name: /english/i }).click();
    await expect(page).toHaveURL(new RegExp(`${en === "/" ? "/$" : `${en}$`}`));
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
}

test("language link on a case study keeps the slug", async ({ page }) => {
  test.skip(!process.env.DATABASE_URL, "needs DATABASE_URL");
  const project = await firstPublishedProject();
  test.skip(!project, "no published project");
  await page.goto(`/projects/${project.slug}`);
  await page.getByRole("link", { name: /español/i }).click();
  await expect(page).toHaveURL(new RegExp(`/es/proyectos/${project.slug}$`));
  await page.getByRole("link", { name: /english/i }).click();
  await expect(page).toHaveURL(new RegExp(`/projects/${project.slug}$`));
});

test("the hash survives the language switch", async ({ page }) => {
  await page.goto("/about#x");
  await page.getByRole("link", { name: /español/i }).click();
  await expect(page).toHaveURL(/\/es\/sobre-mi#x$/);
});

test("active nav link is only marked on about and contact", async ({
  page,
}) => {
  await page.goto("/about");
  await expect(
    page.getByRole("link", { name: "About", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.goto("/");
  await expect(page.locator("header [aria-current='page']")).toHaveCount(0);
});

test("a stored dark theme paints dark on the first frame and persists", async ({
  page,
}) => {
  const messages: string[] = [];
  page.on("console", (m) => messages.push(m.text()));
  await page.addInitScript(() => {
    if (!localStorage.getItem("seeded")) {
      localStorage.setItem("seeded", "1");
      localStorage.setItem("theme", "dark");
    }
  });
  await page.goto("/about", { waitUntil: "commit" });
  await page.waitForSelector("html.dark", { timeout: 500 });
  await page.waitForLoadState("load");
  await page.getByRole("button", { name: /light/i }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  expect(messages.filter((m) => /hydrat/i.test(m))).toEqual([]);
});

test("without a stored theme the system scheme decides", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/about");
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("header fits one line at 390px in es", async ({ page }) => {
  await captureMatrix(page, {
    name: "header",
    paths: ["/es/sobre-mi"],
    widths: [390],
  });
  const fits = await page.evaluate(() => {
    const h = document.querySelector("header");
    return h ? h.scrollWidth <= h.clientWidth : false;
  });
  expect(fits).toBe(true);
});

test("footer resume link follows the locale", async ({ page }) => {
  await page.goto("/es");
  await expect(
    page
      .getByRole("contentinfo")
      .getByRole("link", { name: /CV|currículum|PDF/i }),
  ).toHaveAttribute("href", "/cv/es.pdf");
});
