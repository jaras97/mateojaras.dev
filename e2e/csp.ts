import { test as base, expect, type Page } from "@playwright/test";

declare global {
  interface Window {
    __csp?: string[];
  }
}

// Collects CSP violations two ways: console messages and the
// securitypolicyviolation event (covers reports the console may not print).
export async function collectCsp(page: Page) {
  const fromConsole: string[] = [];
  page.on("console", (msg) => {
    const text = msg.text();
    if (/Content[ -]Security[ -]Policy/i.test(text)) fromConsole.push(text);
  });
  await page.addInitScript(() => {
    window.__csp = [];
    document.addEventListener("securitypolicyviolation", (e) => {
      window.__csp?.push(
        `${e.violatedDirective} ${e.blockedURI} ${e.sourceFile}:${e.lineNumber}:${e.columnNumber} ${e.sample}`,
      );
    });
  });
  return async (): Promise<string[]> => {
    const fromEvents = await page
      .evaluate(() => window.__csp ?? [])
      .catch(() => [] as string[]);
    return [...fromConsole, ...fromEvents];
  };
}

export function expectNoCspViolations(list: string[]) {
  expect(list, JSON.stringify(list, null, 2)).toEqual([]);
}

// Drop-in replacement for Playwright's `test`: any CSP violation fails the spec.
export const test = base.extend({
  page: async ({ page }, use) => {
    const read = await collectCsp(page);
    await use(page);
    expectNoCspViolations(await read());
  },
});

export { expect };
