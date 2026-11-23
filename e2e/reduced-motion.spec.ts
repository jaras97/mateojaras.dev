import { expect, test } from "@playwright/test";
import { firstPublishedProject } from "./db";

// MOTN-04 across every public route in both locales: with
// prefers-reduced-motion: reduce nothing animates after load.
test.use({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
test.skip(!process.env.DATABASE_URL, "DATABASE_URL is not set");

async function routes() {
  const project = await firstPublishedProject();
  test.skip(!project, "no published project");
  const slug = project?.slug ?? "";
  return [
    "/",
    "/es",
    `/projects/${slug}`,
    `/es/proyectos/${slug}`,
    "/about",
    "/es/sobre-mi",
    "/contact",
    "/es/contacto",
  ];
}

test("no running animation, hero visible, no GSAP request", async ({
  page,
}) => {
  const requested: string[] = [];
  page.on("request", (r) => requested.push(r.url()));
  for (const path of await routes()) {
    requested.length = 0;
    await page.goto(path, { waitUntil: "load" });
    const running = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => a.playState === "running")
        .map((a) => a.id || a.constructor.name),
    );
    expect(running, `running animations on ${path}`).toEqual([]);
    const transitions = await page.evaluate(
      () =>
        [...document.querySelectorAll<HTMLElement>("body *")].filter((el) => {
          const cs = getComputedStyle(el);
          return cs.animationName !== "none" && cs.animationDuration !== "0s";
        }).length,
    );
    expect(transitions, `animated elements on ${path}`).toBe(0);
    const gsap = requested.filter((u) =>
      /gsap|SplitText|ScrollTrigger/i.test(u),
    );
    expect(gsap, `gsap requests on ${path}`).toEqual([]);
  }
});

test("hero H1 is visible at domcontentloaded", async ({ page }) => {
  for (const path of ["/", "/es"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const opacity = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      let el: Element | null = h1;
      let min = 1;
      while (el) {
        min = Math.min(min, Number(getComputedStyle(el).opacity));
        el = el.parentElement;
      }
      return min;
    });
    expect(opacity, path).toBe(1);
  }
});

test("margin numbers are static and not sticky, accents hidden", async ({
  page,
}) => {
  const project = await firstPublishedProject();
  test.skip(!project, "no published project");
  for (const path of [
    `/projects/${project?.slug}`,
    `/es/proyectos/${project?.slug}`,
  ]) {
    await page.goto(path);
    const state = await page.evaluate(() => ({
      sticky: [
        ...document.querySelectorAll<HTMLElement>("[data-margin-number]"),
      ].filter((el) => {
        for (let n: HTMLElement | null = el; n; n = n.parentElement) {
          if (getComputedStyle(n).position === "sticky") return true;
        }
        return false;
      }).length,
      accents: [...document.querySelectorAll<HTMLElement>("[data-accent]")].map(
        (el) => Number(getComputedStyle(el).opacity),
      ),
    }));
    expect(state.sticky, path).toBe(0);
    for (const o of state.accents) expect(o, path).toBe(0);
  }
});

test("theme toggle switches without startViewTransition", async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __svt: number };
    w.__svt = 0;
    const orig = document.startViewTransition?.bind(document);
    (
      document as unknown as {
        startViewTransition: (cb?: () => void) => unknown;
      }
    ).startViewTransition = (cb) => {
      w.__svt += 1;
      return orig?.(cb);
    };
  });
  await page.goto("/");
  const before = await page.evaluate(() =>
    document.documentElement.classList.contains("dark"),
  );
  await page.getByRole("button", { name: /theme|tema/i }).click();
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.classList.contains("dark")),
    )
    .toBe(!before);
  const calls = await page.evaluate(
    () => (window as unknown as { __svt: number }).__svt,
  );
  expect(calls).toBe(0);
});
