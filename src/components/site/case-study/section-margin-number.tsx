// Two-layer margin number (lg and up): the base number is the accessible one;
// the accent copy is decorative and only ScrollScene raises its opacity.
// Sticky applies only when motion is allowed, so reduced motion keeps it static.
export function SectionMarginNumber({ number }: { number: string }) {
  return (
    // -mt-13 pulls the number up to the h2 line (h2 line-height 1.75rem + mt-6).
    <div className="hidden lg:col-span-2 lg:-mt-13 lg:block">
      <div
        data-margin-number
        className="relative self-start font-heading text-[25px] font-semibold leading-none tabular-nums motion-safe:lg:sticky motion-safe:lg:top-8"
      >
        <span className="text-muted-foreground">{number}</span>
        <span
          aria-hidden="true"
          data-accent
          className="absolute inset-0 text-signal opacity-0"
        >
          {number}
        </span>
      </div>
    </div>
  );
}
