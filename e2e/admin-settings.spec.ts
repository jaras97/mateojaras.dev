import { expect, test } from "@playwright/test";
import { RATE_WINDOW_MS, signIn } from "./admin-session";
import { expectNoBlockingViolations } from "./axe";
import { sql } from "./db";

test.skip(
  !process.env.ADMIN_EMAIL ||
    !process.env.ADMIN_PASSWORD ||
    !process.env.DATABASE_URL,
  "ADMIN_EMAIL / ADMIN_PASSWORD / DATABASE_URL are not set",
);

test.describe.configure({ mode: "serial" });

// SiteSettings is one real row. The spec snapshots every column (except
// updated_at) first and puts it back exactly: through Publicar in the test and,
// as a safety net, through SQL in afterAll. Equality is asserted at the end.
const ID = "00000000-0000-0000-0000-000000000001";

async function snapshot() {
  const rows = (await sql`
    select to_jsonb(s) - 'updated_at' as row
    from site_settings s where id = ${ID}
  `) as { row: Record<string, unknown> }[];
  return rows[0].row;
}

async function restore(row: Record<string, unknown>) {
  await sql`
    update site_settings s set
      name = r.name, headline_en = r.headline_en, headline_es = r.headline_es,
      bio_en = r.bio_en, bio_es = r.bio_es, now_en = r.now_en, now_es = r.now_es,
      availability_status = r.availability_status,
      available_from = r.available_from, timezone = r.timezone,
      location = r.location, languages = r.languages, email = r.email,
      calendar_url = r.calendar_url, github_url = r.github_url,
      linkedin_url = r.linkedin_url, seo_title_en = r.seo_title_en,
      seo_title_es = r.seo_title_es,
      seo_description_en = r.seo_description_en,
      seo_description_es = r.seo_description_es,
      status = r.status, draft = r.draft
    from jsonb_populate_record(null::site_settings, ${JSON.stringify(row)}::jsonb) r
    where s.id = ${ID}
  `;
}

let original: Record<string, unknown>;

test.beforeAll(async () => {
  original = await snapshot();
});

test.afterAll(async () => {
  const now = await snapshot();
  if (JSON.stringify(now) !== JSON.stringify(original)) {
    await restore(original);
  }
  expect(await snapshot()).toEqual(original);
  await new Promise((resolve) => setTimeout(resolve, RATE_WINDOW_MS));
});

test("the draft stays private, previews on the home and publishes without redeploy", async ({
  page,
  browser,
  context,
}) => {
  test.setTimeout(240_000);
  const name = String(original.name);
  const draftName = `${name} borrador`;
  const heading = (target: import("@playwright/test").Page, text: string) =>
    // The home H1 is the headline (04-08); the stored name shows in the header.
    target.locator("header").getByText(text, { exact: true });

  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/ajustes");
  await expect(
    page.getByRole("heading", { level: 1, name: "Ajustes" }),
  ).toBeVisible();
  await expect(page.locator("#name")).toHaveValue(name);
  await expectNoBlockingViolations(page);

  try {
    await page.locator("#name").fill(draftName);
    await page
      .getByRole("button", { name: "Guardar borrador" })
      .first()
      .click();
    await expect(page.getByText(/^Guardado/)).toBeVisible();

    const stored = (await sql`
      select name, draft->>'name' as draft_name from site_settings where id = ${ID}
    `) as { name: string; draft_name: string }[];
    expect(stored[0]).toEqual({ name, draft_name: draftName });

    // A visitor without the cookie still sees the published name.
    const visitor = await browser.newContext();
    const visitorPage = await visitor.newPage();
    await visitorPage.goto("/");
    await expect(heading(visitorPage, name)).toBeVisible();

    // Previsualizar opens the home in Draft Mode with the draft applied.
    const [preview] = await Promise.all([
      context.waitForEvent("page"),
      page.getByRole("link", { name: "Previsualizar" }).first().click(),
    ]);
    await preview.waitForURL("**/es");
    await expect(
      preview.getByRole("region", { name: "Vista previa de borradores" }),
    ).toBeVisible();
    await expect(heading(preview, draftName)).toBeVisible();
    await preview
      .getByRole("button", { name: "Salir de la vista previa" })
      .click();
    await expect(heading(preview, name)).toBeVisible();

    // Publicar: the visitor sees the new name without a redeploy.
    await page
      .getByRole("button", { name: "Publicar cambios" })
      .first()
      .click();
    await expect(
      page.getByText("Publicado. Ya se ve en el sitio."),
    ).toBeVisible();
    await expect(async () => {
      await visitorPage.goto("/");
      await expect(heading(visitorPage, draftName)).toBeVisible({
        timeout: 2_000,
      });
    }).toPass({ timeout: 30_000 });

    // Put the original name back through Publicar so the cache tags agree.
    await page.locator("#name").fill(name);
    await page
      .getByRole("button", { name: "Publicar cambios" })
      .first()
      .click();
    await expect(
      page.getByText("Publicado. Ya se ve en el sitio.").first(),
    ).toBeVisible();
    await expect(async () => {
      await visitorPage.goto("/");
      await expect(heading(visitorPage, name)).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 30_000 });
    await visitor.close();
  } finally {
    // Whatever happened, the real row ends exactly as it started.
    if (JSON.stringify(await snapshot()) !== JSON.stringify(original)) {
      await restore(original);
    }
  }
  expect(await snapshot()).toEqual(original);
});

// Regression: updateTag(settings) invalidates the case-study App Shell, whose
// runtime regeneration used to bail out (500 on every slug) while the page
// awaited params outside Suspense. Seeded projects are only read here.
test("case studies still render after a settings publish", async ({
  page,
  request,
}) => {
  test.setTimeout(120_000);
  const rows = (await sql`
    select slug, title_en as "titleEn", title_es as "titleEs"
    from projects where status = 'published' and visible = true
    order by "order" asc limit 1
  `) as { slug: string; titleEn: string; titleEs: string }[];
  test.skip(!rows[0], "no published visible project");
  const project = rows[0];

  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/ajustes");
  await expect(page.locator("#name")).toHaveValue(String(original.name));
  // Publish the unchanged values: same row, one updateTag(settings).
  await page.getByRole("button", { name: "Publicar cambios" }).first().click();
  await expect(
    page.getByText("Publicado. Ya se ve en el sitio."),
  ).toBeVisible();

  for (const [path, title] of [
    [`/projects/${project.slug}`, project.titleEn],
    [`/es/proyectos/${project.slug}`, project.titleEs],
  ] as const) {
    // Twice: the first request after the tag may render on demand.
    for (let i = 0; i < 2; i++) {
      expect((await request.get(path)).status()).toBe(200);
      await page.goto(path);
      await expect(
        page.getByRole("heading", { level: 1, name: title, exact: true }),
      ).toBeVisible();
    }
  }
  for (const [path, heading] of [
    ["/projects/e2e-no-existe", "Page not found"],
    ["/es/proyectos/e2e-no-existe", "Página no encontrada"],
  ] as const) {
    expect([200, 404]).toContain((await request.get(path)).status());
    await page.goto(path);
    await expect(page.locator("h1")).toHaveText(heading);
  }
});
