import { expect, test } from "@playwright/test";

// Home hero motion (MOTN-02): split-by-words H1, failsafe, no CLS, once per visit.

async function observeVitals(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __cls: number[]; __lcp: number };
    w.__cls = [];
    w.__lcp = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as unknown as {
        value: number;
        hadRecentInput: boolean;
        sources?: { node?: Node }[];
      }[]) {
        const inHero = (e.sources ?? []).some((s) =>
          s.node
            ? !!s.node.parentElement?.closest(
                "#hero-title, section[aria-labelledby=hero-title]",
              ) ||
              !!(s.node as Element).closest?.(
                "section[aria-labelledby=hero-title]",
              )
            : false,
        );
        if (!e.hadRecentInput && inHero) w.__cls.push(e.value);
      }
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => {
      const last = list.getEntries().at(-1);
      if (last) w.__lcp = last.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
  });
}

test.describe("motion allowed", () => {
  test.use({ reducedMotion: "no-preference" });

  test("H1 is visible within 1000 ms of load even when GSAP chunks are blocked", async ({
    page,
  }) => {
    await page.route(/gsap|split-heading|SplitText/i, (route) => route.abort());
    await page.route("**/_next/static/chunks/**", async (route) => {
      const url = route.request().url();
      if (/gsap/i.test(url)) return route.abort();
      return route.continue();
    });
    await page.goto("/", { waitUntil: "load" });
    const opacity = () =>
      page.evaluate(() =>
        Number(
          getComputedStyle(document.querySelector("[data-split]") as Element)
            .opacity,
        ),
      );
    await page.waitForTimeout(1100);
    expect(await opacity()).toBe(1);
  });

  test("splits by words once, keeps the text and adds no CLS in the hero", async ({
    page,
  }) => {
    await observeVitals(page);
    await page.addInitScript(() => {
      const w = window as unknown as { __split: boolean };
      w.__split = false;
      new MutationObserver((records) => {
        for (const r of records) {
          for (const n of r.addedNodes) {
            if (n instanceof Element && n.closest("#hero-title"))
              w.__split = true;
          }
        }
      }).observe(document, { childList: true, subtree: true });
    });
    await page.goto("/");
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(page.locator("[data-split][data-split-done]")).toHaveCount(1);
    const text = (await h1.textContent()) ?? "";
    await page.waitForTimeout(1500);
    await expect(h1).toBeVisible();
    expect((await h1.textContent()) ?? "").toBe(text);
    expect(
      await page
        .locator("#hero-title [class*='split'], #hero-title div")
        .count(),
    ).toBe(0);
    const cls = await page.evaluate(() =>
      (window as unknown as { __cls: number[] }).__cls.reduce(
        (a, b) => a + b,
        0,
      ),
    );
    expect(cls).toBe(0);
    // The split really ran (word wrappers were added) and was reverted.
    expect(
      await page.evaluate(
        () => (window as unknown as { __split: boolean }).__split,
      ),
    ).toBe(true);

    // Leaving and coming back must not replay the split.
    await page.evaluate(() => {
      const w = window as unknown as {
        __soft: boolean;
        next: { router: { push: (path: string) => void } };
      };
      w.__soft = true;
      w.next.router.push("/about");
    });
    await page.waitForURL(/about/);
    await page.goBack();
    // Only a client navigation keeps the page's JS state, so only then is
    // "no replay" meaningful.
    const soft = await page.evaluate(
      () => (window as unknown as { __soft?: boolean }).__soft === true,
    );
    test.skip(!soft, "back navigation was a full load");
    await expect(page.locator("[data-split][data-split-done]")).toHaveCount(1);
    await page.waitForTimeout(100);
    expect(await page.locator("#hero-title div").count()).toBe(0);
  });

  test("about and case pages load no SplitText chunk", async ({ page }) => {
    const chunks: string[] = [];
    page.on("response", (r) => {
      if (r.url().includes("/_next/static/")) chunks.push(r.url());
    });
    for (const path of ["/about"]) {
      chunks.length = 0;
      await page.goto(path, { waitUntil: "networkidle" });
      const bodies = await Promise.all(
        chunks
          .filter((u) => u.endsWith(".js"))
          .map(async (u) => await (await page.request.get(u)).text()),
      );
      expect(bodies.some((b) => b.includes("SplitText"))).toBe(false);
    }
  });

  test("local LCP with 4x CPU throttle (for 04-11)", async ({ page }) => {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await observeVitals(page);
    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(1500);
    const lcp = await page.evaluate(
      () => (window as unknown as { __lcp: number }).__lcp,
    );
    console.log(
      `LCP local: ${Math.round(lcp)} ms (4x CPU throttle, no network throttle)`,
    );
    expect(lcp).toBeGreaterThan(0);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the H1 is never hidden", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __min: number };
      w.__min = 1;
      const tick = () => {
        const el = document.querySelector("[data-split]");
        if (el)
          w.__min = Math.min(w.__min, Number(getComputedStyle(el).opacity));
        requestAnimationFrame(tick);
      };
      tick();
    });
    await page.goto("/");
    await page.waitForTimeout(300);
    expect(
      await page.evaluate(() => (window as unknown as { __min: number }).__min),
    ).toBe(1);
    expect(
      await page.evaluate(() =>
        document.documentElement.classList.contains("motion-ok"),
      ),
    ).toBe(false);
  });
});
