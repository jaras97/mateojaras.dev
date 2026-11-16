import { expect, type Page, test } from "@playwright/test";
import { RATE_WINDOW_MS, signIn } from "./admin-session";
import { expectNoBlockingViolations } from "./axe";
import {
  deleteTempProjects,
  firstPublishedProject,
  insertTempProject,
  type OrderRow,
  projectOrder,
  sql,
  TEMP_TITLE,
} from "./db";

test.skip(
  !process.env.ADMIN_EMAIL ||
    !process.env.ADMIN_PASSWORD ||
    !process.env.DATABASE_URL,
  "ADMIN_EMAIL / ADMIN_PASSWORD / DATABASE_URL are not set",
);

test.describe.configure({ mode: "serial" });

const key = (rows: OrderRow[]) =>
  rows.map((r) => `${r.id}:${r.visible ? 1 : 0}`);

let before: OrderRow[] = [];

test.beforeAll(async () => {
  await deleteTempProjects();
  before = await projectOrder();
});

// Safety net: a failed run must not leave order or visibility changed. Passing
// runs restore through the UI, so the public cache is already consistent.
test.afterAll(async () => {
  await deleteTempProjects();
  let current = await projectOrder();
  if (key(current).join() !== key(before).join()) {
    for (const [order, row] of before.entries()) {
      await sql`update projects set "order" = ${order}, visible = ${row.visible} where id = ${row.id}`;
    }
    current = await projectOrder();
  }
  expect(key(current)).toEqual(key(before));
  await new Promise((resolve) => setTimeout(resolve, RATE_WINDOW_MS));
});

async function openList(page: Page) {
  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/proyectos");
  await expect(
    page.getByRole("heading", { level: 1, name: "Proyectos" }),
  ).toBeVisible();
}

// A prerendered public page serves its previous HTML to the first request
// after updateTag and the fresh one right after, so reload until it settles.
async function expectPublicHeading(page: Page, url: string, text: string) {
  await expect(async () => {
    await page.goto(url);
    await expect(page.locator("h1")).toHaveText(text, { timeout: 2000 });
  }).toPass({ timeout: 30_000 });
}

async function rowOrder(page: Page): Promise<string[]> {
  const handles = page.getByRole("button", { name: /^Mover / });
  await expect(handles.first()).toBeVisible();
  const labels = await handles.evaluateAll((nodes) =>
    nodes.map((n) => n.getAttribute("aria-label") ?? ""),
  );
  return labels.map((l) => l.replace(/^Mover /, ""));
}

test("moves a row with the keyboard only and the order persists", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await openList(page);
  const original = before.map((r) => r.titleEs);
  expect(await rowOrder(page)).toEqual(original);
  expect(original.length).toBeGreaterThan(1);

  const first = original[0];
  await page.getByRole("button", { name: `Mover ${first}` }).focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("status")).toContainText("está en la posición");
  // dnd-kit attaches its key listeners on a timeout after the lift.
  await page.waitForTimeout(300);
  await page.keyboard.press("ArrowDown");
  // dnd-kit measures on the next frame; wait for its live region.
  await expect(page.getByRole("status")).toContainText("posición 2 de");
  await page.keyboard.press("Space");
  await expect(page.getByText("Orden guardado.")).toBeVisible();

  const moved = [original[1], original[0], ...original.slice(2)];
  expect((await projectOrder()).map((r) => r.titleEs)).toEqual(moved);
  await page.reload();
  expect(await rowOrder(page)).toEqual(moved);

  // The public home lists the published projects in the admin order.
  await page.goto("/es");
  const publicTitles = await page
    .getByRole("main")
    .getByRole("link")
    .allInnerTexts();
  const expectedPublic = (await projectOrder())
    .filter((r) => r.status === "published" && r.visible)
    .map((r) => r.titleEs);
  expect(publicTitles).toEqual(expectedPublic);

  // Put it back the same way.
  await page.goto("/admin/proyectos");
  await page.getByRole("button", { name: `Mover ${first}` }).focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("status")).toContainText("está en la posición");
  // dnd-kit attaches its key listeners on a timeout after the lift.
  await page.waitForTimeout(300);
  await page.keyboard.press("ArrowUp");
  await expect(page.getByRole("status")).toContainText("posición 1 de");
  await page.keyboard.press("Space");
  await expect(page.getByText("Orden guardado.")).toBeVisible();
  expect((await projectOrder()).map((r) => r.titleEs)).toEqual(original);
});

test("Subir and Bajar move a row and the edges are disabled", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await openList(page);
  const original = before.map((r) => r.titleEs);
  const second = original[1];

  await expect(
    page.getByRole("button", { name: `Subir ${original[0]}` }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: `Bajar ${original.at(-1)}` }),
  ).toBeDisabled();

  await page.getByRole("button", { name: `Subir ${second}` }).click();
  await expect(page.getByText("Orden guardado.")).toBeVisible();
  expect((await projectOrder()).map((r) => r.titleEs)[0]).toBe(second);

  await page.getByRole("button", { name: `Bajar ${second}` }).click();
  await expect
    .poll(async () => (await projectOrder()).map((r) => r.titleEs))
    .toEqual(original);
});

test("the Visible switch hides a project from the site and back", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const target = await firstPublishedProject();
  test.skip(!target, "no published visible project to toggle");
  await openList(page);
  const publicUrl = `/es/proyectos/${target.slug}`;

  await page.goto(publicUrl);
  await expectPublicHeading(page, publicUrl, target.titleEs);

  await page.goto("/admin/proyectos");
  const visible = page.getByRole("switch", {
    name: `Visible: ${target.titleEs}`,
  });
  await visible.click();
  await expect(page.getByText("Oculto del sitio.")).toBeVisible();

  await expectPublicHeading(page, publicUrl, "Página no encontrada");

  await page.goto("/admin/proyectos");
  await page
    .getByRole("switch", { name: `Visible: ${target.titleEs}` })
    .click();
  await expect(page.getByText("Visible en el sitio.")).toBeVisible();
  await expectPublicHeading(page, publicUrl, target.titleEs);
});

test("Eliminar needs the typed title and removes the row", async ({ page }) => {
  test.setTimeout(120_000);
  const temp = await insertTempProject();
  await openList(page);

  await page
    .getByRole("button", { name: `Más acciones para ${TEMP_TITLE}` })
    .click();
  await page.getByRole("menuitem", { name: "Eliminar" }).click();

  const confirm = page.getByRole("button", {
    name: "Eliminar definitivamente",
  });
  const input = page.getByLabel(`Escribe ${TEMP_TITLE} para confirmar`);
  await expect(input).toBeFocused();
  await expect(confirm).toBeDisabled();
  await input.fill("otro nombre");
  await expect(confirm).toBeDisabled();
  await input.fill(TEMP_TITLE);
  await expect(confirm).toBeEnabled();
  await confirm.click();

  await expect(page.getByText(`${TEMP_TITLE} eliminado.`)).toBeVisible();
  await expect(
    page.getByRole("button", { name: `Mover ${TEMP_TITLE}` }),
  ).toHaveCount(0);
  const left =
    (await sql`select id from projects where id = ${temp.id}`) as unknown[];
  expect(left).toHaveLength(0);

  await expectNoBlockingViolations(page);
});

test("the list marks the active nav entry", async ({ page }) => {
  await openList(page);
  await expect(
    page
      .getByRole("navigation", { name: "Navegación del panel" })
      .getByRole("link", { name: /Proyectos/ }),
  ).toHaveAttribute("aria-current", "page");
});
