import { Funnel_Display, Geist_Mono, Hanken_Grotesk } from "next/font/google";

// The only three families allowed on the site (DESIGN.md §2, D-16).
// next/font/google downloads them at build time and serves them from
// /_next/static/media, so visitors never hit a Google font host.
// Shared module: phase 2 splits the root layout in two and both load these.

export const funnelDisplay = Funnel_Display({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-funnel-display",
});

export const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-hanken-grotesk",
});

export const geistMono = Geist_Mono({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const fontVariables = `${funnelDisplay.variable} ${hankenGrotesk.variable} ${geistMono.variable}`;
