import { expect, test } from "@playwright/test";
import en from "../messages/en.json";
import es from "../messages/es.json";
import { loadContentDir } from "../src/features/projects/content-file";
import { expectNoBlockingViolations } from "./axe";
import { sql } from "./db";

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

async function headlines() {
  const rows = (await sql`
    select headline_en as "en", headline_es as "es" from site_settings limit 1
  `) as { en: string; es: string }[];
  return rows[0];
}

for (const [path, lang, key] of [
  ["/", "en", "titleEn"],
  ["/es", "es", "titleEs"],
] as const) {
  test(`${path} shows the stored headline and published project titles only`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    const stored = (await headlines())[lang];
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(stored);
    await expect(page.locator("#work")).toBeVisible();
    for (const p of published) {
      await expect(page.getByText(p[key], { exact: true })).toBeVisible();
    }
    for (const p of drafts) {
      await expect(page.getByText(p[key], { exact: true })).toHaveCount(0);
    }
    await expectNoBlockingViolations(page);
  });

  test(`${path} entry links target published slugs in the ${lang} locale`, async ({
    page,
  }) => {
    await page.goto(path);
    const hrefs = await page
      .locator("#work ol > li > a")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href") ?? ""));
    expect(hrefs.length).toBeGreaterThan(0);
    const rows = (await sql`
      select slug from projects where status = 'published' and visible = true
    `) as { slug: string }[];
    const slugs = new Set(rows.map((r) => r.slug));
    const prefix = lang === "en" ? "/projects/" : "/es/proyectos/";
    for (const href of hrefs) {
      expect(href.startsWith(prefix)).toBe(true);
      expect(slugs.has(href.slice(prefix.length))).toBe(true);
    }
  });
}

for (const path of ["/", "/es"]) {
  test(`${path} server HTML has no clock time; the browser fills time and overlap`, async ({
    request,
    page,
  }) => {
    const html = await (await request.get(path)).text();
    expect(html).toContain("UTC-5");
    expect(html).toMatch(/Toronto/);
    expect(html).not.toMatch(/\d{2}:\d{2} UTC-5/);
    await page.goto(path);
    await expect(page.locator("[data-status-time]")).toHaveText(
      /^\d{2}:\d{2} UTC-5$/,
    );
    await expect(page.locator("[data-status-overlap]")).toContainText(/\d+ h/);
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
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.titleEn);
    await expectNoBlockingViolations(page);
    await page.goto(`/es/proyectos/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.titleEs);
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

// The proxy answers a real 404 for unknown and draft slugs on the first
// request (D-06), so these specs assert status, UI, noindex and absent drafts.
for (const slug of [...drafts.map((d) => d.slug), "no-existe"]) {
  test(`${slug} renders the not-found page in both locales`, async ({
    page,
  }) => {
    for (const [path, heading] of [
      [`/projects/${slug}`, en.Site.notFound.title],
      [`/es/proyectos/${slug}`, es.Site.notFound.title],
    ] as const) {
      const res = await page.goto(path);
      expect(res?.status()).toBe(404);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
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
