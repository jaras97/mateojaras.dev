import { test } from "@playwright/test";
import { captureMatrix } from "./screens";

// 404 capture matrix (390/768/1440, light and dark, en and es).
// Output: test-results/screens/not-found/.
test("not-found screenshots", async ({ page }) => {
  test.setTimeout(180_000);
  await captureMatrix(page, { name: "not-found", paths: ["/foo", "/es/foo"] });
});
