import { expect, type Page, test } from "@playwright/test";

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const slug = "centro-estetico-manuj";

function watchCsp(page: Page) {
  const violations: string[] = [];
  page.on("console", (msg) => {
    const text = msg.text();
    if (/Content[ -]Security[ -]Policy/i.test(text)) violations.push(text);
  });
  return violations;
}

for (const path of [
  "/",
  "/es",
  `/projects/${slug}`,
  "/about",
  "/contact",
  "/es/sobre-mi",
  "/es/contacto",
  "/admin/login",
]) {
  test(`${path} carries the security headers and no CSP violation`, async ({
    page,
  }) => {
    const violations = watchCsp(page);
    const response = await page.goto(path);
    const headers = response?.headers() ?? {};
    expect(headers["content-security-policy-report-only"]).toContain(
      "default-src 'self'",
    );
    expect(headers["content-security-policy-report-only"]).not.toContain(
      "nonce",
    );
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["permissions-policy"]).toBeTruthy();
    expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
    expect(headers["strict-transport-security"]).toBe(
      "max-age=63072000; includeSubDomains",
    );
    expect(headers["x-powered-by"]).toBeUndefined();
    if (path.startsWith("/admin")) {
      expect(headers["x-robots-tag"]).toBe("noindex, nofollow");
    }
    await page.waitForLoadState("networkidle");
    expect(violations).toEqual([]);
  });
}

test.describe("signed-in admin", () => {
  test.setTimeout(60_000);
  test.skip(!email || !password, "ADMIN_EMAIL / ADMIN_PASSWORD are not set");

  test("/admin carries the headers and logs no CSP violation", async ({
    page,
  }) => {
    const violations = watchCsp(page);
    // Wait out the sign-in rate-limit window used by the auth specs.
    await page.waitForTimeout(11_000);
    await page.goto("/admin/login");
    await page.getByLabel("Correo").fill(email ?? "");
    await page.getByLabel("Contraseña").fill(password ?? "");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    const response = await page.reload();
    const headers = response?.headers() ?? {};
    expect(headers["content-security-policy-report-only"]).toContain(
      "default-src 'self'",
    );
    expect(headers["x-robots-tag"]).toBe("noindex, nofollow");
    await page.waitForLoadState("networkidle");
    expect(violations).toEqual([]);
    await page.waitForTimeout(11_000);
  });
});
