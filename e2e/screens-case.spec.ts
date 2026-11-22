import { test } from "@playwright/test";
import { firstPublishedProject, sql } from "./db";
import { captureMatrix } from "./screens";

test.skip(!process.env.DATABASE_URL, "DATABASE_URL is not set");

// Case-study capture matrix (390/768/1440, light and dark, en and es).
// Output: test-results/screens/case/. captureMatrix asserts no horizontal scroll.
test("case study screenshots", async ({ page }) => {
  test.setTimeout(180_000);
  const first = await firstPublishedProject();
  test.skip(!first, "no published project");
  const noLive = (await sql`
    select slug from projects
    where status = 'published' and visible = true and live_url is null and slug <> ${first.slug}
    limit 1
  `) as { slug: string }[];
  const slugs = [first.slug, ...noLive.map((r) => r.slug)];
  for (const slug of slugs) {
    await captureMatrix(page, {
      name: "case",
      paths: [`/projects/${slug}`, `/es/proyectos/${slug}`],
    });
  }
});
