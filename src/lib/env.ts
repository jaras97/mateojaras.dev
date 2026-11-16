export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Falta ${name}: añádela a .env.local (ver .env.example)`);
  }
  return value;
}
