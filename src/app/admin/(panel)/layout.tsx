import { Suspense } from "react";
import { AuthGate } from "./_components/auth-gate";

// The admin is fully dynamic; the session read sits inside Suspense.
export const instant = false;

// Static skeleton: sidebar block, 64px header, three 40px rows. No shimmer.
function AdminSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-1">
      <div className="hidden w-60 shrink-0 border-r border-border bg-muted lg:block" />
      <div className="flex-1">
        <div className="h-16 border-b border-border" />
        <div className="flex flex-col gap-3 p-6">
          <div className="h-10 bg-muted" />
          <div className="h-10 bg-muted" />
          <div className="h-10 bg-muted" />
        </div>
      </div>
    </div>
  );
}

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <AuthGate>{children}</AuthGate>
    </Suspense>
  );
}
