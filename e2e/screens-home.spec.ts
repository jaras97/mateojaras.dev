import { test } from "@playwright/test";
import { captureMatrix } from "./screens";

// Home capture matrix (390/768/1440, light and dark, en and es).
// Output: test-results/screens/home/. captureMatrix asserts no horizontal scroll.
test("home screenshots", async ({ page }) => {
  test.setTimeout(180_000);
  await captureMatrix(page, { name: "home", paths: ["/", "/es"] });
});
