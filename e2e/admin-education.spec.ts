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

// Test data only: a clearly temporary institution, removed in afterAll. Any
// existing education row is left alone.
const INSTITUTION = "Institución temporal e2e";
const PROGRAM_ES = "Programa temporal e2e";
const PROGRAM_EN = "Temporary program e2e";

async function others() {
  const rows = (await sql`
    select id, institution, "order" from education
    where institution <> ${INSTITUTION}
    order by "order" asc, id asc
  `) as { id: string; institution: string; order: number }[];
  return rows;
}

let before: Awaited<ReturnType<typeof others>> = [];
let createdId = "";

test.beforeAll(async () => {
  await sql`delete from education where institution = ${INSTITUTION}`;
  before = await others();
});

test.afterAll(async () => {
  await sql`delete from education where institution = ${INSTITUTION}`;
  expect(await others()).toEqual(before);
  await new Promise((resolve) => setTimeout(resolve, RATE_WINDOW_MS));
});

test("creates an education entry, blocks publish without the EN program, publishes", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/educacion");
  await expect(
    page.getByRole("heading", { level: 1, name: "Educación" }),
  ).toBeVisible();
  await expectNoBlockingViolations(page);

  await page.getByRole("link", { name: "Nueva formación" }).first().click();
  await page.getByLabel("Institución", { exact: true }).fill(INSTITUTION);
  await page.getByLabel("Programa ES").fill(PROGRAM_ES);
  await page.getByRole("button", { name: "Guardar borrador" }).click();
  await expect(page).toHaveURL(/\/admin\/educacion\/[0-9a-f-]{36}$/);
  createdId = page.url().split("/").pop() ?? "";
  await expect(page.locator("#institution")).toHaveValue(INSTITUTION);
  await expectNoBlockingViolations(page);

  // Publishing needs the English program.
  await page
    .getByRole("button", { name: "Publicar", exact: true })
    .first()
    .click();
  await expect(page.getByText("No se pudo publicar")).toBeVisible();
  const draftRows = (await sql`
    select status from education where id = ${createdId}
  `) as { status: string }[];
  expect(draftRows[0].status).toBe("draft");

  // The previous route stays mounted (hidden): scope to the edit form.
  await page
    .locator("#programa")
    .getByLabel("Programa EN", { exact: true })
    .fill(PROGRAM_EN);
  await page
    .getByRole("button", { name: "Publicar", exact: true })
    .first()
    .click();
  await expect(
    page.getByText("Publicado", { exact: true }).first(),
  ).toBeVisible();
  const rows = (await sql`
    select status, draft is null as clean, program_es, program_en
    from education where id = ${createdId}
  `) as {
    status: string;
    clean: boolean;
    program_es: string;
    program_en: string;
  }[];
  expect(rows[0]).toMatchObject({
    status: "published",
    clean: true,
    program_es: PROGRAM_ES,
    program_en: PROGRAM_EN,
  });
});

test("toggles Visible and deletes with the typed institution", async ({
  page,
}) => {
  test.setTimeout(120_000);
  test.skip(!createdId, "the fixture was not created");
  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/educacion");

  const visible = page.getByRole("switch", {
    name: `Visible: ${INSTITUTION}`,
  });
  await expect(visible).toBeChecked();
  await visible.click();
  await expect(page.getByText("Oculto del sitio.")).toBeVisible();
  const hidden = (await sql`
    select visible from education where id = ${createdId}
  `) as { visible: boolean }[];
  expect(hidden[0].visible).toBe(false);
  await visible.click();
  await expect(page.getByText("Visible en el sitio.")).toBeVisible();
  const shown = (await sql`
    select visible from education where id = ${createdId}
  `) as { visible: boolean }[];
  expect(shown[0].visible).toBe(true);

  await page
    .getByRole("button", { name: `Más acciones para ${INSTITUTION}` })
    .click();
  await page.getByRole("menuitem", { name: "Eliminar" }).click();
  const confirm = page.getByRole("button", {
    name: "Eliminar definitivamente",
  });
  const input = page.getByLabel(`Escribe ${INSTITUTION} para confirmar`);
  await expect(confirm).toBeDisabled();
  await input.fill("otro nombre");
  await expect(confirm).toBeDisabled();
  await input.fill(INSTITUTION);
  await confirm.click();

  await expect(page.getByText(`${INSTITUTION} eliminado.`)).toBeVisible();
  const left = (await sql`
    select id from education where id = ${createdId}
  `) as unknown[];
  expect(left).toHaveLength(0);
  expect(await others()).toEqual(before);
});
