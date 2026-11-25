// Field-level diff for the content loader. Pure.

export type FieldChange = {
  entity: string;
  key: string;
  field: string;
  before: unknown;
  after: unknown;
};

export function diffFields(
  entity: string,
  key: string,
  current: Record<string, unknown>,
  next: Record<string, unknown>,
  fields: readonly string[],
): FieldChange[] {
  const out: FieldChange[] = [];
  for (const field of fields) {
    const before = current[field];
    const after = next[field];
    if (JSON.stringify(before ?? null) !== JSON.stringify(after ?? null)) {
      out.push({ entity, key, field, before, after });
    }
  }
  return out;
}

const LIMIT = 80;

function show(value: unknown): string {
  const raw = typeof value === "string" ? value : JSON.stringify(value ?? null);
  const text = raw.length > LIMIT ? `${raw.slice(0, LIMIT)}…` : raw;
  return `"${text}"`;
}

export function formatChange(change: FieldChange): string {
  return `~ ${change.entity}[${change.key}].${change.field}: ${show(change.before)} -> ${show(change.after)}`;
}
