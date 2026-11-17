export function skillsQuery(
  _handle: unknown,
  _opts: { includeDrafts: boolean },
): { toSQL(): { sql: string; params: unknown[] } } {
  return { toSQL: () => ({ sql: "", params: [] }) };
}
export async function getSkillsCore(_opts: {
  includeDrafts: boolean;
}): Promise<Record<string, unknown>[]> {
  return [{ draft: null }];
}
