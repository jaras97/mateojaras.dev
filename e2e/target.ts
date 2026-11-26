// Production is read-only for e2e. The only allowed production write is contact-live (D-22), which deletes its own row.
const PRODUCTION_HOSTS = new Set([
  "mateojaras.dev",
  "www.mateojaras.dev",
  "mateojaras-dev.vercel.app",
]);

export function isProductionTarget(): boolean {
  const raw = process.env.E2E_BASE_URL;
  if (!raw) return false;
  try {
    return PRODUCTION_HOSTS.has(new URL(raw).host);
  } catch {
    return false;
  }
}
