"use client";

import { type ReactNode, useEffect, useRef } from "react";

// Once per visit: an Activity re-show or a client navigation back to the home
// must not replay the entrance.
let played = false;

// MOTN-02: the hero H1 enters split by words. GSAP and SplitText load with a
// dynamic import() from this leaf only. Until `data-split-done` is set the CSS
// failsafe keeps the heading hidden for at most 1000 ms; under reduced motion
// (no `motion-ok` class) it is never hidden.
export function SplitHeading({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const done = () => root.setAttribute("data-split-done", "");
    if (played || !document.documentElement.classList.contains("motion-ok")) {
      done();
      return;
    }

    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    (async () => {
      await document.fonts.ready;
      const [{ gsap }, { SplitText }] = await Promise.all([
        import("gsap"),
        import("gsap/SplitText"),
      ]);
      if (cancelled) return;
      const heading = root.querySelector("h1");
      if (!heading) {
        done();
        return;
      }
      gsap.registerPlugin(SplitText);
      ctx = gsap.context(() => {
        SplitText.create(heading, {
          type: "words",
          aria: "auto",
          onSplit: (self) => {
            const count = self.words.length;
            // Total stays within 0.7 s: 0.5 s tween plus at most 0.2 s of stagger.
            const stagger = count > 1 ? Math.min(0.04, 0.2 / (count - 1)) : 0;
            return gsap.from(self.words, {
              opacity: 0,
              y: 12,
              duration: 0.5,
              stagger,
              ease: "power2.out",
              onComplete: () => self.revert(),
            });
          },
        });
        done();
        played = true;
      }, root);
    })().catch(done);

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={ref} data-split="" className={className}>
      {children}
    </div>
  );
}
