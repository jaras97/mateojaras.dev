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

test.afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, RATE_WINDOW_MS));
});

// Own complete published fixture: seeded projects are never touched (D-10).
const FIXTURE_SLUG = "e2e-draft-mode-project";
const PUBLISHED_TITLE = "Proyecto publicado e2e borrador";
const DRAFT_TITLE = `${PUBLISHED_TITLE} editado`;

async function removeFixture() {
  await sql`delete from projects where slug = ${FIXTURE_SLUG}`;
}

async function createFixture() {
  await removeFixture();
  const rows = (await sql`
    insert into projects (slug, status, visible, "order", title_en, title_es,
      tagline_en, tagline_es, problem_en, problem_es, role_en, role_es,
      solution_en, solution_es)
    values (${FIXTURE_SLUG}, 'published', true, 999, 'E2E draft mode project',
      ${PUBLISHED_TITLE}, 'tagline', 'frase', 'problem', 'problema', 'role',
      'papel', 'solution', 'solucion')
    returning id
  `) as { id: string }[];
  return rows[0].id;
}

test.afterEach(removeFixture);

const BAND = "Vista previa · contenido en borrador, no es público";

test("GET /api/draft without a session is 401 and never enables Draft Mode", async ({
  request,
}) => {
  const id = await createFixture();
  const res = await request.get(`/api/draft?kind=project&id=${id}`, {
    maxRedirects: 0,
  });
  expect(res.status()).toBe(401);
  expect(res.headers()["set-cookie"] ?? "").not.toContain("__prerender_bypass");
});

test("POST /api/draft refuses an off-site return path", async ({ request }) => {
  const res = await request.post("/api/draft", {
    form: { path: "//evil.example" },
    maxRedirects: 0,
  });
  expect(res.status()).toBeGreaterThanOrEqual(300);
  expect(res.status()).toBeLessThan(400);
  expect(res.headers().location).toMatch(/^(https?:\/\/[^/]+)?\/$/);
});

test("Previsualizar shows the draft with the band; visitors and exit see the published page", async ({
  page,
  browser,
  context,
}) => {
  test.setTimeout(180_000);
  const id = await createFixture();
  const publicPath = `/es/proyectos/${FIXTURE_SLUG}`;
  const heading = (preview: import("@playwright/test").Page, name: string) =>
    preview.getByRole("heading", { level: 1, name, exact: true });

  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto(`/admin/proyectos/${id}`);
  await expect(page.getByLabel("Título ES")).toHaveValue(PUBLISHED_TITLE);

  // Dirty form: Previsualizar is disabled until the draft is saved.
  await page.getByLabel("Título ES").fill(DRAFT_TITLE);
  await expect(
    page.getByRole("button", { name: "Previsualizar" }).first(),
  ).toBeDisabled();
  await page.keyboard.press("ControlOrMeta+s");
  await expect(page.getByText(/^Guardado/)).toBeVisible();

  const [preview] = await Promise.all([
    context.waitForEvent("page"),
    page.getByRole("link", { name: "Previsualizar" }).first().click(),
  ]);
  await preview.waitForURL(`**${publicPath}`);
  await expect(
    preview.getByRole("region", { name: "Vista previa de borradores" }),
  ).toContainText(BAND);
  await expect(heading(preview, DRAFT_TITLE)).toBeVisible();
  await expectNoBlockingViolations(preview);

  // A visitor without the cookie sees the published version, no band.
  const visitor = await browser.newContext();
  const visitorPage = await visitor.newPage();
  await visitorPage.goto(publicPath);
  await expect(heading(visitorPage, PUBLISHED_TITLE)).toBeVisible();
  await expect(visitorPage.getByText(BAND)).toHaveCount(0);
  await visitor.close();

  // Exit returns to the same path with the published content.
  await preview
    .getByRole("button", { name: "Salir de la vista previa" })
    .click();
  await preview.waitForURL(`**${publicPath}`);
  await expect(heading(preview, PUBLISHED_TITLE)).toBeVisible();
  await expect(preview.getByText(BAND)).toHaveCount(0);
});
