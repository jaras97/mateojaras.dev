"use server";
type R =
  | { ok: false; error: "server"; fieldErrors?: Record<string, string[]> }
  | { ok: true; id: string };
const nope = async (..._a: unknown[]): Promise<R> => ({
  ok: false,
  error: "server",
});
export const createSkill = nope;
export const saveSkillDraft = nope;
export const publishSkill = nope;
export const discardSkillDraft = nope;
export const reorderSkills = nope;
export const setSkillVisible = nope;
export const setSkillFeatured = nope;
export const deleteSkill = nope;
