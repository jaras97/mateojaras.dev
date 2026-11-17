// A required env var is missing: say so plainly instead of failing late (D-17).
export function EnvMissingNotice({
  message,
  className = "",
}: {
  message: string;
  className?: string;
}) {
  return (
    <output
      className={`block border border-border bg-muted px-4 py-2 text-sm ${className}`}
    >
      {message}
    </output>
  );
}
