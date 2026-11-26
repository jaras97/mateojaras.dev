import { notFound } from "next/navigation";

// Unmatched paths under a locale render [locale]/not-found with HTTP 404 (D-21, next-intl recipe).
export default function CatchAll() {
  notFound();
}
