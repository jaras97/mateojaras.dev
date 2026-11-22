import { expect, test } from "@playwright/test";
import { expectNoBlockingViolations } from "./axe";
import { sql } from "./db";

test.skip(!process.env.DATABASE_URL, "DATABASE_URL is not set");

for (const [path, lang] of [
  ["/about", "en"],
  ["/es/sobre-mi", "es"],
] as const) {
  test(`about page reads in order in ${lang}`, async ({ page }) => {
    const settings = (await sql`
      select now_en as "nowEn", now_es as "nowEs" from site_settings limit 1
    `) as { nowEn: unknown; nowEs: unknown }[];
    const nowDoc = JSON.stringify(
      lang === "en" ? settings[0]?.nowEn : settings[0]?.nowEs,
    );
    const hasNow = /"text":"[^"]*\S/.test(nowDoc ?? "");

    await page.goto(path);
    await expect(page.locator("h1")).toHaveCount(1);

    // Section headings come in order with sequential two-digit numbers.
    const sections = page.locator("main section[id^='about-']");
    const count = await sections.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const section = sections.nth(i);
      await expect(section.getByRole("heading", { level: 2 })).toBeVisible();
      await expect(section.locator("span.font-mono").first()).toHaveText(
        String(i + 1).padStart(2, "0"),
      );
    }
    expect(await page.locator("#about-now").count()).toBe(hasNow ? 1 : 0);
    if (hasNow) {
      await expect(page.locator("#about-now")).toContainText(
        lang === "en" ? /Updated \d{1,2} \w+ \d{4}/ : /Actualizado/,
      );
    }
    // Years only, never proficiency bars.
    await expect(page.getByRole("progressbar")).toHaveCount(0);
    // The header language link fails label-content-name-mismatch
    // (deferred-items.md, pending a copy decision).
    await expectNoBlockingViolations(page, ["a[hreflang]"]);
  });
}
