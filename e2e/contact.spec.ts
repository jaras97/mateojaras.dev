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
      await expectNoBlockingViolations(page);
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

test.describe("contact aside and activity", () => {
  test("copies the stored email", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/contact");
    const address = (
      await page.locator("#contact-aside-address").textContent()
    )?.trim();
    expect(address).toBeTruthy();
    await page.getByRole("button", { name: "Copy email" }).click();
    await expect(page.getByText("Copied").first()).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      address,
    );
  });

  test("shows the failed hint without clipboard access", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", { value: undefined });
    });
    await page.goto("/contact");
    await page.getByRole("button", { name: "Copy email" }).click();
    await expect(page.getByText("Could not copy.")).toBeVisible();
  });

  test("has no calendar embed or third-party script", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("iframe")).toHaveCount(0);
    await expect(page.locator('script[src*="cal.com"]')).toHaveCount(0);
  });

  test("a stale confirmation does not survive back navigation", async ({
    page,
  }) => {
    await page.goto("/contact");
    await page.getByLabel("Name", { exact: true }).fill("Bot e2e");
    await page
      .getByLabel("Email", { exact: true })
      .fill(`e2e-contact+act-${Date.now()}@example.com`);
    await page
      .getByLabel("Message", { exact: true })
      .fill("Mensaje de prueba automatizada.");
    await page
      .locator('input[name="website"]')
      .fill("http://spam.example", { force: true });
    await page.waitForTimeout(3200);
    await page.getByRole("button", { name: "Send" }).click();
    await expect(
      page.getByRole("heading", { level: 2, name: /Thanks/ }),
    ).toBeVisible();
    await page.getByRole("link", { name: "About" }).first().click();
    await page.waitForURL(/\/about/);
    await page.goBack();
    await expect(page.getByLabel("Name", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Name", { exact: true })).toHaveValue("");
    await expect(
      page.getByRole("heading", { level: 2, name: /Thanks/ }),
    ).toHaveCount(0);
  });
});
