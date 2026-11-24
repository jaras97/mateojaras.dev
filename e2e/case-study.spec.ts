import { expect, test } from "@playwright/test";
import { expectNoBlockingViolations } from "./axe";
import { firstPublishedProject, sql } from "./db";

test.skip(!process.env.DATABASE_URL, "DATABASE_URL is not set");

const LATE_PREFIX = "e2e-late-";

test.afterAll(async () => {
  await sql`delete from projects where slug like ${`${LATE_PREFIX}%`}`;
});

for (const [contact, lang] of [
  ["/contact", "en"],
  ["/es/contacto", "es"],
] as const) {
  test(`case study reads end to end in ${lang}`, async ({ page }) => {
    const project = await firstPublishedProject();
    test.skip(!project, "no published project");
    const rows = (await sql`
      select title_en as "titleEn", title_es as "titleEs"
      from projects where slug = ${project.slug}
    `) as { titleEn: string; titleEs: string }[];
    const title = lang === "en" ? rows[0].titleEn : rows[0].titleEs;
    const path =
      lang === "en"
        ? `/projects/${project.slug}`
        : `/es/proyectos/${project.slug}`;

    await page.goto(path);
    await expect(page.locator("h1")).toHaveText(title);
    await expect(page.locator("main a[href$='#work']")).toBeVisible();
    // Every rendered section heading is reachable by role.
    for (const section of await page.locator("article section").all()) {
      await expect(section.getByRole("heading", { level: 2 })).toBeVisible();
    }
    const cta = page.locator(`article a[href="${contact}"]`).last();
    await expect(cta).toBeVisible();

    // Prev/next only point at published projects.
    const published = (
      (await sql`select slug from projects where status = 'published' and visible = true`) as {
        slug: string;
      }[]
    ).map((r) => r.slug);
    const hrefs = await page
      .locator(
        "nav[aria-label] a[href*='/proyectos/'], nav[aria-label] a[href*='/projects/']",
      )
      .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
    for (const href of hrefs) {
      expect(published).toContain(href.split("/").pop());
    }
    await expectNoBlockingViolations(page);
  });
}

test("the case page ships no editor code", async ({ page }) => {
  const project = await firstPublishedProject();
  test.skip(!project, "no published project");
  const scripts = new Set<string>();
  page.on("response", (res) => {
    if (res.request().resourceType() === "script") scripts.add(res.url());
  });
  await page.goto(`/projects/${project.slug}`);
  await page.waitForLoadState("networkidle");
  expect(scripts.size).toBeGreaterThan(0);
  for (const url of scripts) {
    const body = (await (await page.request.get(url)).text()).toLowerCase();
    expect(body, url).not.toContain("prosemirror");
    expect(body, url).not.toContain("@tiptap");
  }
});

test("a project published after the build opens without redeploy", async ({
  page,
}) => {
  const slug = `${LATE_PREFIX}${Date.now()}`;
  await sql`
    insert into projects (slug, status, visible, "order", title_en, title_es,
      tagline_en, tagline_es, problem_en, problem_es, role_en, role_es,
      solution_en, solution_es)
    values (${slug}, 'published', true, 998, 'Late e2e', 'Late e2e', 'tagline',
      'frase', 'problem', 'problema', 'role', 'papel', 'solution', 'solucion')
  `;
  try {
    const res = await page.goto(`/projects/${slug}`);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveText("Late e2e");
  } finally {
    await sql`delete from projects where slug = ${slug}`;
  }
});

test("an unknown slug shows the not-found page", async ({ page }) => {
  // The slug resolves inside Suspense, so the 404 UI streams after a 200.
  await page.goto("/projects/does-not-exist-e2e");
  await expect(page.getByText("Page not found")).toBeVisible();
  await expect(page.locator("article")).toHaveCount(0);
});

