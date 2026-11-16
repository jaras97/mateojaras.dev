import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// Specs see ADMIN_EMAIL / ADMIN_PASSWORD from .env.local when it exists.
if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const PORT = 3100;

export default defineConfig({
  testDir: "e2e",
  // The login rate limit counts per IP, so specs run one at a time.
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: `http://localhost:${PORT}`,
    reducedMotion: "reduce",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm build && pnpm start -p ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
