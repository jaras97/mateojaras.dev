import { expect, test } from "@playwright/test";
import { signIn } from "./admin-session";
import { expectNoBlockingViolations } from "./axe";
import { countProjects } from "./db";

test.skip(
  !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD,
  "ADMIN_EMAIL / ADMIN_PASSWORD are not set",
);

const ENTRIES = [
  "Ajustes",
  "Proyectos",
  "Experiencia",
  "Skills",
  "Educación",
  "CV",
  "Mensajes",
];

test("the shell lists seven numbered entries and a live checklist", async ({
  page,
}) => {
  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);

  const nav = page.getByRole("navigation", { name: "Navegación del panel" });
  for (const [index, name] of ENTRIES.entries()) {
    const link = nav.getByRole("link", {
      name: new RegExp(`0${index + 1}\\s*${name}`),
    });
    await expect(link).toBeVisible();
  }

  const total = await countProjects();
  const row = page
    .getByRole("main")
    .getByRole("listitem")
    .filter({ hasText: "Proyectos" });
  await expect(row.first()).toContainText(
    total === 1 ? "1 proyecto" : `${total} proyectos`,
  );

  await expectNoBlockingViolations(page);
});

test("below 1024px the Menú button opens the same entries", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole("button", { name: "Menú" }).click();
  const nav = page
    .getByRole("dialog")
    .getByRole("navigation", { name: "Navegación del panel" });
  for (const name of ENTRIES) {
    await expect(
      nav.getByRole("link", { name: new RegExp(name) }),
    ).toBeVisible();
  }
});
