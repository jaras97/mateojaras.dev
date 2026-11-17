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

// Test data only: clearly temporary skills in category tools, removed in
// afterAll. Seeded skills are never edited, published, reordered or deleted.
const NAME = "Skill temporal e2e";
const NAME_B = "Skill temporal e2e B";
const LIKE = "%temporal e2e%";

async function seededSnapshot() {
  const rows = (await sql`
    select id, name, category, "order", featured, visible, status
    from skills where name not like ${LIKE}
    order by id
  `) as Record<string, unknown>[];
  return rows.map((r) => JSON.stringify(r));
}

async function toolsOrder() {
  const rows = (await sql`
    select name from skills where category = 'tools' order by "order" asc, id asc
  `) as { name: string }[];
  return rows.map((r) => r.name);
}

let before: string[] = [];
let createdId = "";

test.beforeAll(async () => {
  await sql`delete from skills where name like ${LIKE}`;
  before = await seededSnapshot();
});

test.afterAll(async () => {
  await sql`delete from skills where name like ${LIKE}`;
  expect(await seededSnapshot()).toEqual(before);
  const left = (await sql`
    select count(*)::int as n from skills where name like ${LIKE}
  `) as { n: number }[];
  expect(left[0].n).toBe(0);
  await new Promise((resolve) => setTimeout(resolve, RATE_WINDOW_MS));
});

async function createDraft(page: Page, name: string) {
  await page.goto("/admin/skills/nueva");
  await page.getByLabel("Nombre", { exact: true }).fill(name);
  await page.getByLabel("Categoría").selectOption({ label: "Herramientas" });
  await page.getByRole("button", { name: "Guardar borrador" }).click();
}

async function toolsRowOrder(page: Page): Promise<string[]> {
  const handles = page
    .locator('section[aria-labelledby="skills-tools"]')
    .getByRole("button", { name: /^Mover / });
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
  await page
    .getByRole("button", { name: `Mover ${NAME}`, exact: true })
    .focus();
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

test("creates skills, refuses a duplicate name and publishes", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/skills");
  await expect(
    page.getByRole("heading", { level: 1, name: "Skills" }),
  ).toBeVisible();
  await expectNoBlockingViolations(page);

  await createDraft(page, NAME);
  await expect(page).toHaveURL(/\/admin\/skills\/[0-9a-f-]{36}$/);
  createdId = page.url().split("/").pop() ?? "";
  await expect(page.locator("#name")).toHaveValue(NAME);
  await expectNoBlockingViolations(page);

  // A second skill with the same name is refused as taken.
  await createDraft(page, NAME);
  await expect(
    page.getByText("Ya hay una skill con este nombre. Elige otro."),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/skills\/nueva$/);

  await createDraft(page, NAME_B);
  await expect(page).toHaveURL(/\/admin\/skills\/[0-9a-f-]{36}$/);

  await page.goto(`/admin/skills/${createdId}`);
  await page.getByLabel("Años de uso").fill("3");
  await page
    .getByRole("button", { name: "Publicar", exact: true })
    .first()
    .click();
  await expect(
    page.getByText("Publicado", { exact: true }).first(),
  ).toBeVisible();
  const rows = (await sql`
    select status, draft is null as clean, years_used from skills
    where id = ${createdId}
  `) as { status: string; clean: boolean; years_used: number }[];
  expect(rows[0]).toMatchObject({
    status: "published",
    clean: true,
    years_used: 3,
  });
});

test("moves a skill with the keyboard inside its category", async ({
  page,
}) => {
  test.setTimeout(120_000);
  test.skip(!createdId, "the fixture was not created");
  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/skills");
  const original = await toolsOrder();
  expect(original.slice(-2)).toEqual([NAME, NAME_B]);
  expect(await toolsRowOrder(page)).toEqual(original);

  await moveWithKeyboard(page, "ArrowDown", original.length);
  const moved = [...original.slice(0, -2), NAME_B, NAME];
  expect(await toolsOrder()).toEqual(moved);
  await page.reload();
  expect(await toolsRowOrder(page)).toEqual(moved);

  await moveWithKeyboard(page, "ArrowUp", original.length - 1);
  expect(await toolsOrder()).toEqual(original);
  expect(await seededSnapshot()).toEqual(before);
});

test("Destacado switches live and persists", async ({ page }) => {
  test.setTimeout(120_000);
  test.skip(!createdId, "the fixture was not created");
  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/skills");
  const featured = page.getByRole("switch", {
    name: `Destacado: ${NAME}`,
    exact: true,
  });

  await featured.click();
  await expect(page.getByText("Marcada como destacada.")).toBeVisible();
  let rows = (await sql`
    select featured from skills where id = ${createdId}
  `) as { featured: boolean }[];
  expect(rows[0].featured).toBe(true);

  await featured.click();
  await expect(page.getByText("Ya no es destacada.")).toBeVisible();
  rows = (await sql`
    select featured from skills where id = ${createdId}
  `) as { featured: boolean }[];
  expect(rows[0].featured).toBe(false);
  await expectNoBlockingViolations(page);
});

test("Eliminar needs the typed name and removes the row", async ({ page }) => {
  test.setTimeout(120_000);
  test.skip(!createdId, "the fixture was not created");
  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/skills");

  await page
    .getByRole("button", { name: `Más acciones para ${NAME}`, exact: true })
    .click();
  await page.getByRole("menuitem", { name: "Eliminar" }).click();
  const confirm = page.getByRole("button", {
    name: "Eliminar definitivamente",
  });
  const input = page.getByLabel(`Escribe ${NAME} para confirmar`);
  await expect(confirm).toBeDisabled();
  await input.fill("otro nombre");
  await expect(confirm).toBeDisabled();
  await input.fill(NAME);
  await confirm.click();

  await expect(page.getByText(`${NAME} eliminado.`)).toBeVisible();
  const left = (await sql`
    select id from skills where id = ${createdId}
  `) as unknown[];
  expect(left).toHaveLength(0);
  expect(await seededSnapshot()).toEqual(before);
});
