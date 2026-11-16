"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Strings keep the {nombre} placeholder.
export type DeleteConfirmLabels = {
  title: string;
  body: string;
  inputLabel: string;
  cancel: string;
  confirm: string;
};

// D-14: the destructive button stays disabled until the typed text equals the
// item name (trimmed, case-sensitive). Mount it only while it is open.
export function DeleteConfirm({
  name,
  labels,
  open,
  onOpenChange,
  onConfirm,
}: {
  name: string;
  labels: DeleteConfirmLabels;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}) {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const fill = (text: string) => text.replaceAll("{nombre}", name);

  async function confirm() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
      setTyped("");
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setTyped("");
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="break-words">
            {fill(labels.title)}
          </AlertDialogTitle>
          <AlertDialogDescription>{labels.body}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="delete-confirm-input" className="break-words">
            {fill(labels.inputLabel)}
          </Label>
          <Input
            id="delete-confirm-input"
            autoFocus
            autoComplete="off"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>{labels.cancel}</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={typed.trim() !== name || busy}
            onClick={confirm}
          >
            {labels.confirm}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
