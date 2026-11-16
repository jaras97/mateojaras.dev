// neon-http client factory. Unguarded (no server-only) so scripts can import it.
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

export function createDb(url: string) {
  return drizzle({ client: neon(url), schema });
}

export type Db = ReturnType<typeof createDb>;
