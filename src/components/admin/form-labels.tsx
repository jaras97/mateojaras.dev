"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { AdminMessages } from "@/lib/messages";

// The Spanish admin strings the form kit needs. The server page passes the
// slices; kit components read them here instead of threading props.
export type FormMessages = Pick<
  AdminMessages,
  | "common"
  | "form"
  | "projects"
  | "richText"
  | "errors"
  | "toasts"
  | "skills"
  | "images"
>;

const Context = createContext<FormMessages | null>(null);

export function FormLabelsProvider({
  labels,
  children,
}: {
  labels: FormMessages;
  children: ReactNode;
}) {
  return <Context.Provider value={labels}>{children}</Context.Provider>;
}

export function useFormLabels(): FormMessages {
  const labels = useContext(Context);
  if (!labels) throw new Error("useFormLabels needs a FormLabelsProvider");
  return labels;
}
