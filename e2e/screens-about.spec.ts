import { test } from "@playwright/test";
import { captureMatrix } from "./screens";

test.skip(!process.env.DATABASE_URL, "DATABASE_URL is not set");

// About capture matrix (390/768/1440, light and dark, en and es).
// Output: test-results/screens/about/.
test("about screenshots", async ({ page }) => {
  test.setTimeout(180_000);
  await captureMatrix(page, {
    name: "about",
    paths: ["/about", "/es/sobre-mi"],
  });
});
