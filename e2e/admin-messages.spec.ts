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

const NAME = "Visitante temporal e2e";
const BODY = "Hola\n<script>alert(1)</script>";

async function unreadCount() {
  const rows = (await sql`
    select count(*)::int as n from contact_messages where read_at is null
  `) as { n: number }[];
  return rows[0].n;
}

async function readAtOfTemp() {
  const rows = (await sql`
    select read_at as "readAt" from contact_messages
    where name = ${NAME} order by created_at desc limit 1
  `) as { readAt: string | null }[];
  return rows[0]?.readAt ?? null;
}

async function tempCount() {
  const rows = (await sql`
    select count(*)::int as n from contact_messages where name = ${NAME}
  `) as { n: number }[];
  return rows[0].n;
}

// The sidebar badge (labelled "N mensajes sin leer"); absent at zero. A CSS
// locator, because the open modal hides the sidebar from the role tree.
async function badgeCount(page: Page) {
  const badge = page.locator('[role="img"][aria-label$="sin leer"]').first();
  if ((await badge.count()) === 0) return 0;
  return Number((await badge.textContent())?.trim());
}

test.beforeAll(async () => {
  await sql`delete from contact_messages where name = ${NAME}`;
});

test.afterAll(async () => {
  await sql`delete from contact_messages where name = ${NAME}`;
  await new Promise((resolve) => setTimeout(resolve, RATE_WINDOW_MS));
});

test("reads, marks, replies to and deletes a message", async ({ page }) => {
  await sql`
    insert into contact_messages (name, email, message, locale, created_at)
    values (${NAME}, 'e2e@example.com', 'Mensaje anterior', 'es', now() - interval '1 hour')
  `;
  await sql`
    insert into contact_messages (name, email, message, locale)
    values (${NAME}, 'e2e@example.com', ${BODY}, 'es')
  `;
  const baseline = (await unreadCount()) - 2;

  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/mensajes");
  await expect(
    page.getByRole("heading", { level: 1, name: "Mensajes" }),
  ).toBeVisible();
  await expect(page.getByText(`${baseline + 2} sin leer`)).toBeVisible();
  expect(await badgeCount(page)).toBe(baseline + 2);
  await expectNoBlockingViolations(page);

  // Newest first: the row with the script text is first.
  const firstRow = page.getByRole("row").nth(1);
  await expect(firstRow).toContainText(NAME);
  await expect(firstRow).toContainText("Nuevo");
  await expect(firstRow).toContainText("e2e@example.com");

  await firstRow.getByRole("button", { name: NAME }).click();
  const sheet = page.getByRole("dialog");
  await expect(sheet).toBeVisible();
  await expect(sheet).toContainText("<script>alert(1)</script>");
  expect(await sheet.locator("script").count()).toBe(0);
  const reply = sheet.getByRole("link", { name: "Responder por correo" });
  await expect(reply).toHaveAttribute("href", /^mailto:e2e%40example\.com\?/);
  await expectNoBlockingViolations(page);

  // Opening marked it read.
  await expect.poll(readAtOfTemp).not.toBeNull();
  await expect.poll(() => badgeCount(page)).toBe(baseline + 1);

  await sheet.getByRole("button", { name: "Marcar como no leído" }).click();
  await expect.poll(() => badgeCount(page)).toBe(baseline + 2);
  await expect.poll(readAtOfTemp).toBeNull();

  await sheet.getByRole("button", { name: "Eliminar", exact: true }).click();
  const confirm = page.getByRole("alertdialog", {
    name: "¿Eliminar este mensaje?",
  });
  await confirm.getByRole("button", { name: "Eliminar mensaje" }).click();
  await expect.poll(tempCount).toBe(1);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("marks a message saved without an email notice", async ({ page }) => {
  const NOT_SENT = "Visitante temporal e2e sin aviso";
  const SENT = "Visitante temporal e2e con aviso";
  await sql`delete from contact_messages where name in (${NOT_SENT}, ${SENT})`;
  try {
    await sql`
      insert into contact_messages (name, email, message, locale, email_sent_at)
      values (${NOT_SENT}, 'e2e@example.com', 'Sin aviso', 'es', null)
    `;
    await sql`
      insert into contact_messages (name, email, message, locale, email_sent_at)
      values (${SENT}, 'e2e@example.com', 'Con aviso', 'es', now())
    `;
    await signIn(page);
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto("/admin/mensajes");
    const unsent = page.getByRole("row").filter({ hasText: NOT_SENT });
    const sent = page.getByRole("row").filter({ hasText: SENT });
    await expect(unsent).toContainText("Email no enviado");
    await expect(sent).not.toContainText("Email no enviado");
    const help = "Guardado, pero el aviso por email falló";

    await unsent.getByRole("button", { name: NOT_SENT }).click();
    await expect(page.getByRole("dialog")).toContainText(help);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await sent.getByRole("button", { name: SENT }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog")).not.toContainText(help);
  } finally {
    await sql`delete from contact_messages where name in (${NOT_SENT}, ${SENT})`;
  }
});
