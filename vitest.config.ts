import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(
        new URL("./src/test/server-only-stub.ts", import.meta.url),
      ),
    },
  },
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    environment: "node",
    // next-intl imports `next/navigation` without an extension; inlining it
    // lets Vite resolve it (needed once a module imports src/i18n/navigation).
    server: { deps: { inline: ["next-intl"] } },
  },
});
