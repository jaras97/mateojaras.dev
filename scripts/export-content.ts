// Exports the content tables of the database in DATABASE_URL.
// Usage: pnpm export:content   (writes content/<table>.json locally)
// Never exports auth tables or contact_messages (see src/lib/content-export.ts).
import { createDb } from "@/db/client";
import { exportContent } from "@/lib/content-export";
import { describeDbTarget } from "@/lib/db-target";
import { requireEnv } from "@/lib/env";
import { loadLocalEnv } from "./lib/env";

async function main() {
  loadLocalEnv();
  const url = requireEnv("DATABASE_URL");
  console.log(`export target: ${describeDbTarget(url)}`);
  const results = await exportContent({ db: createDb(url) });
  for (const r of results) {
    console.log(
      r.status === "written"
        ? `${r.table}: ${r.rows} rows -> ${r.target}`
        : `${r.table}: skipped (${r.reason})`,
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "export failed");
  process.exitCode = 1;
});
