import { expect, test } from "@playwright/test";
import { RATE_WINDOW_MS, signIn } from "./admin-session";
import { sql } from "./db";

test.describe.configure({ mode: "serial" });

// Test data only: a clearly temporary company, removed in afterAll. Seeded
// content is never edited.
const COMPANY = "Empresa temporal e2e";
const ISO =
  /^([1-2][0-9]{3}-[0-1][0-9]-[0-3][0-9]|[1-2][0-9]{3}-[0-1][0-9]|[1-2][0-9]{3})$/;

type Work = { name: string; position?: string; startDate?: string };

async function fetchWork(
  request: import("@playwright/test").APIRequestContext,
  path = "/resume.json",
) {
  const res = await request.get(path);
  expect(res.status()).toBe(200);
  const body = await res.json();
  return { res, body, work: (body.work ?? []) as Work[] };
}

test("serves valid JSON Resume in both locales", async ({ request }) => {
  for (const path of ["/resume.json", "/resume.es.json"]) {
    const { res, body, work } = await fetchWork(request, path);
    expect(res.headers()["content-type"]).toContain("application/json");
    expect(body.basics.name.length).toBeGreaterThan(0);
    expect(work.length).toBeGreaterThan(0);
    for (const w of work) expect(w.startDate).toMatch(ISO);
    expect(body.basics.phone).toBeUndefined();
    expect(body.basics.location?.countryCode).toBeUndefined();
  }
});

test.describe("publishing flow", () => {
  test.skip(
    !process.env.ADMIN_EMAIL ||
      !process.env.ADMIN_PASSWORD ||
      !process.env.DATABASE_URL,
    "ADMIN_EMAIL / ADMIN_PASSWORD / DATABASE_URL are not set",
  );

  test.beforeAll(async () => {
    await sql`delete from experiences where company = ${COMPANY}`;
  });

  test.afterAll(async () => {
    await sql`delete from experiences where company = ${COMPANY}`;
    await new Promise((resolve) => setTimeout(resolve, RATE_WINDOW_MS));
  });

  test("a published experience appears, a draft save does not change it, deleting removes it", async ({
    page,
    request,
  }) => {
    test.setTimeout(180_000);
    await signIn(page);
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto("/admin/experiencia");
    await page.getByRole("link", { name: "Nueva experiencia" }).click();
    await page.getByLabel("Empresa", { exact: true }).fill(COMPANY);
    await page.getByLabel("Puesto ES").fill("Puesto de prueba");
    await page.getByLabel("Puesto EN").fill("Test role");
    await page.getByLabel("Inicio").fill("2024-01-15");
    await page.getByRole("button", { name: "Guardar borrador" }).click();
    await expect(page).toHaveURL(/\/admin\/experiencia\/[0-9a-f-]{36}$/);

    // Draft only: not public.
    expect((await fetchWork(request)).work.map((w) => w.name)).not.toContain(
      COMPANY,
    );

    await page
      .getByRole("button", { name: "Publicar", exact: true })
      .first()
      .click();
    await expect(
      page.getByText("Publicado", { exact: true }).first(),
    ).toBeVisible();

    await expect
      .poll(async () => (await fetchWork(request)).work.map((w) => w.name))
      .toContain(COMPANY);
    const published = (await fetchWork(request)).work.find(
      (w) => w.name === COMPANY,
    );
    expect(published?.position).toBe("Test role");
    expect(published?.startDate).toBe("2024-01");

    // A draft save with a changed role leaves the public JSON as it was.
    await page.locator("input[name=roleEn]:visible").fill("Changed draft role");
    await page.getByRole("button", { name: "Guardar borrador" }).click();
    await expect(page.getByText("Borrador guardado").first()).toBeVisible();
    const afterDraft = (await fetchWork(request)).work.find(
      (w) => w.name === COMPANY,
    );
    expect(afterDraft?.position).toBe("Test role");

    // Delete through the admin.
    await page.goto("/admin/experiencia");
    await page
      .getByRole("button", { name: `Más acciones para ${COMPANY}` })
      .click();
    await page.getByRole("menuitem", { name: "Eliminar" }).click();
    await page.getByLabel(`Escribe ${COMPANY} para confirmar`).fill(COMPANY);
    await page
      .getByRole("button", { name: "Eliminar definitivamente" })
      .click();
    await expect(page.getByText(`${COMPANY} eliminado.`)).toBeVisible();
    await expect
      .poll(async () => (await fetchWork(request)).work.map((w) => w.name))
      .not.toContain(COMPANY);
  });
});
