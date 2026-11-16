"use client";

import { useEffect, useEffectEvent } from "react";
import { useNavigationBlocker } from "./navigation-blocker";

// Wires one form into the shell: navigation blocker, beforeunload and
// Cmd/Ctrl+S. Listeners live in effects so Activity-preserved routes release
// them. Browser back/forward is not intercepted (no App Router API for it).
export function UnsavedGuard({
  isDirty,
  busy,
  onSave,
  onLeave,
}: {
  isDirty: boolean;
  busy: boolean;
  onSave: () => void;
  onLeave: () => void;
}) {
  const { setBlocked, setOnLeave } = useNavigationBlocker();
  const save = useEffectEvent(onSave);
  const leave = useEffectEvent(onLeave);

  useEffect(() => {
    setBlocked(isDirty);
    return () => setBlocked(false);
  }, [isDirty, setBlocked]);

  useEffect(() => {
    setOnLeave(() => leave());
    return () => setOnLeave(null);
  }, [setOnLeave]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key.toLowerCase() !== "s") return;
      event.preventDefault();
      if (!busy) save();
    };
    document.addEventListener("keydown", handler, { capture: true });
    return () =>
      document.removeEventListener("keydown", handler, { capture: true });
  }, [busy]);

  return null;
}
