"use server";

import type { ActionResult } from "@/lib/action-result";

// RED stub: accepts everything and writes nothing.
const ok = (): ActionResult => ({
  ok: true,
  savedAt: new Date().toISOString(),
});

export async function reorderProjects(_ids: string[]): Promise<ActionResult> {
  return ok();
}
export async function setProjectVisible(
  _id: string,
  _visible: boolean,
): Promise<ActionResult> {
  return ok();
}
export async function setProjectFeatured(
  _id: string,
  _featured: boolean,
): Promise<ActionResult> {
  return ok();
}
export async function deleteProject(
  _id: string,
  _confirmName: string,
): Promise<ActionResult> {
  return ok();
}
