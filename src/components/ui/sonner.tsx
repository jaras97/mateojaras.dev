"use client";

import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      theme="light"
      position="bottom-right"
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "!bg-background !text-foreground !border-border !rounded-[var(--radius)] !shadow-none",
          description: "!text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
