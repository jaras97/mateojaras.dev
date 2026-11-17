import { expect, test } from "@playwright/test";
import { del } from "@vercel/blob";
import { signIn } from "./admin-session";
import { sql } from "./db";

test.skip(
  !process.env.ADMIN_EMAIL ||
    !process.env.ADMIN_PASSWORD ||
    !process.env.DATABASE_URL,
  "ADMIN_EMAIL / ADMIN_PASSWORD / DATABASE_URL are not set",
);

test.describe.configure({ mode: "serial" });

const hasToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
const remote = Boolean(process.env.E2E_BASE_URL);
const NO_TOKEN = "BLOB_READ_WRITE_TOKEN no está definido en este entorno";

let versionBefore = 0;

async function maxVersion() {
  const rows = (await sql`
    select coalesce(max(version), 0)::int as v from resume_versions
  `) as { v: number }[];
  return rows[0].v;
}

test.beforeAll(async () => {
  versionBefore = await maxVersion();
});

// Generated rows are test data: remove them (and their files) afterwards.
test.afterAll(async () => {
  const rows = (await sql`
    select pdf_url as url from resume_versions where version > ${versionBefore}
  `) as { url: string }[];
  await sql`delete from resume_versions where version > ${versionBefore}`;
  if (hasToken && rows.length > 0) {
    await del(rows.map((r) => r.url)).catch(() => undefined);
  }
  expect(await maxVersion()).toBe(versionBefore);
});

test("without BLOB_READ_WRITE_TOKEN, Generar CV is disabled and explained", async ({
  page,
}) => {
  test.skip(hasToken || remote, "Needs an environment without the Blob token");
  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/cv");
  await expect(page.getByRole("button", { name: "Generar CV" })).toBeDisabled();
  await expect(page.getByText("falta BLOB_READ_WRITE_TOKEN")).toBeVisible();
});

test("/cv/en.pdf and /cv/es.pdf answer 404 when no version exists", async ({
  request,
}) => {
  test.skip(versionBefore > 0, "A CV version already exists in this database");
  for (const lang of ["en", "es"]) {
    const response = await request.get(`/cv/${lang}.pdf`);
    expect(response.status()).toBe(404);
  }
});

test("Generar CV stores both locales and /cv/{lang}.pdf serves them", async ({
  page,
  request,
}) => {
  test.skip(!hasToken, NO_TOKEN);
  test.setTimeout(120_000);
  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/cv");
  await page.getByRole("button", { name: "Generar CV" }).click();
  await expect(page.getByText(/CV generado: v\d+/)).toBeVisible({
    timeout: 90_000,
  });

  for (const lang of ["en", "es"]) {
    const response = await request.get(`/cv/${lang}.pdf`);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/pdf");
    expect(response.headers()["content-disposition"]).toContain(
      `mateo-jaramillo-cv-${lang}.pdf`,
    );
    const body = await response.body();
    expect(body.subarray(0, 5).toString()).toBe("%PDF-");
    const length = response.headers()["content-length"];
    if (length) expect(Number(length)).toBe(body.length);
  }
});
