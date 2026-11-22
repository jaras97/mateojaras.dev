// Up to three key figures (D-04). dt comes before dd in the DOM so the label
// reads first for assistive tech; flex-col-reverse shows the value above.
// No box, no shadow, no animation.
export function CaseMetrics({
  metrics,
  label,
}: {
  metrics: { label: string; value: string }[];
  label: string;
}) {
  const shown = metrics.slice(0, 3);
  if (shown.length === 0) return null;
  const columns =
    shown.length === 1
      ? "md:grid-cols-1"
      : shown.length === 2
        ? "md:grid-cols-2"
        : "md:grid-cols-3";
  return (
    <dl aria-label={label} className={`grid grid-cols-1 ${columns}`}>
      {shown.map((metric, i) => (
        <div
          key={`${metric.label}-${metric.value}`}
          className={`flex flex-col-reverse gap-2 border-t border-border py-4 md:border-t-0 md:px-6 ${
            i === 0
              ? "border-t-0 md:ps-0 md:border-l-0"
              : "md:border-l md:border-border"
          }`}
        >
          <dt className="font-mono text-sm text-muted-foreground">
            {metric.label}
          </dt>
          <dd className="font-heading text-xl font-semibold tabular-nums">
            {metric.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
