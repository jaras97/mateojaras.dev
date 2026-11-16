// Refuses to seed over tables that already hold rows unless --force is given.
export function assertSeedable({
  nonEmptyTables,
  force,
}: {
  nonEmptyTables: string[];
  force: boolean;
}): void {
  if (force || nonEmptyTables.length === 0) return;
  throw new Error(
    `La siembra se detiene: ${nonEmptyTables.join(", ")} ya tiene filas. Repite con --force para actualizar por slug.`,
  );
}
