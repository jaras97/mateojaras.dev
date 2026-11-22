"use client";

import { type ReactNode, useEffect, useRef } from "react";

// The site's single scrubbed scene (MOTN-03): each case section's margin
// number raises its accent layer while the section crosses mid-viewport.
// Only opacity animates. gsap is imported lazily so no other route ships it,
// and triggers are reverted on unmount and on Activity hide.
export function ScrollScene({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let mm: { revert: () => void } | undefined;
    const root = ref.current;
    if (!root) return;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        const matchMedia = gsap.matchMedia(root);
        mm = matchMedia;
        matchMedia.add(
          "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
          () => {
            for (const section of root.querySelectorAll<HTMLElement>(
              "[data-scene-section]",
            )) {
              const accent =
                section.querySelector<HTMLElement>("[data-accent]");
              if (!accent) continue;
              gsap
                .timeline({
                  scrollTrigger: {
                    trigger: section,
                    start: "top 50%",
                    end: "bottom 50%",
                    scrub: true,
                  },
                })
                .fromTo(accent, { opacity: 0 }, { opacity: 1, duration: 0.15 })
                .to(accent, { opacity: 1, duration: 0.7 })
                .to(accent, { opacity: 0, duration: 0.15 });
            }
          },
        );
      },
    );

    return () => {
      cancelled = true;
      mm?.revert();
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
