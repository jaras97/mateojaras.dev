import path from "node:path";
import { Font } from "@react-pdf/renderer";

// Static TTFs only (no WOFF2, no variable fonts). Traced for /admin/** in
// next.config.ts. SemiBold and Italic stay on disk, unregistered.
let registered = false;

export function registerCvFonts() {
  if (registered) return;
  const file = (name: string) =>
    path.join(process.cwd(), "assets/fonts-pdf", name);
  Font.register({
    family: "Funnel Display",
    fonts: [{ src: file("FunnelDisplay-Bold.ttf"), fontWeight: 700 }],
  });
  Font.register({
    family: "Hanken Grotesk",
    fonts: [
      { src: file("HankenGrotesk-Regular.ttf"), fontWeight: 400 },
      { src: file("HankenGrotesk-Bold.ttf"), fontWeight: 700 },
    ],
  });
  Font.register({
    family: "Geist Mono",
    fonts: [{ src: file("GeistMono-Regular.ttf"), fontWeight: 400 }],
  });
  Font.registerHyphenationCallback((word) => [word]);
  registered = true;
}
