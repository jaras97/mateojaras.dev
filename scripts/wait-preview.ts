// Waits until the Vercel Preview of git HEAD is Ready. Read-only. Usage: pnpm tsx scripts/wait-preview.ts [--timeout=600]
import { execFileSync } from "node:child_process";

const timeoutArg = process.argv.find((a) => a.startsWith("--timeout="));
const timeoutS = timeoutArg
  ? Number(timeoutArg.slice("--timeout=".length))
  : 600;

function run(cmd: string, args: string[]): string {
  return execFileSync(cmd, args, { encoding: "utf8" }).trim();
}

type Deployment = {
  id: number;
  environment: string;
  created_at: string;
  statuses_url: string;
};
type Status = { state: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const sha = run("git", ["rev-parse", "HEAD"]);
  let upstream = "";
  try {
    upstream = run("git", ["rev-parse", "@{u}"]);
  } catch {
    // no upstream
  }
  if (sha !== upstream) {
    console.log("HEAD is not pushed");
    process.exit(1);
  }
  const deadline = Date.now() + timeoutS * 1000;
  let last = "no deployment yet";
  while (Date.now() < deadline) {
    try {
      const deployments = JSON.parse(
        run("gh", [
          "api",
          `repos/{owner}/{repo}/deployments?sha=${sha}&per_page=20`,
        ]),
      ) as Deployment[];
      const preview = deployments
        .filter((d) => /preview/i.test(d.environment))
        .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
      if (preview) {
        const statuses = JSON.parse(
          run("gh", ["api", `${preview.statuses_url}?per_page=1`]),
        ) as Status[];
        last = statuses[0]?.state ?? "pending";
        if (last === "success") {
          console.log(`READY ${sha}`);
          process.exit(0);
        }
        if (last === "failure" || last === "error") {
          console.log(`Preview deployment ${last} for ${sha}`);
          process.exit(1);
        }
      }
    } catch (error) {
      last = `gh error: ${(error as Error).message.split("\n")[0]}`;
    }
    await sleep(15_000);
  }
  console.log(`Timed out after ${timeoutS}s (last state: ${last})`);
  process.exit(1);
}

main();
