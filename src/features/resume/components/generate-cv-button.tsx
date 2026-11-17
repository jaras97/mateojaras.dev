"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { generateCv } from "../actions";

export type GenerateCvLabels = {
  generate: string;
  generating: string;
  generated: string; // contains {n}
  failed: string; // contains {motivo}
  sessionExpired: string;
  tokenMissing: string;
};

export function GenerateCvButton({
  disabled,
  labels,
}: {
  disabled: boolean;
  labels: GenerateCvLabels;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const running = pending || busy;

  function run() {
    setBusy(true);
    startTransition(async () => {
      try {
        const result = await generateCv();
        if (result.ok) {
          toast.success(
            labels.generated.replace("{n}", String(result.version)),
          );
          router.refresh();
        } else if (result.error === "session") {
          toast.error(labels.sessionExpired);
        } else if (result.error === "token") {
          toast.error(labels.tokenMissing);
        } else {
          const motivo = result.fieldErrors?.motivo?.[0] ?? "error";
          toast.error(labels.failed.replace("{motivo}", motivo));
        }
      } catch {
        toast.error(labels.failed.replace("{motivo}", "sin respuesta"));
      } finally {
        setBusy(false);
      }
    });
  }

  return (
    <Button
      type="button"
      onClick={run}
      disabled={disabled || running}
      aria-busy={running}
    >
      {running ? labels.generating : labels.generate}
    </Button>
  );
}
