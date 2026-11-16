"use client";

import { cn } from "cn";
import { usePathname } from "next/navigation";
import { AdminLink } from "./admin-link";

export type AdminNavLabels = {
  label: string;
  entries: Record<
    | "settings"
    | "projects"
    | "experience"
    | "skills"
    | "education"
    | "cv"
    | "messages",
    string
  >;
  unread: string; // already formatted for the current count
};

const ENTRIES = [
  { key: "settings", href: "/admin/ajustes" },
  { key: "projects", href: "/admin/proyectos" },
  { key: "experience", href: "/admin/experiencia" },
  { key: "skills", href: "/admin/skills" },
  { key: "education", href: "/admin/educacion" },
  { key: "cv", href: "/admin/cv" },
  { key: "messages", href: "/admin/mensajes" },
] as const;

export function AdminNav({
  unreadCount,
  labels,
}: {
  unreadCount: number;
  labels: AdminNavLabels;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label={labels.label}>
      <ul className="flex flex-col">
        {ENTRIES.map((entry, index) => {
          const active = pathname.startsWith(entry.href);
          return (
            <li key={entry.key}>
              <AdminLink
                href={entry.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-11 items-center gap-3 px-4 text-base outline-none hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset motion-safe:transition-colors motion-safe:duration-[160ms]",
                  active ? "font-semibold" : "text-foreground",
                )}
              >
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-0.5 bg-signal"
                  />
                ) : null}
                <span className="font-mono text-xs text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1 truncate">
                  {labels.entries[entry.key]}
                </span>
                {entry.key === "messages" && unreadCount > 0 ? (
                  <span
                    role="img"
                    aria-label={labels.unread}
                    className="inline-flex h-5 min-w-5 items-center justify-center rounded-[var(--radius)] bg-muted px-1 font-mono text-xs text-foreground"
                  >
                    {unreadCount}
                  </span>
                ) : null}
              </AdminLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
