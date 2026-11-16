"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type NavigationBlockerLabels = {
  title: string;
  body: string;
  stay: string;
  leave: string;
};

type BlockerContext = {
  blocked: boolean;
  setBlocked: (blocked: boolean) => void;
  // The form registers what "leave without saving" must undo (its reset).
  setOnLeave: (fn: (() => void) | null) => void;
  requestNavigation: (href: string) => void;
};

const Context = createContext<BlockerContext | null>(null);

export function NavigationBlockerProvider({
  labels,
  children,
}: {
  labels: NavigationBlockerLabels;
  children: ReactNode;
}) {
  const router = useRouter();
  const [blocked, setBlocked] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const onLeave = useRef<(() => void) | null>(null);

  const value = useMemo<BlockerContext>(
    () => ({
      blocked,
      setBlocked,
      setOnLeave: (fn) => {
        onLeave.current = fn;
      },
      requestNavigation: (href) => setPending(href),
    }),
    [blocked],
  );

  function leave() {
    const href = pending;
    setPending(null);
    onLeave.current?.();
    setBlocked(false);
    if (href) router.push(href);
  }

  return (
    <Context.Provider value={value}>
      {children}
      <Dialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{labels.title}</DialogTitle>
            <DialogDescription>{labels.body}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={leave}>
              {labels.leave}
            </Button>
            <Button autoFocus onClick={() => setPending(null)}>
              {labels.stay}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Context.Provider>
  );
}

export function useNavigationBlocker(): BlockerContext {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useNavigationBlocker needs a NavigationBlockerProvider");
  }
  return context;
}
