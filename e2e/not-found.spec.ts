import { expect, test } from "@playwright/test";
import en from "../messages/en.json";
import es from "../messages/es.json";
import { expectNoBlockingViolations } from "./axe";

const titles = {
  en: en.Site.notFound.title,
  es: es.Site.notFound.title,
} as const;

test.describe("unmatched paths", () => {
  for (const [path, lang] of [
    ["/foo", "en"],
    ["/es/foo", "es"],
  ] as const) {
    test(`${path} answers 404 in ${lang}`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(404);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        titles[lang],
      );
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute(
        "content",
        /noindex/,
      );
      await expectNoBlockingViolations(page);
    });
  }
});
