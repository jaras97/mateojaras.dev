import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { loadContentDir } from "../src/features/projects/content-file";
import { expectNoBlockingViolations } from "./axe";

type Fm = {
  slug: string;
  clientPermission?: boolean;
  titleEn: string;
  titleEs: string;
};
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

for (const p of published) {
  const slug = p.slug;
  test(`case study ${slug} is localized in both locales`, async ({ page }) => {
    await page.goto(`/projects/${slug}`);
    await expect(page.locator("h1")).toHaveText(p.titleEn);
    await expectNoBlockingViolations(page);
    await page.goto(`/es/proyectos/${slug}`);
    await expect(page.locator("h1")).toHaveText(p.titleEs);
    await expectNoBlockingViolations(page);
    await page.goto(`/es/projects/${slug}`);
    expect(new URL(page.url()).pathname).toBe(`/es/proyectos/${slug}`);
  });

  test(`home links to the localized URL of ${slug}`, async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: p.titleEn })).toHaveAttribute(
      "href",
      `/projects/${slug}`,
    );
    await page.goto("/es");
    await expect(page.getByRole("link", { name: p.titleEs })).toHaveAttribute(
      "href",
      `/es/proyectos/${slug}`,
    );
  });
}

// With Cache Components the shell is sent before the request-time notFound()
// runs: the status is 200 on a cold server and 404 once the cache is warm
// (Next docs: loading.md "Status codes"). Accepted by decision (decisions.md),
// so these specs assert the UI, noindex and absent draft content, not the status.
for (const slug of [...drafts.map((d) => d.slug), "no-existe"]) {
  test(`${slug} renders the not-found page in both locales`, async ({
    page,
  }) => {
    for (const [path, heading] of [
      [`/projects/${slug}`, "Page not found"],
      [`/es/proyectos/${slug}`, "Página no encontrada"],
    ] as const) {
      const res = await page.goto(path);
      expect([200, 404]).toContain(res?.status());
      await expect(page.locator("h1")).toHaveText(heading);
      // notFound() runs inside the case study's Suspense boundary, so the
      // streamed noindex can sit next to the head one: every tag must say noindex.
      const robots = page.locator('meta[name="robots"]');
      await expect(robots.first()).toHaveAttribute("content", "noindex");
      const contents = await robots.evaluateAll((nodes) =>
        nodes.map((n) => n.getAttribute("content")),
      );
      expect(new Set(contents)).toEqual(new Set(["noindex"]));
    }
    const titles = drafts.flatMap((d) => [d.titleEn, d.titleEs]);
    const body = await page.locator("body").innerText();
    for (const t of titles) expect(body).not.toContain(t);
  });
}
