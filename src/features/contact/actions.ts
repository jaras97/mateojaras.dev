"use server";

import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import type { ActionResult } from "@/lib/action-result";
import { requireActionSession } from "@/lib/dal";

// Inbox mutations. contact_messages is private: no public tag to update and
// the table is excluded from exportContent, so neither runs here.

const idSchema = z.uuid();

const ok = (): ActionResult => ({
  ok: true,
  savedAt: new Date().toISOString(),
});

async function run(
  id: string,
  write: (id: string) => Promise<unknown>,
): Promise<ActionResult> {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "validation" };
  try {
    await write(parsed.data);
  } catch (error) {
    console.error("contact action failed", error);
    return { ok: false, error: "server" };
  }
  return ok();
}

export async function markMessageRead(id: string): Promise<ActionResult> {
  if (!(await requireActionSession())) return { ok: false, error: "session" };
  return run(id, (uuid) =>
    db
      .update(contactMessages)
      .set({ readAt: new Date() })
      .where(and(eq(contactMessages.id, uuid), isNull(contactMessages.readAt))),
  );
}

export async function markMessageUnread(id: string): Promise<ActionResult> {
  if (!(await requireActionSession())) return { ok: false, error: "session" };
  return run(id, (uuid) =>
    db
      .update(contactMessages)
      .set({ readAt: null })
      .where(eq(contactMessages.id, uuid)),
  );
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  if (!(await requireActionSession())) return { ok: false, error: "session" };
  return run(id, (uuid) =>
    db.delete(contactMessages).where(eq(contactMessages.id, uuid)),
  );
}
