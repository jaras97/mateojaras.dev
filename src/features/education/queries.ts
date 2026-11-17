// STUB (RED): replaced by the real queries in the GREEN commit.
import type { Db } from "@/db/client";
import { education } from "@/db/schema";

export function educationQuery(handle: Db, _opts: { includeDrafts: boolean }) {
  return handle.select().from(education);
}

export async function getEducationCore(_opts: { includeDrafts: boolean }) {
  return [] as Record<string, unknown>[];
}
