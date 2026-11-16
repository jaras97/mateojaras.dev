"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useNavigationBlocker } from "./navigation-blocker";

type Props = Omit<ComponentProps<typeof Link>, "href" | "onNavigate"> & {
  href: string;
};

// next/link whose client navigation waits for the unsaved-changes dialog.
export function AdminLink({ href, ...props }: Props) {
  const { blocked, requestNavigation } = useNavigationBlocker();
  return (
    <Link
      href={href}
      onNavigate={(event) => {
        if (blocked) {
          event.preventDefault();
          requestNavigation(href);
        }
      }}
      {...props}
    />
  );
}
