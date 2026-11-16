"use client";

import { ExternalLink } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AdminLink } from "./admin-link";
import { useFormLabels } from "./form-labels";
import { StatusBadge } from "./status-badge";

export type HeaderBusy = "save" | "publish" | null;

type Props = {
  title: string;
  breadcrumb: { href: string; label: string };
  status: "draft" | "published";
  hasPendingDraft: boolean;
  isDirty: boolean;
  savedAt: string | null;
  busy: HeaderBusy;
  // undefined: the entity has no public route (no button). null: not saved yet.
  previewHref?: string | null;
  onSave: () => void;
  onPublish: () => void;
};

function Actions({
  status,
  busy,
  previewHref,
  onSave,
  onPublish,
  shortcut,
  className,
}: Pick<Props, "status" | "busy" | "previewHref" | "onSave" | "onPublish"> & {
  shortcut: string;
  className: string;
}): ReactNode {
  const { common } = useFormLabels();
  return (
    <div className={className}>
      {previewHref === undefined ? null : previewHref === null ? (
        <Tooltip>
          <TooltipTrigger render={<span className="inline-flex" />}>
            <Button type="button" variant="outline" disabled>
              <ExternalLink aria-hidden="true" />
              {common.preview}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{common.previewDisabled}</TooltipContent>
        </Tooltip>
      ) : (
        <a
          href={previewHref}
          target="_blank"
          rel="noopener"
          className="inline-flex h-10 items-center gap-2 rounded-[var(--radius)] border border-border bg-background px-4 text-sm font-semibold hover:bg-muted"
        >
          <ExternalLink aria-hidden="true" className="size-4" />
          {common.preview}
        </a>
      )}
      <Button
        type="button"
        variant="outline"
        disabled={busy !== null}
        aria-busy={busy === "save" || undefined}
        onClick={onSave}
      >
        {common.saveDraft}
        <Kbd className="hidden md:inline-flex">{shortcut}</Kbd>
      </Button>
      <Button
        type="button"
        disabled={busy !== null}
        aria-busy={busy === "publish" || undefined}
        onClick={onPublish}
      >
        {status === "published" ? common.publishChanges : common.publish}
      </Button>
    </div>
  );
}

// Sticky 64px header with status, the dirty indicator and the three actions.
// Below 768px the actions move to a sticky bottom bar in the same order.
export function AdminPageHeader(props: Props) {
  const { common } = useFormLabels();
  const [shortcut, setShortcut] = useState(common.kbdOther);
  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) setShortcut(common.kbdMac);
  }, [common.kbdMac]);

  // Unsaved edits never reach the preview: disable it while the form is dirty.
  const previewHref =
    props.previewHref !== undefined && props.isDirty ? null : props.previewHref;

  const indicator = props.isDirty
    ? common.dirty
    : props.savedAt
      ? common.saved.replace("{hora}", props.savedAt)
      : "";

  return (
    <>
      <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-4 border-b border-border bg-background px-6 lg:px-12">
        <div className="flex min-w-0 flex-col justify-center gap-0.5 py-2">
          <AdminLink
            href={props.breadcrumb.href}
            className="font-mono text-xs text-muted-foreground hover:text-foreground"
          >
            {props.breadcrumb.label}
          </AdminLink>
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="font-heading truncate text-[25px] leading-tight font-semibold tracking-display">
              {props.title}
            </h1>
            <StatusBadge
              status={props.status}
              hasPendingDraft={props.hasPendingDraft}
              labels={{
                draft: common.status.draft,
                published: common.status.published,
                pending: common.status.pending,
                hidden: common.status.hidden,
              }}
            />
            <span
              aria-live="polite"
              className="font-mono text-xs text-muted-foreground"
            >
              {indicator}
            </span>
          </div>
        </div>
        <Actions
          {...props}
          previewHref={previewHref}
          shortcut={shortcut}
          className="hidden items-center gap-3 md:flex"
        />
      </header>
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background p-3 md:hidden">
        <Actions
          {...props}
          previewHref={previewHref}
          shortcut={shortcut}
          className="grid grid-cols-3 gap-2 [&>*]:w-full [&_button]:w-full [&_a]:w-full [&_a]:justify-center"
        />
      </div>
    </>
  );
}
