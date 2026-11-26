import { expect, test } from "@playwright/test";

// D-20: the approved MJ icon is served by both root layouts.
for (const path of ["/", "/admin/login"]) {
  test(`${path} links the MJ icon`, async ({ page }) => {
    await page.goto(path);
    const hrefs = await page
      .locator('link[rel="icon"]')
      .evaluateAll((els) =>
        els.map((e) => new URL((e as HTMLLinkElement).href).pathname),
      );
    expect(hrefs.length).toBeGreaterThan(0);
    for (const h of hrefs) expect(["/icon.svg", "/favicon.ico"]).toContain(h);
    if (path === "/") {
      await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
    }
  });
}

test("icon files are served with the right signatures", async ({ request }) => {
  const svg = await request.get("/icon.svg");
  expect(svg.status()).toBe(200);
  expect(svg.headers()["content-type"]).toContain("image/svg+xml");

  const ico = await request.get("/favicon.ico");
  expect(ico.status()).toBe(200);
  expect([...(await ico.body()).subarray(0, 4)]).toEqual([0, 0, 1, 0]);

  const apple = await request.get("/apple-icon.png");
  expect(apple.status()).toBe(200);
  expect([...(await apple.body()).subarray(0, 4)]).toEqual([
    0x89, 0x50, 0x4e, 0x47,
  ]);
});
