"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export type CopyEmailLabels = { copy: string; copied: string; failed: string };

type Status = "idle" | "copied" | "failed";

// CONT-05: copies the stored address. Labels come from the caller.
export function CopyEmail({
  email,
  labels,
  idPrefix,
}: {
  email: string;
  labels: CopyEmailLabels;
  idPrefix: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const addressRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (status !== "copied") return;
    const timer = setTimeout(() => setStatus("idle"), 2000);
    return () => clearTimeout(timer);
  }, [status]);

  async function copy() {
    try {
      if (!navigator.clipboard) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(email);
      setStatus("copied");
    } catch {
      setStatus("failed");
      if (addressRef.current) {
        window.getSelection()?.selectAllChildren(addressRef.current);
      }
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex flex-wrap items-center gap-4">
        <a
          ref={addressRef}
          id={`${idPrefix}-address`}
          href={`mailto:${email}`}
          className="font-mono text-base underline decoration-border underline-offset-4"
        >
          {email}
        </a>
        <Button type="button" variant="outline" size="sm" onClick={copy}>
          <span className="inline-grid">
            <span
              className={`col-start-1 row-start-1 ${status === "copied" ? "invisible" : ""}`}
            >
              {labels.copy}
            </span>
            <span
              aria-hidden="true"
              className={`col-start-1 row-start-1 ${status === "copied" ? "" : "invisible"}`}
            >
              {labels.copied}
            </span>
          </span>
        </Button>
      </div>
      <span aria-live="polite" className="sr-only">
        {status === "copied" ? labels.copied : ""}
      </span>
      {status === "failed" ? (
        <p className="font-sans text-sm text-muted-foreground">
          {labels.failed}
        </p>
      ) : null}
    </div>
  );
}
