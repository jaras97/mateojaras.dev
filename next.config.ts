import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const isDev = process.env.NODE_ENV === "development";
const isPreview = process.env.VERCEL_ENV === "preview";
const blobHost = "https://*.public.blob.vercel-storage.com";
// @vercel/blob client uploads go to this API path (D-16).
const blobApi = "https://vercel.com/api/blob/";

// Preview-only allowances for the Vercel Toolbar (comments, feedback).
const previewOnly = (value: string) => (isPreview ? ` ${value}` : "");

// Static CSP sent as a header (no nonce, keeps the static shell). Enforced
// since 05-04 after a zero-violation pass on Preview. 'unsafe-inline' scripts
// accepted (D-17). Blob client upload host per D-16.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${previewOnly("https://vercel.live")}`,
  `style-src 'self' 'unsafe-inline'${previewOnly("https://vercel.live")}`,
  `img-src 'self' blob: data: ${blobHost}${previewOnly("https://vercel.live https://vercel.com")}`,
  `font-src 'self'${previewOnly("https://vercel.live https://assets.vercel.com")}`,
  `connect-src 'self' ${blobApi} ${blobHost}${previewOnly("https://vercel.live wss://ws-us3.pusher.com")}`,
  ...(isPreview ? ["frame-src https://vercel.live"] : []),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
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
