// Draft overlay helpers. Rules: docs/data-model.md "Reglas".
// A published row keeps pending edits in its `draft` jsonb column; public
// cores strip it, Draft Mode cores overlay it. Neither ever returns `draft`.

type WithDraft = { draft?: unknown };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function stripDraft<T extends WithDraft>(row: T): Omit<T, "draft"> {
  const { draft: _draft, ...rest } = row;
  return rest;
}

export function applyDraft<T extends WithDraft>(row: T): Omit<T, "draft"> {
  const { draft, ...rest } = row;
  if (!isPlainObject(draft)) return rest;
  const out: Record<string, unknown> = { ...rest };
  for (const [key, value] of Object.entries(draft)) {
    if (key in out) out[key] = value;
  }
  return out as Omit<T, "draft">;
}
