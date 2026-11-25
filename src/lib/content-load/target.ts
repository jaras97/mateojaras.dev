// Pure argument parsing and target guard for scripts/load-content.ts.
import { PRODUCTION_DB_ENDPOINT_PREFIX } from "@/lib/seed-guard";

export const LOAD_ENTITIES = [
  "settings",
  "skills",
  "projects",
  "experiences",
  "education",
  "retire",
] as const;

export type LoadEntity = (typeof LOAD_ENTITIES)[number];

export type LoadArgs = {
  target: "dev" | "main";
  apply: boolean;
  allowProduction: boolean;
  only: Set<LoadEntity>;
};

export function parseLoadArgs(argv: string[]): LoadArgs {
  let target: string | undefined;
  let only: string[] | undefined;
  for (const arg of argv) {
    if (arg.startsWith("--target=")) target = arg.slice("--target=".length);
    else if (arg.startsWith("--only="))
      only = arg
        .slice("--only=".length)
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
  }
  if (target !== "dev" && target !== "main") {
    throw new Error("Falta --target=dev|main (obligatorio).");
  }
  const known = new Set<string>(LOAD_ENTITIES);
  const picked = only ?? [...LOAD_ENTITIES];
  const unknown = picked.filter((e) => !known.has(e));
  if (unknown.length > 0) {
    throw new Error(
      `--only desconocido: ${unknown.join(", ")}. Válidos: ${LOAD_ENTITIES.join(", ")}.`,
    );
  }
  return {
    target,
    apply: argv.includes("--apply"),
    allowProduction: argv.includes("--allow-production"),
    only: new Set(picked as LoadEntity[]),
  };
}

// `described` is the output of describeDbTarget (never the URL).
export function assertTargetMatches(
  target: "dev" | "main",
  described: string,
): void {
  const isMain = described.startsWith(PRODUCTION_DB_ENDPOINT_PREFIX);
  if ((target === "main") !== isMain) {
    throw new Error(`--target=${target} no coincide con ${described}`);
  }
}
