// Refuses to seed over tables that already hold rows unless --force is given.
export function assertSeedable({
  nonEmptyTables,
  force,
}: {
  nonEmptyTables: string[];
  force: boolean;
}): void {
  if (force || nonEmptyTables.length === 0) return;
  throw new Error(
    `La siembra se detiene: ${nonEmptyTables.join(", ")} ya tiene filas. Repite con --force para insertar solo lo que falta.`,
  );
}

// Neon main endpoint (docs/decisions.md 2026-11-16). A host name, not a secret.
export const PRODUCTION_DB_ENDPOINT_PREFIX = "ep-billowing-union";

// Refuses to write to production unless --allow-production was passed.
export function assertNotProduction({
  target,
  vercelEnv,
  allow,
}: {
  target: string;
  vercelEnv: string | undefined;
  allow: boolean;
}): void {
  const isProduction =
    target.startsWith(PRODUCTION_DB_ENDPOINT_PREFIX) ||
    vercelEnv === "production";
  if (!isProduction || allow) return;
  throw new Error(
    `La siembra se detiene: ${target} es producción (Neon main). Repite con --allow-production si de verdad quieres escribir ahí.`,
  );
}
