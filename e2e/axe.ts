import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
export const AXE_BLOCKING = new Set(["serious", "critical"]);

// Fails listing id, impact and target of every serious or critical violation.
export async function expectNoBlockingViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(AXE_TAGS)
    .analyze();
  const blocking = violations
    .filter((v) => v.impact && AXE_BLOCKING.has(v.impact))
    .map((v) => ({
      id: v.id,
      impact: v.impact,
      targets: v.nodes.map((n) => n.target.join(" ")),
    }));
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
}
