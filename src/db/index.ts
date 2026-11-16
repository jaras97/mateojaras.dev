import "server-only";
import { createDb } from "@/db/client";
import { requireEnv } from "@/lib/env";

export const db = createDb(requireEnv("DATABASE_URL"));
