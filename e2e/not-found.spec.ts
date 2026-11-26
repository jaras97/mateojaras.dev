import { expect, test } from "@playwright/test";
import en from "../messages/en.json";
import es from "../messages/es.json";
import { expectNoBlockingViolations } from "./axe";
import {
  deleteTempProjects,
  firstPublishedProject,
  insertTempProject,
} from "./db";
import { isProductionTarget } from "./target";

const copy = { en: en.Site.notFound, es: es.Site.notFound } as const;
const titles = {
  en: en.Site.notFound.title,
  es: es.Site.notFound.title,
} as const;

test.describe("unmatched paths", () => {
  for (const [path, lang] of [
    ["/foo", "en"],
    ["/es/foo", "es"],
  ] as const) {
    test(`${path} answers 404 in ${lang}`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(404);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        titles[lang],
      );
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute(
        "content",
        /noindex/,
      );
      await expect(page.locator("code", { hasText: path })).toBeVisible();
      await expect(
        page.getByRole("link", { name: copy[lang].home }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: copy[lang].contact }),
      ).toBeVisible();
      if (process.env.DATABASE_URL) {
        const project = await firstPublishedProject();
        await expect(
          page.locator(`main a[href$="/${project.slug}"]`).first(),
        ).toBeVisible();
      }
      await expectNoBlockingViolations(page);
    });
  }
});

const slugPaths = (slug: string) =>
  [
    [`/projects/${slug}`, "en"],
    [`/es/proyectos/${slug}`, "es"],
  ] as const;

async function expectLocalized404(
  page: import("@playwright/test").Page,
  path: string,
  lang: "en" | "es",
) {
  // First request, no memo priming: the proxy decides the status.
  const res = await page.goto(path);
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    titles[lang],
  );
  await expect(page.locator("html")).toHaveAttribute("lang", lang);
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute(
    "content",
    /noindex/,
  );
}

test.describe("unknown and draft slugs", () => {
  for (const [path, lang] of slugPaths("no-existe-e2e")) {
    test(`unknown slug ${path} answers 404 in ${lang}`, async ({ page }) => {
      await expectLocalized404(page, path, lang);
    });
  }

  test.describe("temporary draft project", () => {
    test.skip(!process.env.DATABASE_URL, "DATABASE_URL is not set");
    test.skip(isProductionTarget(), "no DB writes on production");
    let slug = "";

    test.beforeAll(async () => {
      slug = (await insertTempProject()).slug;
    });
    test.afterAll(async () => {
      await deleteTempProjects();
    });

    for (const lang of ["en", "es"] as const) {
      test(`draft slug answers 404 in ${lang}`, async ({ page }) => {
        const path = slugPaths(slug).find(([, l]) => l === lang)?.[0] ?? "";
        await expectLocalized404(page, path, lang);
      });
    }
  });

  test.describe("published project", () => {
    test.skip(!process.env.DATABASE_URL, "DATABASE_URL is not set");

    for (const lang of ["en", "es"] as const) {
      test(`published slug answers 200 in ${lang}`, async ({ request }) => {
        const project = await firstPublishedProject();
        const path =
          slugPaths(project.slug).find(([, l]) => l === lang)?.[0] ?? "";
        const res = await request.get(path);
        expect(res.status()).toBe(200);
      });
    }
  });
});
