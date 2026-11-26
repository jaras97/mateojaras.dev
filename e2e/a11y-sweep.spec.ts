import { test } from "@playwright/test";
import { expectNoBlockingViolations } from "./axe";
import { firstPublishedProject } from "./db";

// QUAL-03: axe on every public route in both languages and the 404, light and
// dark, at 390 and 1440 px. No exclusions.
test.skip(!process.env.DATABASE_URL, "DATABASE_URL is not set");

const viewports = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
];

for (const colorScheme of ["light", "dark"] as const) {
  for (const viewport of viewports) {
    test.describe(`${colorScheme} ${viewport.width}px`, () => {
      test.use({ colorScheme, viewport });

      test("axe finds nothing serious or critical", async ({ page }) => {
        const project = await firstPublishedProject();
        const slug = project?.slug;
        const paths = [
          "/",
          "/about",
          "/contact",
          "/es",
          "/es/sobre-mi",
          "/es/contacto",
          "/foo",
          "/es/foo",
          ...(slug ? [`/projects/${slug}`, `/es/proyectos/${slug}`] : []),
        ];
        for (const path of paths) {
          await page.goto(path);
          await page.locator("h1").first().waitFor();
          try {
            await expectNoBlockingViolations(page);
          } catch (e) {
            throw new Error(`${path}: ${(e as Error).message}`);
          }
        }
      });
    });
  }
}
