import { expect, test } from "@playwright/test";

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const origin = "http://localhost:3100";
const hasToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());

const uploadBody = (pathname: string) => ({
  type: "blob.generate-client-token",
  payload: { pathname, clientPayload: null, multipart: false },
});

test("the upload endpoint refuses a request without a session", async ({
  request,
}) => {
  const response = await request.post("/api/blob/upload", {
    data: uploadBody("projects/x/y.png"),
    headers: { origin },
  });
  expect(response.status()).toBe(401);
});

test("the upload endpoint refuses a bad pathname with a session", async ({
  request,
}) => {
  test.skip(!email || !password, "ADMIN_EMAIL / ADMIN_PASSWORD are not set");
  await new Promise((resolve) => setTimeout(resolve, 11_000));
  const signed = await request.post("/api/auth/sign-in/email", {
    data: { email, password },
    headers: { origin },
  });
  const cookie = (signed.headers()["set-cookie"] ?? "").match(
    /(?:__Secure-)?better-auth\.session_token=[^;]+/,
  )?.[0];
  expect(cookie).toBeTruthy();
  const response = await request.post("/api/blob/upload", {
    data: uploadBody("../../x.png"),
    headers: { origin, cookie: cookie ?? "" },
  });
  expect(response.status()).toBe(hasToken ? 400 : 503);
});

test("the CSP allows the Blob host for images", async ({ request }) => {
  const response = await request.get("/");
  const csp = response.headers()["content-security-policy"];
  expect(csp).toContain("public.blob.vercel-storage.com");
});

test("CV and resume URLs are not redirected to a locale path", async ({
  request,
}) => {
  for (const path of ["/cv/en.pdf", "/resume.json"]) {
    const response = await request.get(path, { maxRedirects: 0 });
    // 200 once 03-11/03-12 land; a 404 until then. Never a 3xx to a locale.
    expect([200, 404]).toContain(response.status());
  }
});
