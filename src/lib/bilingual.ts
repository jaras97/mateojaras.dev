// A text value counts as missing when it is null, undefined or blank.
export function isEmptyText(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  return false;
}

// How many of the named fields of one row are empty.
export function countMissingEs(
  row: Record<string, unknown>,
  fields: string[],
): number {
  return fields.filter((field) => isEmptyText(row[field])).length;
}
