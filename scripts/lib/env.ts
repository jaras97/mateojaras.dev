// Loads .env.local without overriding variables already present in process.env.
import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";

export function loadLocalEnv(path = ".env.local"): void {
  if (!existsSync(path)) return;
  const parsed = parseEnv(readFileSync(path, "utf8"));
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
