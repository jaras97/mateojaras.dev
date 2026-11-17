"use server";

import type { ActionResult } from "@/lib/action-result";

// STUB (RED): replaced by the real actions in the GREEN commit.
const stub = async (): Promise<ActionResult> => ({ ok: true, savedAt: "" });
export async function createEducation(_input: unknown) {
  return stub();
}
export async function saveEducationDraft(_id: string, _input: unknown) {
  return stub();
}
export async function publishEducation(_id: string, _input: unknown) {
  return stub();
}
export async function discardEducationDraft(_id: string) {
  return stub();
}
export async function reorderEducation(_ids: string[]) {
  return stub();
}
export async function setEducationVisible(_id: string, _visible: boolean) {
  return stub();
}
export async function deleteEducation(_id: string, _name: string) {
  return stub();
}
