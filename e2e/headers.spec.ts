import { collectCsp, expect, expectNoCspViolations, test } from "./csp";
import { firstPublishedProject } from "./db";

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
async function paths() {
  const project = await firstPublishedProject();
  test.skip(!project, "no published project");
  const slug = project?.slug ?? "";
  return [
    "/",
    "/es",
    `/projects/${slug}`,
    `/es/proyectos/${slug}`,
    "/about",
    "/contact",
    "/es/sobre-mi",
    "/es/contacto",
    "/foo",
    "/es/foo",
    "/admin/login",
  ];
}

test("every route carries the enforced security headers and no CSP violation", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const read = await collectCsp(page);
  for (const path of await paths()) {
    const response = await page.goto(path);
    const headers = response?.headers() ?? {};
    const policy = headers["content-security-policy"];
    expect(policy, path).toContain("default-src 'self'");
    expect(policy, path).toContain(
      "connect-src 'self' https://vercel.com/api/blob/",
    );
    expect(policy, path).not.toContain("nonce");
    expect(
      headers["content-security-policy-report-only"],
      path,
    ).toBeUndefined();
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
  }
  expectNoCspViolations(await read());
});

test.describe("signed-in admin", () => {
  test.setTimeout(60_000);
  test.skip(!email || !password, "ADMIN_EMAIL / ADMIN_PASSWORD are not set");

  test("/admin carries the headers and logs no CSP violation", async ({
    page,
  }) => {
    const read = await collectCsp(page);
    // Wait out the sign-in rate-limit window used by the auth specs.
    await page.waitForTimeout(11_000);
    await page.goto("/admin/login");
    await page.getByLabel("Correo").fill(email ?? "");
    await page.getByLabel("Contraseña").fill(password ?? "");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    const response = await page.reload();
    const headers = response?.headers() ?? {};
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["content-security-policy-report-only"]).toBeUndefined();
    expect(headers["x-robots-tag"]).toBe("noindex, nofollow");
    await page.waitForLoadState("networkidle");
    expectNoCspViolations(await read());
    await page.waitForTimeout(11_000);
  });
});
