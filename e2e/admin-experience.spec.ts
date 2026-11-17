import { expect, type Page, test } from "@playwright/test";
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

// Test data only: a clearly temporary company, removed in afterAll. The seeded
// experiences are never edited, published or deleted by this spec.
const COMPANY = "Empresa temporal e2e";

async function seededOrder() {
  const rows = (await sql`
    select id, company from experiences
    where company <> ${COMPANY}
    order by "order" asc, id asc
  `) as { id: string; company: string }[];
  return rows.map((r) => `${r.id}:${r.company}`);
}

async function fullOrder() {
  const rows = (await sql`
    select company from experiences order by "order" asc, id asc
  `) as { company: string }[];
  return rows.map((r) => r.company);
}

let before: string[] = [];
let createdId = "";

test.beforeAll(async () => {
  await sql`delete from experiences where company = ${COMPANY}`;
  before = await seededOrder();
});

test.afterAll(async () => {
  await sql`delete from experiences where company = ${COMPANY}`;
  expect(await seededOrder()).toEqual(before);
  const left = (await sql`
    select count(*)::int as n from experiences where company = ${COMPANY}
  `) as { n: number }[];
  expect(left[0].n).toBe(0);
  await new Promise((resolve) => setTimeout(resolve, RATE_WINDOW_MS));
});

async function rowOrder(page: Page): Promise<string[]> {
  const handles = page.getByRole("button", { name: /^Mover / });
  await expect(handles.first()).toBeVisible();
  const labels = await handles.evaluateAll((nodes) =>
    nodes.map((n) => n.getAttribute("aria-label") ?? ""),
  );
  return labels.map((l) => l.replace(/^Mover /, ""));
}

async function moveWithKeyboard(
  page: Page,
  key: "ArrowUp" | "ArrowDown",
  position: number,
) {
  await page.getByRole("button", { name: `Mover ${COMPANY}` }).focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("status")).toContainText("está en la posición");
  // dnd-kit attaches its key listeners on a timeout after the lift.
  await page.waitForTimeout(300);
  await page.keyboard.press(key);
  await expect(page.getByRole("status")).toContainText(
    `posición ${position} de`,
  );
  await page.keyboard.press("Space");
  await expect(page.getByText("Orden guardado.")).toBeVisible();
}

test("creates an experience, blocks a half-empty bullet and publishes", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/experiencia");
  await expect(
    page.getByRole("heading", { level: 1, name: "Experiencia" }),
  ).toBeVisible();
  await expectNoBlockingViolations(page);

  await page.getByRole("link", { name: "Nueva experiencia" }).click();
  await page.getByLabel("Empresa", { exact: true }).fill(COMPANY);
  await page.getByLabel("Puesto ES").fill("Puesto de prueba");
  await page.getByLabel("Puesto EN").fill("Test role");
  await page.getByLabel("Inicio").fill("2024-01-15");
  await page.getByRole("button", { name: "Guardar borrador" }).click();
  await expect(page).toHaveURL(/\/admin\/experiencia\/[0-9a-f-]{36}$/);
  createdId = page.url().split("/").pop() ?? "";
  await expect(page.locator("#company")).toHaveValue(COMPANY);
  await expectNoBlockingViolations(page);

  // A half-empty pair blocks publishing.
  await page.getByRole("button", { name: "Añadir logro" }).click();
  await page.getByLabel("Logros 1 ES").fill("Logro de prueba");
  await page
    .getByRole("button", { name: "Publicar", exact: true })
    .first()
    .click();
  await expect(page.getByText("No se pudo publicar")).toBeVisible();
  const draftRows = (await sql`
    select status from experiences where id = ${createdId}
  `) as { status: string }[];
  expect(draftRows[0].status).toBe("draft");

  await page.getByLabel("Logros 1 EN").fill("Test bullet");
  await page
    .getByRole("button", { name: "Publicar", exact: true })
    .first()
    .click();
  await expect(
    page.getByText("Publicado", { exact: true }).first(),
  ).toBeVisible();
  const rows = (await sql`
    select status, draft is null as clean, bullets_es, bullets_en
    from experiences where id = ${createdId}
  `) as {
    status: string;
    clean: boolean;
    bullets_es: string[];
    bullets_en: string[];
  }[];
  expect(rows[0]).toMatchObject({
    status: "published",
    clean: true,
    bullets_es: ["Logro de prueba"],
    bullets_en: ["Test bullet"],
  });
});

test("moves a row with the keyboard only and the order persists", async ({
  page,
}) => {
  test.setTimeout(120_000);
  test.skip(!createdId, "the fixture was not created");
  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/experiencia");
  const original = await fullOrder();
  expect(original.at(-1)).toBe(COMPANY);
  expect(original.length).toBeGreaterThan(1);
  expect(await rowOrder(page)).toEqual(original);

  await moveWithKeyboard(page, "ArrowUp", original.length - 1);
  const moved = [...original.slice(0, -2), COMPANY, original.at(-2) as string];
  expect(await fullOrder()).toEqual(moved);
  await page.reload();
  expect(await rowOrder(page)).toEqual(moved);

  await moveWithKeyboard(page, "ArrowDown", original.length);
  expect(await fullOrder()).toEqual(original);
});

test("Eliminar needs the typed company and removes the row", async ({
  page,
}) => {
  test.setTimeout(120_000);
  test.skip(!createdId, "the fixture was not created");
  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/experiencia");

  await page
    .getByRole("button", { name: `Más acciones para ${COMPANY}` })
    .click();
  await page.getByRole("menuitem", { name: "Eliminar" }).click();
  const confirm = page.getByRole("button", {
    name: "Eliminar definitivamente",
  });
  const input = page.getByLabel(`Escribe ${COMPANY} para confirmar`);
  await expect(confirm).toBeDisabled();
  await input.fill("otro nombre");
  await expect(confirm).toBeDisabled();
  await input.fill(COMPANY);
  await confirm.click();

  await expect(page.getByText(`${COMPANY} eliminado.`)).toBeVisible();
  const left = (await sql`
    select id from experiences where id = ${createdId}
  `) as unknown[];
  expect(left).toHaveLength(0);
  expect(await seededOrder()).toEqual(before);
});
