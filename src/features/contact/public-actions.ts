"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { requireEnv } from "@/lib/env";
import { hashIp } from "@/lib/ip-hash";
import { getContactLimiter } from "@/lib/rate-limit";
import { notifyByEmail } from "./notify";
import { type ContactResult, submitContactCore } from "./submit-core";

// Public: no session. contact_messages is private, so no updateTag and no
// exportContent. Root params are not available here: locale is an argument.
export async function submitContact(
  locale: unknown,
  input: unknown,
): Promise<ContactResult> {
  const forwarded = (await headers()).get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  let key: string;
  try {
    key = requireEnv("BETTER_AUTH_SECRET");
  } catch (error) {
    console.error(error instanceof Error ? error.message : "missing env");
    return { ok: false, error: "unavailable" };
  }
  return submitContactCore(locale, input, {
    limiter: getContactLimiter(),
    ipHash: hashIp(ip, key),
    insert: async (row) => {
      const [created] = await db
        .insert(contactMessages)
        .values(row)
        .returning({ id: contactMessages.id });
      return created;
    },
    schedule: (id, msg) => after(() => notifyByEmail(id, msg)),
    log: (msg, err) =>
      err === undefined ? console.error(msg) : console.error(msg, err),
  });
}
