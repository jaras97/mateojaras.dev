"use client";

import { createContext, type ReactNode, useContext } from "react";

export type SiteErrorLabels = {
  title: string;
  body: string;
  retry: string;
  write: string;
};

type SiteErrorValue = { labels: SiteErrorLabels; email: string | null };

const SiteErrorContext = createContext<SiteErrorValue | null>(null);

export function SiteErrorProvider({
  labels,
  email,
  children,
}: {
  labels: SiteErrorLabels;
  email: string | null;
  children: ReactNode;
}) {
  return (
    <SiteErrorContext.Provider value={{ labels, email }}>
      {children}
    </SiteErrorContext.Provider>
  );
}

export function useSiteError(): SiteErrorValue | null {
  return useContext(SiteErrorContext);
}
