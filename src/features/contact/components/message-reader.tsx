"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { replyMailto } from "@/lib/mailto";
import { deleteMessage, markMessageRead, markMessageUnread } from "../actions";

export type MessageRow = {
  id: string;
  name: string;
  email: string;
  message: string;
  locale: "en" | "es";
  createdAt: string; // ISO
  readAt: string | null; // ISO
};

// Strings keep the {nombre} placeholder.
export type MessageReaderLabels = {
  reader: string;
  reply: string;
  replyPrefix: string;
  markRead: string;
  markUnread: string;
  delete: string;
  close: string;
  messageRead: string;
  messageUnread: string;
  messageDeleted: string;
  updateFailed: string;
  deleteConfirm: {
    title: string;
    body: string;
    cancel: string;
    confirm: string;
  };
};

const dateTime = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Bogota",
});

export function MessageReader({
  message,
  labels,
  onClose,
}: {
  message: MessageRow | null;
  labels: MessageReaderLabels;
  onClose: () => void;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggleRead(row: MessageRow) {
    setBusy(true);
    const unread = row.readAt === null;
    const result = unread
      ? await markMessageRead(row.id)
      : await markMessageUnread(row.id);
    setBusy(false);
    if (result.ok) {
      toast.success(unread ? labels.messageRead : labels.messageUnread);
      router.refresh();
    } else {
      toast.error(labels.updateFailed);
    }
  }

  async function remove(row: MessageRow) {
    setBusy(true);
    const result = await deleteMessage(row.id);
    setBusy(false);
    setConfirming(false);
    if (result.ok) {
      toast.success(labels.messageDeleted);
      onClose();
      router.refresh();
    } else {
      toast.error(labels.updateFailed);
    }
  }

  return (
    <>
      <Sheet
        open={message !== null}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full data-[side=right]:w-full data-[side=right]:sm:max-w-[480px] md:data-[side=right]:w-[480px]"
        >
          {message ? (
            <>
              <SheetHeader className="gap-1 p-6 pb-0">
                <SheetTitle className="break-words text-lg font-semibold">
                  {labels.reader.replace("{nombre}", message.name)}
                </SheetTitle>
                <SheetDescription className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs">
                  <span className="break-all">{message.email}</span>
                  <span>{dateTime.format(new Date(message.createdAt))}</span>
                  <span>{message.locale.toUpperCase()}</span>
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-6">
                <p className="max-w-[68ch] whitespace-pre-wrap break-words text-sm leading-relaxed">
                  {message.message}
                </p>
              </div>
              <SheetFooter className="gap-2 p-6">
                <a
                  className={buttonVariants({ variant: "default" })}
                  href={replyMailto({
                    email: message.email,
                    message: message.message,
                    prefix: labels.replyPrefix,
                  })}
                >
                  {labels.reply}
                </a>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => toggleRead(message)}
                >
                  {message.readAt === null
                    ? labels.markRead
                    : labels.markUnread}
                </Button>
                <Button
                  variant="outline"
                  disabled={busy}
                  className="text-destructive"
                  onClick={() => setConfirming(true)}
                >
                  {labels.delete}
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  {labels.close}
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{labels.deleteConfirm.title}</AlertDialogTitle>
            <AlertDialogDescription className="break-words">
              {labels.deleteConfirm.body.replace(
                "{nombre}",
                message?.name ?? "",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{labels.deleteConfirm.cancel}</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={busy}
              onClick={() => message && remove(message)}
            >
              {labels.deleteConfirm.confirm}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
