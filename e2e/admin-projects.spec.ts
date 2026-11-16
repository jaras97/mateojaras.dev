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

// The seeded projects are pending content (no tagline, problem or role), so
// the publish rule rejects them, and the e2e must not touch them (D-10). The
// tracer gets its own complete published fixture and deletes it at the end.
const FIXTURE_SLUG = "e2e-tracer-project";
const FIXTURE_TITLE = "Proyecto de prueba e2e";

async function removeFixture() {
  await sql`delete from projects where slug = ${FIXTURE_SLUG}`;
}

async function createFixture() {
  await removeFixture();
  const rows = (await sql`
    insert into projects (slug, status, visible, "order", title_en, title_es,
      tagline_en, tagline_es, problem_en, problem_es, role_en, role_es,
      solution_en, solution_es)
    values (${FIXTURE_SLUG}, 'published', true, 999, 'E2E test project',
      ${FIXTURE_TITLE}, 'tagline', 'frase', 'problem', 'problema', 'role',
      'papel', 'solution', 'solucion')
    returning id
  `) as { id: string }[];
  return rows[0].id;
}

test.afterEach(removeFixture);

test("a draft stays off the site and a publish shows without redeploy", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const id = await createFixture();
  const publicUrl = `/es/proyectos/${FIXTURE_SLUG}`;
  const heading = (name: string) =>
    page.getByRole("heading", { level: 1, name, exact: true });

  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto(`/admin/proyectos/${id}`);
  await expect(page.getByLabel("Título ES")).toHaveValue(FIXTURE_TITLE);
  await expectNoBlockingViolations(page);

  // Prime the public cache with the published title.
  await page.goto(publicUrl);
  await expect(heading(FIXTURE_TITLE)).toBeVisible();

  await page.goto(`/admin/proyectos/${id}`);
  await page.getByLabel("Título ES").fill(`${FIXTURE_TITLE} editado`);
  await page.getByRole("button", { name: "Guardar borrador" }).click();
  await expect(page.getByText(/^Guardado/)).toBeVisible();

  await page.goto(publicUrl);
  await expect(heading(FIXTURE_TITLE)).toBeVisible();

  await page.goto(`/admin/proyectos/${id}`);
  await expect(page.getByLabel("Título ES")).toHaveValue(
    `${FIXTURE_TITLE} editado`,
  );
  await page.getByRole("button", { name: "Publicar cambios" }).click();
  await expect(page.getByText(/^Guardado/)).toBeVisible();

  await page.goto(publicUrl);
  await expect(heading(`${FIXTURE_TITLE} editado`)).toBeVisible();
});
