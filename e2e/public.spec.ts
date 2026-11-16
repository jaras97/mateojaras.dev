import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { loadContentDir } from "../src/features/projects/content-file";
import { expectNoBlockingViolations } from "./axe";

type Fm = { clientPermission?: boolean; titleEn: string; titleEs: string };
const projects = loadContentDir("docs/content").map(
  ({ content }) => content.frontMatter as Fm,
);
const published = projects.filter((p) => p.clientPermission === true);
const drafts = projects.filter((p) => p.clientPermission !== true);
const siteName: string = JSON.parse(
  readFileSync("content/site_settings.json", "utf8"),
).rows[0].name;

for (const [path, lang, key] of [
  ["/", "en", "titleEn"],
  ["/es", "es", "titleEs"],
] as const) {
  test(`${path} shows the site name and published project titles only`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.locator("h1")).toHaveText(siteName);
    for (const p of published) {
      await expect(page.getByText(p[key], { exact: true })).toBeVisible();
    }
    for (const p of drafts) {
      await expect(page.getByText(p[key], { exact: true })).toHaveCount(0);
    }
    await expectNoBlockingViolations(page);
  });
}

test("Accept-Language: es does not change `/` and sets no locale cookie", async ({
  playwright,
  baseURL,
}) => {
  const ctx = await playwright.request.newContext({
    baseURL,
    extraHTTPHeaders: { "Accept-Language": "es" },
  });
  const res = await ctx.get("/");
  expect(res.status()).toBe(200);
  expect(await res.text()).toMatch(/<html[^>]*lang="en"/);
  const cookies = res
    .headersArray()
    .filter((h) => h.name.toLowerCase() === "set-cookie");
  expect(cookies.some((h) => h.value.includes("NEXT_LOCALE"))).toBe(false);
  await ctx.dispose();
});

test("/en redirects to /", async ({ page }) => {
  await page.goto("/en");
  expect(new URL(page.url()).pathname).toBe("/");
});

test("/admin paths without a session cookie end on /admin/login", async ({
  page,
}) => {
  await page.goto("/admin/anything");
  expect(new URL(page.url()).pathname).toBe("/admin/login");
});

test("the stored title reaches the HTML as the exact NFC string", async ({
  request,
}) => {
  const manuj = published.find((p) => p.titleEn.includes("ManuJ"));
  expect(manuj).toBeDefined();
  const title = (manuj as Fm).titleEn;
  expect(title).toBe(title.normalize("NFC"));
  const html = await (await request.get("/")).text();
  expect(html).toContain(title);
});
