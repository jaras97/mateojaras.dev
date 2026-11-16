// Describes a database URL without credentials, safe to log.
export function describeDbTarget(url: string): string {
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    throw new Error("Cadena de conexión inválida");
  }
  const endpoint = host.split(".")[0].replace(/-pooler$/, "");
  return `${endpoint} (${host})`;
}
