import { expect, test } from "@playwright/test";

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const origin = "http://localhost:3100";

test.skip(!email || !password, "ADMIN_EMAIL / ADMIN_PASSWORD are not set");

// Production rate limit: 3 sign-ins per 10 s. Leave a fresh window for the next spec.
test.afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 11_000));
});

function sessionCookie(setCookie: string): string {
  const match = setCookie.match(
    /(?:__Secure-)?better-auth\.session_token=[^;]+/,
  );
  if (!match) throw new Error("no session cookie in Set-Cookie");
  return match[0];
}

async function signIn(request: import("@playwright/test").APIRequestContext) {
  return request.post("/api/auth/sign-in/email", {
    data: { email, password },
    headers: { origin },
  });
}

test("admin signs in and get-session returns the admin", async ({
  request,
}) => {
  const response = await signIn(request);
  expect(response.status()).toBe(200);
  const cookie = sessionCookie(response.headers()["set-cookie"] ?? "");
  const session = await request.get("/api/auth/get-session", {
    headers: { cookie },
  });
  const body = await session.json();
  expect(body.user.email).toBe(email);
});

test("sign-up is disabled", async ({ request }) => {
  const response = await request.post("/api/auth/sign-up/email", {
    data: {
      email: "intruder@example.com",
      password: "a-long-enough-password",
      name: "Intruder",
    },
    headers: { origin },
  });
  expect(response.status()).toBeGreaterThanOrEqual(400);
});

test("a cookie captured before sign-out stops working", async ({ request }) => {
  const response = await signIn(request);
  expect(response.status()).toBe(200);
  const cookie = sessionCookie(response.headers()["set-cookie"] ?? "");
  const out = await request.post("/api/auth/sign-out", {
    headers: { cookie, origin },
    data: {},
  });
  expect(out.status()).toBe(200);
  const after = await request.get("/api/auth/get-session", {
    headers: { cookie },
  });
  const body = await after.json();
  expect(body?.user ?? null).toBeNull();
});
