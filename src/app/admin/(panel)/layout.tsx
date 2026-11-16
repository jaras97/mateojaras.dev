import { Suspense } from "react";
import { AuthGate } from "./_components/auth-gate";

// The admin is fully dynamic; the session read sits inside Suspense.
export const instant = false;

function AdminSkeleton() {
  return (
    <div aria-busy="true" className="flex-1">
      <div className="h-16 border-b border-border" />
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
