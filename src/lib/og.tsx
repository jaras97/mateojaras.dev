// Typographic OG card: flexbox only, no decoration (D-07). Fonts are
// the static TTFs the CV already ships, traced for the OG routes in
// next.config.ts. Colors are the light-theme tokens of globals.css in hex,
// because the renderer does not parse oklch().
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const dir = join(process.cwd(), "assets/fonts-pdf");
const funnel = readFile(join(dir, "FunnelDisplay-SemiBold.ttf"));
const mono = readFile(join(dir, "GeistMono-Regular.ttf"));

const BG = "#fcfaf6";
const INK = "#171f2e";
const INK_2 = "#5b6270";
const ACCENT = "#e56636";

export async function renderOgImage({
  label,
  title,
  date,
}: {
  label: string;
  title: string;
  date: string;
}) {
  const long = title.length > 60;
  const [funnelData, monoData] = await Promise.all([funnel, mono]);
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: BG,
        padding: 72,
      }}
    >
      <div
        style={{
          display: "flex",
          fontFamily: "Geist Mono",
          fontSize: 28,
          color: INK_2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          fontFamily: "Funnel Display",
          fontSize: long ? 56 : 72,
          lineHeight: 1.1,
          color: INK,
          lineClamp: 3,
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "Geist Mono",
          fontSize: 28,
          color: INK_2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              background: ACCENT,
              marginRight: 16,
            }}
          />
          mateojaras.dev
        </div>
        <div style={{ display: "flex" }}>{date}</div>
      </div>
    </div>,
    {
      ...ogSize,
      fonts: [
        {
          name: "Funnel Display",
          data: funnelData,
          weight: 600,
          style: "normal",
        },
        {
          name: "Geist Mono",
          data: monoData,
          weight: 400,
          style: "normal",
        },
      ],
    },
  );
}
