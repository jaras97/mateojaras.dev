import { expect, test } from "@playwright/test";
import { loadContentDir } from "../src/features/projects/content-file";

type Fm = { clientPermission?: boolean; titleEn: string; titleEs: string };
const projects = loadContentDir("docs/content").map(
  ({ content }) => content.frontMatter as Fm,
);
const published = projects.filter((p) => p.clientPermission === true);
const drafts = projects.filter((p) => p.clientPermission !== true);

for (const [path, lang, key] of [
  ["/en", "en", "titleEn"],
  ["/es", "es", "titleEs"],
] as const) {
  test(`${path} prerenders published project titles only`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    for (const p of published) {
      await expect(page.getByText(p[key], { exact: true })).toBeVisible();
    }
    for (const p of drafts) {
      await expect(page.getByText(p[key], { exact: true })).toHaveCount(0);
    }
  });
}

test("the stored title reaches the HTML as the exact NFC string", async ({
  request,
}) => {
  const manuj = published.find((p) => p.titleEn.includes("ManuJ"));
  expect(manuj).toBeDefined();
  const title = (manuj as Fm).titleEn;
  expect(title).toBe(title.normalize("NFC"));
  const html = await (await request.get("/en")).text();
  expect(html).toContain(title);
});
