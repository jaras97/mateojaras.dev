const order = [
  "frontend",
  "state",
  "testing",
  "backend",
  "ai",
  "tools",
] as const;
type Category = (typeof order)[number];

export type StackSkill = {
  id: string;
  name: string;
  category: Category;
  yearsUsed: number | null;
};

// Skills by category with years when stored. No levels, bars or percentages.
export function StackList({
  skills,
  categoryLabels,
  years,
}: {
  skills: StackSkill[];
  categoryLabels: Record<Category, string>;
  years: (n: number) => string;
}) {
  const groups = order
    .map((category) => ({
      category,
      rows: skills.filter((s) => s.category === category),
    }))
    .filter((g) => g.rows.length > 0);
  if (groups.length === 0) return null;
  return (
    <dl className="space-y-6">
      {groups.map(({ category, rows }) => (
        <div
          key={category}
          className="border-t border-border pt-4 first:border-t-0 first:pt-0 sm:grid sm:grid-cols-[8rem_1fr] sm:gap-x-6"
        >
          <dt className="font-mono text-sm text-muted-foreground">
            {categoryLabels[category]}
          </dt>
          <dd>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {rows.map((s) => (
                <li key={s.id}>
                  <span className="font-semibold">{s.name}</span>
                  {s.yearsUsed != null ? (
                    <span className="ms-2 font-mono text-sm text-muted-foreground">
                      {years(s.yearsUsed)}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      ))}
    </dl>
  );
}
