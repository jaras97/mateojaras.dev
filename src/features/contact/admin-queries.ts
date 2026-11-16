import "server-only";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { requireSession } from "@/lib/dal";

// Inbox rows, newest first. ipHash is never selected.
export async function listMessagesForAdmin() {
  await requireSession();
  return db
    .select({
      id: contactMessages.id,
      name: contactMessages.name,
      email: contactMessages.email,
      message: contactMessages.message,
      locale: contactMessages.locale,
      createdAt: contactMessages.createdAt,
      readAt: contactMessages.readAt,
    })
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt));
}
