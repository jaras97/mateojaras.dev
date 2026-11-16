// Static loading state for an entity form: header block, three section blocks
// and a 192px editor box. No animation.
export function FormSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-1 flex-col">
      <div className="h-16 border-b border-border bg-muted" />
      <div className="flex flex-col gap-12 px-6 py-8 lg:px-12">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="flex max-w-4xl flex-col gap-4 border-t border-border pt-4"
          >
            <div className="h-3 w-8 bg-muted" />
            <div className="h-3.5 w-24 bg-muted" />
            <div className="h-10 bg-muted" />
          </div>
        ))}
        <div className="h-48 max-w-4xl border border-border" />
      </div>
    </div>
  );
}
