import { Analytics } from "@vercel/analytics/next";

// Public site only (D-03). Production and Preview (D-23); nothing locally or
// in CI. Visits and referrers only, no custom events (D-02).
export function SiteAnalytics() {
  const env = process.env.VERCEL_ENV;
  if (env !== "production" && env !== "preview") return null;
  return <Analytics />;
}
