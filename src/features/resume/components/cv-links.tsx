"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export type CvLink = { path: string; available: boolean };

export function CvLinks({
  links,
  labels,
}: {
  links: CvLink[];
  labels: {
    open: string;
    copy: string;
    copied: string;
    notGenerated: string;
  };
}) {
  async function copy(path: string) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      toast.success(labels.copied);
    } catch {
      toast.error(path);
    }
  }

  return (
    <ul className="divide-y divide-border border-y border-border">
      {links.map((link) => (
        <li
          key={link.path}
          className="flex flex-wrap items-center justify-between gap-3 py-3"
        >
          <span className="font-mono text-sm">{link.path}</span>
          <span className="flex items-center gap-3">
            {link.available ? (
              <a
                href={link.path}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold underline underline-offset-4"
              >
                {labels.open}
              </a>
            ) : (
              <span className="text-sm text-muted-foreground">
                {labels.notGenerated}
              </span>
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={() => copy(link.path)}
            >
              {labels.copy}
            </Button>
          </span>
        </li>
      ))}
    </ul>
  );
}
