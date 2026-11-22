import { expect, test } from "@playwright/test";
import { sql } from "./db";

const HAS_LIMITER = Boolean(
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
);
const HAS_RESEND = Boolean(process.env.RESEND_API_KEY);

test.skip(!process.env.DATABASE_URL, "DATABASE_URL is not set");
test.skip(
  !(HAS_LIMITER && HAS_RESEND),
  "Live delivery needs Upstash (UPSTASH_REDIS_REST_URL or KV_REST_API_URL) and RESEND_API_KEY; both are pending (04-02 answers A and B: luego)",
);

async function fill(
  page: import("@playwright/test").Page,
  email: string,
  message: string,
) {
  await page.getByLabel("Name", { exact: true }).fill("Live e2e");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Message", { exact: true }).fill(message);
  await page.waitForTimeout(3200);
  await page.getByRole("button", { name: "Send" }).click();
}

test("a live submit stores the row and marks the email as sent", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const email = `e2e-live+${Date.now()}@example.com`;
  try {
    await page.goto("/contact");
    await fill(page, email, "Live delivery check from the e2e suite.");
    await expect(
      page.getByRole("heading", { level: 2, name: /Thanks/ }),
    ).toBeVisible();
    await expect
      .poll(
        async () => {
          const rows = (await sql`
            select email_sent_at from contact_messages where email = ${email}
          `) as { email_sent_at: string | null }[];
          return rows[0]?.email_sent_at != null;
        },
        { timeout: 15_000 },
      )
      .toBe(true);
  } finally {
    await sql`delete from contact_messages where email = ${email}`;
  }
});

test("the rate limit answers with the rate-limited alert", async ({ page }) => {
  test.skip(
    process.env.E2E_RATE_LIMIT !== "1",
    "Opt-in only: burns the visitor rate-limit window on purpose",
  );
  test.setTimeout(120_000);
  const stamp = Date.now();
  try {
    for (let i = 0; i < 3; i++) {
      await page.goto("/contact");
      await fill(
        page,
        `e2e-live+rl${i}-${stamp}@example.com`,
        "Rate limit burst.",
      );
      await expect(
        page.getByRole("heading", { level: 2, name: /Thanks/ }),
      ).toBeVisible();
    }
    await page.goto("/contact");
    await fill(page, `e2e-live+rl3-${stamp}@example.com`, "Rate limit burst.");
    await expect(page.locator("form [role=alert]")).toContainText(
      /3 messages in the last hour/,
    );
  } finally {
    await sql`delete from contact_messages where email like ${`e2e-live+rl%-${stamp}@example.com`}`;
  }
});
