"use server";

import type { ActionResult } from "@/lib/action-result";

// STUB (RED): replaced by the real actions in the GREEN commit.
export async function saveSettingsDraft(_input: unknown): Promise<ActionResult> {
  return { ok: true, savedAt: "" };
}
export async function publishSettings(_input: unknown): Promise<ActionResult> {
  return { ok: true, savedAt: "" };
}
export async function discardSettingsDraft(): Promise<ActionResult> {
  return { ok: true, savedAt: "" };
}