// A complete fixture row: no live URL, two decisions and margin notes.
async function withFixture(run: (slug: string) => Promise<void>) {
  const slug = `${LATE_PREFIX}notes-${Date.now()}`;
  const tech = JSON.stringify({
    decisions: [
      { title: "Decision one", body: "Reason one." },
      { title: "Decision two", body: "Reason two." },
    ],
    tradeoffs: "Test trade-off",
    validation: "Test check",
    aiTools: ["Tool A", "Tool B"],
  });
  await sql`
    insert into projects (slug, status, visible, "order", title_en, title_es,
      tagline_en, tagline_es, problem_en, problem_es, role_en, role_es,
      solution_en, solution_es, tech_decisions_en, live_url)
    values (${slug}, 'published', true, 997, 'Notes e2e', 'Notes e2e',
      'tagline', 'frase', 'problem', 'problema', 'role', 'papel', 'solution',
      'solucion', ${tech}::jsonb, null)
  `;
  try {
    await run(slug);
  } finally {
    await sql`delete from projects where slug = ${slug}`;
  }
}

test("margin notes sit under the decisions on mobile and beside them on desktop", async ({
  page,
}) => {
  await withFixture(async (slug) => {
    for (const [width, beside] of [
      [390, false],
      [1440, true],
    ] as const) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/projects/${slug}`);
      const aside = page.locator('[id$="-decisions"] aside');
      await expect(aside).toBeVisible();
      await expect(aside).toContainText("Test trade-off");
      await expect(aside).toContainText("Tool A · Tool B");
      const list = page.locator('[id$="-decisions"] h3').first();
      const a = await aside.boundingBox();
      const l = await list.boundingBox();
      if (!a || !l)
        throw new Error(
          `no layout box at ${width}: aside=${JSON.stringify(a)} h3=${JSON.stringify(l)}`,
        );
      if (beside) expect(a.x).toBeGreaterThan(l.x + l.width - 1);
      else expect(a.y).toBeGreaterThan(l.y);
    }
  });
});

test("a project without liveUrl carries the internal-tool label and demo link", async ({
  page,
}) => {
  await withFixture(async (slug) => {
    await page.goto(`/projects/${slug}`);
    await expect(page.getByText("Internal tool, sample data")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Ask for a demo" }),
    ).toHaveAttribute("href", "/contact");
  });
});

const FIXTURE_HOST = "https://e2e-fixture.public.blob.vercel-storage.com/e2e";

// A published project with one cover item and one non-cover image, so the
// CaseGallery branch (hasGallery = true) renders.
async function withGalleryFixture(run: (slug: string) => Promise<void>) {
  const slug = `${LATE_PREFIX}gallery-${Date.now()}`;
  const cover = `${FIXTURE_HOST}/cover.png`;
  const media = JSON.stringify([
    {
      url: cover,
      altEn: "Cover en",
      altEs: "Portada es",
      type: "image",
    },
    {
      url: `${FIXTURE_HOST}/gallery-1.png`,
      altEn: "Gallery en",
      altEs: "Galeria es",
      type: "image",
    },
  ]);
  await sql`
    insert into projects (slug, status, visible, "order", title_en, title_es,
      tagline_en, tagline_es, problem_en, problem_es, role_en, role_es,
      solution_en, solution_es, cover_image, media)
    values (${slug}, 'published', true, 996, 'Gallery e2e', 'Galeria e2e',
      'tagline', 'frase', 'problem', 'problema', 'role', 'papel', 'solution',
      'solucion', ${cover}, ${media}::jsonb)
  `;
  try {
    await run(slug);
  } finally {
    await sql`delete from projects where slug = ${slug}`;
  }
}

for (const [prefix, lang, title, alt, errorTitle] of [
  ["/projects/", "en", "Gallery e2e", "Gallery en", "Something went wrong"],
  ["/es/proyectos/", "es", "Galeria e2e", "Galeria es", "Algo salió mal"],
] as const) {
  test(`a case study with gallery media renders its figures in ${lang}`, async ({
    page,
  }) => {
    const problems: string[] = [];
    page.on("pageerror", (err) => problems.push(err.message));
    page.on("console", (msg) => {
      if (msg.text().includes("FORMATTING_ERROR")) problems.push(msg.text());
    });
    await withGalleryFixture(async (slug) => {
      await page.goto(prefix + slug);
      await expect(page.locator("h1")).toHaveText(title);
      const figure = page
        .locator("figure")
        .filter({ has: page.locator("figcaption", { hasText: "01 / 01" }) });
      await expect(figure).toBeVisible();
      await expect(figure.locator("img")).toHaveAttribute("alt", alt);
      await expect(page.getByText(errorTitle)).toBeHidden();
    });
    expect(problems.filter((p) => p.includes("FORMATTING_ERROR"))).toEqual([]);
  });
}
