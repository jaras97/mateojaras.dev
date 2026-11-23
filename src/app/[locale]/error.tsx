"use client";

import { useEffect, useRef } from "react";
import { useSiteError } from "@/components/site/site-error-provider";
import { Button } from "@/components/ui/button";

export default function LocaleError({
  error: _error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const site = useSiteError();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  if (!site) return null;
  const { labels, email } = site;
  const [before, after] = labels.write.split("{email}");
  return (
    <div className="mx-auto max-w-page px-6 py-12 md:px-12 lg:py-16">
      <h1
        ref={heading}
        tabIndex={-1}
        className="font-heading text-4xl font-semibold tracking-display text-balance outline-none"
      >
        {labels.title}
      </h1>
      <p className="mt-4">{labels.body}</p>
      <Button type="button" size="lg" className="mt-8" onClick={() => retry()}>
        {labels.retry}
      </Button>
      {email ? (
        <p className="mt-4">
          {before}
          <a href={`mailto:${email}`} className="underline underline-offset-4">
            {email}
          </a>
          {after}
        </p>
      ) : null}
    </div>
  );
}
