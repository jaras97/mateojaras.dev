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
const FIXTURE_SLUG = "e2e-unsaved-project";

async function removeFixture() {
  await sql`delete from projects where slug = ${FIXTURE_SLUG}`;
}

async function createFixture() {
  await removeFixture();
  const rows = (await sql`
    insert into projects (slug, status, visible, "order", title_en, title_es,
      tagline_en, tagline_es, problem_en, problem_es, role_en, role_es,
      solution_en, solution_es)
    values (${FIXTURE_SLUG}, 'published', false, 999, 'E2E unsaved project',
      'Proyecto sin guardar e2e', 'tagline', 'frase original', 'problem',
      'problema', 'role', 'papel', 'solution', 'solucion')
    returning id
  `) as { id: string }[];
  return rows[0].id;
}

test.afterEach(removeFixture);

test("unsaved changes: dialog on navigation, Cmd+S saves and clears dirty", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const id = await createFixture();
  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto(`/admin/proyectos/${id}`);
  await expect(page.getByLabel("Frase corta ES")).toHaveValue("frase original");
  await expectNoBlockingViolations(page);

  await page.getByLabel("Frase corta ES").fill("frase nueva");
  await expect(page.getByText("Cambios sin guardar").first()).toBeVisible();

  await page
    .getByRole("navigation", { name: "Navegación del panel" })
    .getByRole("link", { name: /02\s*Proyectos/ })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Tienes cambios sin guardar",
  });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Seguir editando" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(dialog).toBeHidden();
  await expect(page.getByLabel("Frase corta ES")).toHaveValue("frase nueva");

  await page.keyboard.press("ControlOrMeta+s");
  await expect(page.getByText(/^Guardado/)).toBeVisible();
  await expect(page.getByText("Cambios sin guardar")).toHaveCount(0);

  await page.reload();
  await expect(page.getByLabel("Frase corta ES")).toHaveValue("frase nueva");
});

test("Salir sin guardar resets the form and navigates", async ({ page }) => {
  test.setTimeout(120_000);
  const id = await createFixture();
  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto(`/admin/proyectos/${id}`);
  await page.getByLabel("Frase corta ES").fill("cambio descartado");
  await page
    .getByRole("navigation", { name: "Navegación del panel" })
    .getByRole("link", { name: /02\s*Proyectos/ })
    .click();
  await page.getByRole("button", { name: "Salir sin guardar" }).click();
  await expect(page).toHaveURL(/\/admin\/proyectos$/);
  const rows = (await sql`
    select tagline_es as t, draft from projects where slug = ${FIXTURE_SLUG}
  `) as { t: string; draft: unknown }[];
  expect(rows[0].t).toBe("frase original");
  expect(rows[0].draft).toBeNull();
});
