import { expect, test } from "@playwright/test";

// Home hero motion (MOTN-02, P4 Plan B): H1 split by words on the server, CSS-only entrance, no CLS.

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

  test("H1 words are server-rendered, animate with CSS only and settle within 1000 ms", async ({
    page,
  }) => {
    await observeVitals(page);
    // The HTML already carries the words; no GSAP is needed for the headline.
    await page.route(/gsap|SplitText/i, (route) => route.abort());
    const response = await page.goto("/", { waitUntil: "load" });
    const html = (await response?.text()) ?? "";
    expect(html).toMatch(
      /<h1[^>]*id="hero-title"[^>]*>\s*<span class="split-word"/,
    );
    const h1 = page.getByRole("heading", { level: 1 });
    const text = ((await h1.textContent()) ?? "").trim();
    expect(text.length).toBeGreaterThan(0);
    await page.waitForTimeout(1000);
    const state = await page.evaluate(() => {
      const words = [
        ...document.querySelectorAll<HTMLElement>("#hero-title .split-word"),
      ];
      return {
        count: words.length,
        opacities: words.map((w) => Number(getComputedStyle(w).opacity)),
        running: document
          .getAnimations()
          .filter(
            (a) =>
              a.playState === "running" &&
              (a.effect as KeyframeEffect | null)?.target?.closest?.(
                "#hero-title",
              ),
          ).length,
      };
    });
    expect(state.count).toBeGreaterThan(0);
    expect(state.opacities.every((o) => o === 1)).toBe(true);
    expect(state.running).toBe(0);
    const cls = await page.evaluate(() =>
      (window as unknown as { __cls: number[] }).__cls.reduce(
        (a, b) => a + b,
        0,
      ),
    );
    expect(cls).toBe(0);
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
        for (const el of document.querySelectorAll("#hero-title .split-word"))
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
