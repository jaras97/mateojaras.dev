"use client";

import { Moon, Sun } from "lucide-react";
import { useLayoutEffect } from "react";
import { Button } from "@/components/ui/button";

const NO_MOTION_QUERY = "(prefers-reduced-motion: no-preference)";
const DARK_QUERY = "(prefers-color-scheme: dark)";

function storedTheme() {
  try {
    const value = localStorage.getItem("theme");
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeToggle({
  labels,
}: {
  labels: { toDark: string; toLight: string };
}) {
  // Re-applies what the head script set (dev Strict Mode re-render) and follows
  // the system theme while the visitor has not chosen one.
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia(NO_MOTION_QUERY).matches) {
      root.classList.add("motion-ok");
    }
    const stored = storedTheme();
    if (stored) {
      applyTheme(stored === "dark");
      return;
    }
    const media = window.matchMedia(DARK_QUERY);
    applyTheme(media.matches);
    const onChange = (event: MediaQueryListEvent) => {
      if (!storedTheme()) applyTheme(event.matches);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  function onClick() {
    const next = !document.documentElement.classList.contains("dark");
    const flip = () => {
      applyTheme(next);
      try {
        localStorage.setItem("theme", next ? "dark" : "light");
      } catch {}
    };
    if (
      window.matchMedia(NO_MOTION_QUERY).matches &&
      "startViewTransition" in document
    ) {
      document.startViewTransition(flip);
    } else {
      flip();
    }
  }

  return (
    <Button variant="ghost" size="icon-sm" type="button" onClick={onClick}>
      <Moon aria-hidden="true" className="dark:hidden" />
      <Sun aria-hidden="true" className="hidden dark:inline" />
      <span className="sr-only dark:hidden">{labels.toDark}</span>
      <span className="sr-only hidden dark:inline">{labels.toLight}</span>
    </Button>
  );
}
