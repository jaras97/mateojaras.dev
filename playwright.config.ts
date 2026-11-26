import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig, devices } from "@playwright/test";

// Specs see ADMIN_EMAIL / ADMIN_PASSWORD from .env.local when it exists.
if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const PORT = 3100;
// E2E_BASE_URL points the specs at a deployed Preview: no local build or server.
const remote = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: "e2e",
  // The login rate limit counts per IP, so specs run one at a time.
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: remote ?? `http://localhost:${PORT}`,
    reducedMotion: "reduce",
    // A protected Preview needs the automation bypass; local runs are unchanged.
    ...(remote && process.env.VERCEL_AUTOMATION_BYPASS_SECRET
      ? {
          extraHTTPHeaders: {
            "x-vercel-protection-bypass":
              process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
            "x-vercel-set-bypass-cookie": "true",
            "x-vercel-skip-toolbar": "1",
          },
        }
      : {}),
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: remote
    ? undefined
    : {
        command: `pnpm build && pnpm start -p ${PORT}`,
        url: `http://localhost:${PORT}/`,
        reuseExistingServer: !process.env.CI,
        timeout: 300_000,
        // e2e saves write their backup here, never into the repo.
        env: { CONTENT_EXPORT_DIR: join(tmpdir(), "mateojaras-e2e-content") },
      },
});
