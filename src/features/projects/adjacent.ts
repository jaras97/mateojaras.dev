// Prev/next neighbours in the admin order (D-03): the list is already ordered
// and filtered by the public query, and the ends never wrap.
export function adjacentProjects<T extends { slug: string }>(
  rows: T[],
  slug: string,
): { prev: T | null; next: T | null } {
  const index = rows.findIndex((row) => row.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return { prev: rows[index - 1] ?? null, next: rows[index + 1] ?? null };
}
