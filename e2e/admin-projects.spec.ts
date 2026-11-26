import { expect, test } from "@playwright/test";
import { RATE_WINDOW_MS, signIn } from "./admin-session";
import { expectNoBlockingViolations } from "./axe";
import {
  deleteTempProjects,
  firstPublishedProject,
  sql,
  TEMP_TITLE,
} from "./db";

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
test.afterAll(deleteTempProjects);

test("a draft stays off the site and a publish shows without redeploy", async ({
  page,
}) => {
  test.setTimeout(120_000);
  // Warm the guard memo with a seeded slug first, so the fixture below is a
  // warm miss that must re-read the DB (D-06: negatives are never memoized).
  const seeded = await firstPublishedProject();
  if (seeded) await page.request.get(`/es/proyectos/${seeded.slug}`);
  const id = await createFixture();
  const publicUrl = `/es/proyectos/${FIXTURE_SLUG}`;
  const heading = (name: string) =>
    page.getByRole("heading", { level: 1, name, exact: true });

  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto(`/admin/proyectos/${id}`);
  await expect(page.getByLabel("Título ES")).toHaveValue(FIXTURE_TITLE);
  await expectNoBlockingViolations(page);

  // Just published: the very first request answers 200.
  expect((await page.request.get(publicUrl)).status()).toBe(200);

  // Prime the public cache with the published title.
  await page.goto(publicUrl);
  await expect(heading(FIXTURE_TITLE)).toBeVisible();

  await page.goto(`/admin/proyectos/${id}`);
  // The form is server-rendered: typing before hydration appends to the
  // default value instead of replacing it. Wait, then confirm what was typed.
  await page.waitForLoadState("networkidle");
  const titleEs = page.getByLabel("Título ES");
  await expect(async () => {
    await titleEs.fill(`${FIXTURE_TITLE} editado`);
    await expect(titleEs).toHaveValue(`${FIXTURE_TITLE} editado`, {
      timeout: 1_000,
    });
  }).toPass({ timeout: 15_000 });
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

test("create a draft, publish is blocked on missing fields, then delete", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await deleteTempProjects();
  const slug = `e2e-temp-${Date.now()}`;
  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/proyectos/nuevo");
  await expectNoBlockingViolations(page);
  await page.getByLabel("Título ES").fill(TEMP_TITLE);
  await page.getByLabel("Título EN").fill("Temporary e2e project");
  await page.getByLabel("Slug").fill(slug);
  await page.getByRole("button", { name: "Guardar borrador" }).click();
  await expect(page).toHaveURL(/\/admin\/proyectos\/[0-9a-f-]{36}$/);
  await expect(page.getByText("Borrador", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Publicar" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "No se pudo publicar: faltan" }),
  ).toBeVisible();
  await expect(page.getByLabel("Frase corta EN")).toBeFocused();

  await page.goto("/admin/proyectos");
  await page
    .getByRole("button", { name: `Más acciones para ${TEMP_TITLE}` })
    .click();
  await page.getByRole("menuitem", { name: "Eliminar" }).click();
  await page
    .getByLabel(`Escribe ${TEMP_TITLE} para confirmar`)
    .fill(TEMP_TITLE);
  await page.getByRole("button", { name: "Eliminar definitivamente" }).click();
  await expect(page.getByText(`${TEMP_TITLE} eliminado.`)).toBeVisible();

  const left = (await sql`
    select count(*)::int as n from projects where slug like 'e2e-temp-%'
  `) as { n: number }[];
  expect(left[0].n).toBe(0);
});
