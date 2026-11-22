import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, type Page } from "@playwright/test";

type Scheme = "light" | "dark";

// Screenshot matrix for the public views: widths x schemes, full page, with a
// no-horizontal-scroll assertion per capture. Output: test-results/screens/<name>/.
export async function captureMatrix(
  page: Page,
  {
    name,
    paths,
    widths = [390, 768, 1440],
    schemes = ["light", "dark"],
  }: {
    name: string;
    paths: string[];
    widths?: number[];
    schemes?: Scheme[];
  },
) {
  const dir = join("test-results", "screens", name);
  mkdirSync(dir, { recursive: true });
  for (const path of paths) {
    const slug = path.replace(/^\/+|\/+$/g, "").replace(/\//g, "-") || "home";
    for (const width of widths) {
      for (const colorScheme of schemes) {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme });
        await page.goto(path);
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({
          path: join(dir, `${slug}-${width}-${colorScheme}.png`),
          fullPage: true,
        });
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        expect(overflow, `${path} ${width} ${colorScheme}`).toBeLessThanOrEqual(
          0,
        );
      }
    }
  }
}
