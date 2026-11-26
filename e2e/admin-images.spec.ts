import type { Page } from "@playwright/test";
import { del } from "@vercel/blob";
import { RATE_WINDOW_MS, signIn } from "./admin-session";
import { expectNoBlockingViolations } from "./axe";
import { expect, test } from "./csp";
import { deleteTempProjects, insertTempProject, sql } from "./db";

test.skip(
  !process.env.ADMIN_EMAIL ||
    !process.env.ADMIN_PASSWORD ||
    !process.env.DATABASE_URL,
  "ADMIN_EMAIL / ADMIN_PASSWORD / DATABASE_URL are not set",
);

const hasToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());

test.afterAll(async () => {
  if (hasToken) {
    const rows = (await sql`
      select media from projects where slug like 'e2e-temp-%'
    `) as { media: { url: string }[] | null }[];
    const urls = rows.flatMap((row) => row.media?.map((m) => m.url) ?? []);
    if (urls.length > 0) await del(urls);
  }
  await deleteTempProjects();
  await new Promise((resolve) => setTimeout(resolve, RATE_WINDOW_MS));
});

async function png(page: Page, width: number, height: number, name: string) {
  const base64 = await page.evaluate(
    ([w, h]) => {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#c2410c";
        ctx.fillRect(0, 0, w, h);
      }
      return canvas.toDataURL("image/png").split(",")[1];
    },
    [width, height],
  );
  return { name, mimeType: "image/png", buffer: Buffer.from(base64, "base64") };
}

test("without BLOB_READ_WRITE_TOKEN the section shows the notice", async ({
  page,
}) => {
  test.skip(hasToken, "the token exists; the upload flow test covers this");
  test.setTimeout(90_000);
  const { id } = await insertTempProject();
  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto(`/admin/proyectos/${id}`);
  await expect(
    page.getByText(
      "La subida de archivos no está disponible: falta BLOB_READ_WRITE_TOKEN en este entorno.",
    ),
  ).toBeVisible();
  await expect(page.getByLabel("Título ES")).toBeVisible();
  await expectNoBlockingViolations(page);
});

test("uploads a screenshot with alt en/es, cover and order", async ({
  page,
}) => {
  test.skip(
    !hasToken,
    "BLOB_READ_WRITE_TOKEN is not set: real uploads need it",
  );
  test.setTimeout(180_000);
  const { id } = await insertTempProject();
  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto(`/admin/proyectos/${id}`);

  // The file input is server-rendered: wait for hydration or the change event is lost.
  await page.waitForLoadState("networkidle");
  const input = page.locator('input[type="file"]');
  await input.setInputFiles(await png(page, 1600, 1000, "uno.png"));
  await expect(page.getByText("Portada", { exact: true })).toBeVisible({
    timeout: 60_000,
  });

  await page.getByRole("button", { name: "Publicar" }).click();
  await expect(
    page.getByText(
      "Falta el texto alternativo en español. Sin él no se puede publicar.",
    ),
  ).toBeVisible();

  await page.getByLabel("Texto alternativo 1 ES").fill("Pantalla uno");
  await page.getByLabel("Texto alternativo 1 EN").fill("Screen one");

  await input.setInputFiles(await png(page, 1000, 1000, "dos.png"));
  await expect(page.getByText(/no es 16:10/)).toBeVisible({ timeout: 60_000 });
  await page.getByRole("button", { name: "Usar como portada" }).click();
  await page.getByRole("button", { name: "Quitar" }).nth(1).click();
  await expect(page.getByText("Portada", { exact: true })).toBeVisible();
  await expectNoBlockingViolations(page);

  await page.getByRole("button", { name: "Guardar borrador" }).click();
  await expect(page.getByText(/^Guardado/)).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Texto alternativo 1 ES")).toHaveValue(
    "Pantalla uno",
  );
});
