import { expect, test } from "@playwright/test";
import { RATE_WINDOW_MS, signIn } from "./admin-session";
import { sql } from "./db";

test.skip(
  !process.env.ADMIN_EMAIL ||
    !process.env.ADMIN_PASSWORD ||
    !process.env.DATABASE_URL,
  "ADMIN_EMAIL / ADMIN_PASSWORD / DATABASE_URL are not set",
);

test.afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, RATE_WINDOW_MS));
});

const FIXTURE_SLUG = "e2e-draft-banner-project";

async function removeFixture() {
  await sql`delete from projects where slug = ${FIXTURE_SLUG}`;
}

test.afterEach(removeFixture);

const WIDTHS = [390, 768, 1440] as const;
const SCHEMES = ["light", "dark"] as const;
const ROUTES = [
  { name: "en-home", path: "/", band: "Preview · draft content, not public" },
  {
    name: "es-home",
    path: "/es",
    band: "Vista previa · contenido en borrador, no es público",
  },
  {
    name: "en-project",
    path: `/projects/${FIXTURE_SLUG}`,
    band: "Preview · draft content, not public",
  },
  {
    name: "es-project",
    path: `/es/proyectos/${FIXTURE_SLUG}`,
    band: "Vista previa · contenido en borrador, no es público",
  },
] as const;

test("draft banner screenshots at 390, 768 and 1440 in light and dark", async ({
  page,
}) => {
  test.setTimeout(240_000);
  await removeFixture();
  const rows = (await sql`
    insert into projects (slug, status, visible, "order", title_en, title_es,
      tagline_en, tagline_es, problem_en, problem_es, role_en, role_es,
      solution_en, solution_es)
    values (${FIXTURE_SLUG}, 'published', true, 999, 'E2E banner project',
      'Proyecto banner e2e', 'tagline', 'frase', 'problem', 'problema', 'role',
      'papel', 'solution', 'solucion')
    returning id
  `) as { id: string }[];

  await signIn(page);
  await expect(page).toHaveURL(/\/admin$/);
  // Enabling Draft Mode sets the cookie for the whole context.
  await page.goto(`/api/draft?kind=project&id=${rows[0].id}&locale=es`);
  await expect(page).toHaveURL(new RegExp(`/es/proyectos/${FIXTURE_SLUG}$`));

  for (const route of ROUTES) {
    for (const width of WIDTHS) {
      for (const scheme of SCHEMES) {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: scheme });
        await page.goto(route.path);
        const band = page.getByRole("region", {
          name: route.name.startsWith("es")
            ? "Vista previa de borradores"
            : "Draft preview",
        });
        await expect(band).toBeVisible();
        await expect(band).toContainText(route.band);
        await page.screenshot({
          path: `test-results/draft-banner/${route.name}-${width}-${scheme}.png`,
          fullPage: true,
        });
      }
    }
  }
});
