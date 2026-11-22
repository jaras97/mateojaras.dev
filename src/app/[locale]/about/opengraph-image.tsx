import { ogContentType, ogSize } from "@/lib/og";
import { renderOgPage } from "@/lib/og-page";

export const size = ogSize;
export const contentType = ogContentType;

export default function Image(props: { params: Promise<{ locale: string }> }) {
  return renderOgPage("about", props);
}
