// Waits until the Vercel Preview of git HEAD is Ready. Read-only (git + vercel ls). Usage: pnpm tsx scripts/wait-preview.ts [--timeout=600]
import { execFileSync } from "node:child_process";

const timeoutArg = process.argv.find((a) => a.startsWith("--timeout="));
const timeoutS = timeoutArg
  ? Number(timeoutArg.slice("--timeout=".length))
  : 600;

function run(cmd: string, args: string[]): string {
  return execFileSync(cmd, args, { encoding: "utf8" }).trim();
}

type Deployment = { url: string; state: string; createdAt: number };

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
      // The Vercel GitHub integration does not publish GitHub deployments for
      // this repo, so the read-only Vercel CLI is the source of truth.
      const { deployments } = JSON.parse(
        run("vercel", [
          "ls",
          "--environment",
          "preview",
          "-m",
          `githubCommitSha=${sha}`,
          "--format",
          "json",
        ]),
      ) as { deployments: Deployment[] };
      const newest = [...deployments].sort(
        (a, b) => b.createdAt - a.createdAt,
      )[0];
      if (newest) {
        last = newest.state;
        if (last === "READY") {
          console.log(`READY ${sha}`);
          process.exit(0);
        }
        if (last === "ERROR" || last === "CANCELED") {
          console.log(`Preview deployment ${last} for ${sha}`);
          process.exit(1);
        }
      }
    } catch (error) {
      last = `vercel error: ${(error as Error).message.split("\n")[0]}`;
    }
    await sleep(15_000);
  }
  console.log(`Timed out after ${timeoutS}s (last state: ${last})`);
  process.exit(1);
}

main();
