import { expect, type Page, test } from "@playwright/test";
import { firstPublishedProject, sql } from "./db";

test.skip(!process.env.DATABASE_URL, "DATABASE_URL is not set");

// Metadata every public page must carry in its language: title, description,
// hreflang en/es/x-default as absolute URLs, canonical, og:* and a PNG og:image.
async function expectSeo(
  page: Page,
  request: Parameters<Parameters<typeof test>[2]>[0]["request"],
  path: string,
  { lang, en, es }: { lang: "en" | "es"; en: string; es: string },
) {
  const res = await page.goto(path);
  expect(res?.status()).toBe(200);
  expect((await page.title()).trim()).not.toBe("");
  const meta = (sel: string) =>
    page.locator(sel).first().getAttribute("content");
  expect(((await meta('meta[name="description"]')) ?? "").trim()).not.toBe("");
  expect(await meta('meta[property="og:title"]')).toBeTruthy();
  expect(await meta('meta[property="og:description"]')).toBeTruthy();
  expect(await meta('meta[property="og:site_name"]')).toBeTruthy();
  expect(await meta('meta[property="og:locale"]')).toBe(
    lang === "es" ? "es_CO" : "en_US",
  );
  const href = (l: string) =>
    page.locator(`link[rel="alternate"][hreflang="${l}"]`).getAttribute("href");
  const [hEn, hEs, hDefault] = [
    await href("en"),
    await href("es"),
    await href("x-default"),
  ];
  expect(hEn).toMatch(new RegExp(`^https?://[^/]+${en === "/" ? "/?" : en}$`));
  expect(hEs).toMatch(new RegExp(`^https?://[^/]+${es}$`));
  expect(hDefault).toBe(hEn);
  const own = lang === "en" ? en : es;
  // The site root serializes without a trailing slash.
  const tail = (p: string) => (p === "/" ? "/?" : p);
  expect(
    await page.locator('link[rel="canonical"]').getAttribute("href"),
  ).toMatch(new RegExp(`^https?://[^/]+${tail(own)}$`));
  expect(await meta('meta[property="og:url"]')).toMatch(
    new RegExp(`${tail(own)}$`),
  );
  const image = await meta('meta[property="og:image"]');
  expect(image).toBeTruthy();
  // The og:image URL carries the configured site origin; fetch it by path.
  const img = await request.get(new URL(image as string).pathname);
  expect(img.status()).toBe(200);
  expect(img.headers()["content-type"]).toContain("image/png");
  expect((await img.body()).length).toBeGreaterThan(1000);
}

test("case study carries localized metadata, hreflang and an og image", async ({
  page,
  request,
}) => {
  const project = await firstPublishedProject();
  test.skip(!project, "no published project");
  const en = `/projects/${project.slug}`;
  const es = `/es/proyectos/${project.slug}`;
  await expectSeo(page, request, en, { lang: "en", en, es });
  await expectSeo(page, request, es, { lang: "es", en, es });
});

const pages = [
  { en: "/", es: "/es" },
  { en: "/about", es: "/es/sobre-mi" },
  { en: "/contact", es: "/es/contacto" },
] as const;

for (const { en, es } of pages) {
  for (const lang of ["en", "es"] as const) {
    test(`${lang === "en" ? en : es} carries metadata, hreflang and an og image`, async ({
      page,
      request,
    }) => {
      await expectSeo(page, request, lang === "en" ? en : es, { lang, en, es });
    });
  }
}

async function hiddenOrDraftSlugs() {
  const rows = (await sql`
    select slug from projects where status <> 'published' or visible = false
  `) as { slug: string }[];
  return rows.map((r) => r.slug);
}

test("sitemap.xml lists public pages and published cases in both languages", async ({
  request,
}) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const xml = await res.text();
  for (const path of ["/es/sobre-mi", "/es/contacto", "/about", "/contact"]) {
    expect(xml).toContain(path);
  }
  const published = (await sql`
    select slug from projects where status = 'published' and visible = true
  `) as { slug: string }[];
  for (const { slug } of published) {
    expect(xml).toContain(`/projects/${slug}<`);
    expect(xml).toContain(`/es/proyectos/${slug}"`);
  }
  expect(xml).toContain("hreflang");
  expect(xml).toContain("x-default");
  expect(xml).not.toContain("/admin");
  expect(xml).not.toContain("/api");
  for (const slug of await hiddenOrDraftSlugs()) {
    expect(xml).not.toContain(`/${slug}<`);
  }
});

test("robots.txt blocks admin and api and links the sitemap", async ({
  request,
}) => {
  const res = await request.get("/robots.txt");
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toContain("Disallow: /admin");
  expect(body).toContain("Disallow: /api");
  expect(body).toContain("Sitemap:");
});
