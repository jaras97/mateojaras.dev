import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Temporary inspection route approved by Teo (D-02). Linked from nowhere,
// never indexed, and off in Vercel production. Deleted at the start of phase 2.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LabLayout({ children }: LayoutProps<"/lab">) {
  if (process.env.VERCEL_ENV === "production") {
    notFound();
  }

  return (
    <div lang="es" className="min-h-dvh bg-background text-foreground">
      {children}
    </div>
  );
}
