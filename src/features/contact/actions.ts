"use server";
import type { ActionResult } from "@/lib/action-result";
export async function markMessageRead(_id: string): Promise<ActionResult> {
  return { ok: true, savedAt: "" };
}
export async function markMessageUnread(_id: string): Promise<ActionResult> {
  return { ok: true, savedAt: "" };
}
export async function deleteMessage(_id: string): Promise<ActionResult> {
  return { ok: true, savedAt: "" };
}
