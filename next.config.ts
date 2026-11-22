import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const isDev = process.env.NODE_ENV === "development";
const isPreview = process.env.VERCEL_ENV === "preview";
const vercelLive = isPreview ? " https://vercel.live" : "";
const blobHost = "https://*.public.blob.vercel-storage.com";

// Static CSP sent as a header: per-request tokens would force dynamic
// rendering and break the static shell. Report-Only until the reports are reviewed.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${vercelLive}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' blob: data: ${blobHost}${vercelLive}`,
  "font-src 'self'",
  `connect-src 'self'${vercelLive}`,
  ...(isPreview ? ["frame-src https://vercel.live"] : []),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy-Report-Only", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  // The CV PDF (admin) and the OG images read the static TTFs at runtime.
  outputFileTracingIncludes: {
    "/admin/**": ["./assets/fonts-pdf/*.ttf"],
    "/[locale]/**/opengraph-image": ["./assets/fonts-pdf/*.ttf"],
    "/[locale]/opengraph-image": ["./assets/fonts-pdf/*.ttf"],
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/cv/en.pdf", destination: "/api/cv/en" },
        { source: "/cv/es.pdf", destination: "/api/cv/es" },
        { source: "/resume.json", destination: "/api/resume/en" },
        { source: "/resume.es.json", destination: "/api/resume/es" },
      ],
    };
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
