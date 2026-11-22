// Two-digit section numbers in order of appearance, over the sections that
// actually render: an empty first section makes the next one "01".
export function numberSections<K extends string>(
  keys: readonly K[],
): Record<K, string> {
  const out = {} as Record<K, string>;
  keys.forEach((key, i) => {
    out[key] = String(i + 1).padStart(2, "0");
  });
  return out;
}
