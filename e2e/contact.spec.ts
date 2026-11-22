import { expect, test } from "@playwright/test";
import { expectNoBlockingViolations } from "./axe";
import { sql } from "./db";

test.skip(!process.env.DATABASE_URL, "DATABASE_URL is not set");

const HAS_LIMITER = Boolean(
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
);

const CASES = [
  {
    path: "/contact",
    locale: "en",
    send: "Send",
    name: "Name",
    email: "Email",
    message: "Message",
    errors: ["Write your name.", "Enter a valid email", "Tell me a bit more"],
    confirmation: "Thanks, I’ll get back to you soon.",
    unavailable: "I couldn’t send your message right now.",
  },
  {
    path: "/es/contacto",
    locale: "es",
    send: "Enviar",
    name: "Nombre",
    email: "Email",
    message: "Mensaje",
    errors: [
      "Escribe tu nombre.",
      "Escribe un email válido",
      "Cuéntame un poco más",
    ],
    confirmation: "Gracias, te respondo pronto.",
    unavailable: "No pude enviar tu mensaje ahora.",
  },
] as const;

async function rowsFor(email: string) {
  const rows = (await sql`
    select locale from contact_messages where email = ${email}
  `) as { locale: string }[];
  return rows;
}

for (const c of CASES) {
  test.describe(`contact form (${c.locale})`, () => {
    test("shows localized errors with aria wiring", async ({ page }) => {
      await page.goto(c.path);
      await page.getByRole("button", { name: c.send }).click();
      for (const text of c.errors) {
        await expect(page.getByText(text, { exact: false })).toBeVisible();
      }
      await expect(page.getByLabel(c.name, { exact: true })).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      // The form is the subject; the site chrome has its own coverage (see deferred-items).
      await expectNoBlockingViolations(page, ["header", "footer"]);
    });

    test("discards a honeypot submission without a row", async ({ page }) => {
      const email = `e2e-contact+hp-${c.locale}-${Date.now()}@example.com`;
      await page.goto(c.path);
      await page.getByLabel(c.name, { exact: true }).fill("Bot e2e");
      await page.getByLabel(c.email, { exact: true }).fill(email);
      await page
        .getByLabel(c.message, { exact: true })
        .fill("Mensaje de prueba automatizada.");
      await page
        .locator('input[name="website"]')
        .fill("http://spam.example", { force: true });
      await page.waitForTimeout(3200);
      await page.getByRole("button", { name: c.send }).click();
      await expect(
        page.getByRole("heading", { level: 2, name: c.confirmation }),
      ).toBeVisible();
      expect(await rowsFor(email)).toHaveLength(0);
    });

    test("sends for real or fails closed without Upstash", async ({ page }) => {
      const email = `e2e-contact+${c.locale}-${Date.now()}@example.com`;
      try {
        await page.goto(c.path);
        await page.getByLabel(c.name, { exact: true }).fill("Visitante e2e");
        await page.getByLabel(c.email, { exact: true }).fill(email);
        await page
          .getByLabel(c.message, { exact: true })
          .fill("Mensaje de prueba automatizada.");
        await page.waitForTimeout(3200);
        await page.getByRole("button", { name: c.send }).click();
        if (HAS_LIMITER) {
          await expect(
            page.getByRole("heading", { level: 2, name: c.confirmation }),
          ).toBeVisible();
          const rows = await rowsFor(email);
          expect(rows).toHaveLength(1);
          expect(rows[0].locale).toBe(c.locale);
        } else {
          const alert = page.locator("form [role=alert]");
          await expect(alert).toContainText(c.unavailable);
          await expect(alert.getByRole("link")).toHaveAttribute(
            "href",
            /^mailto:/,
          );
          expect(await rowsFor(email)).toHaveLength(0);
        }
      } finally {
        await sql`delete from contact_messages where email = ${email}`;
      }
    });
  });
}
