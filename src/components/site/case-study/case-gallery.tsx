import Image from "next/image";
import { type Segment, SegmentLine } from "@/components/site/segment-line";
import type { Locale } from "@/features/site-settings/types";
import { formatMonthYear } from "@/lib/format";
import { localized } from "@/lib/i18n-fields";

export type GalleryMedia = {
  url: string;
  altEn: string;
  altEs: string;
  type: "image" | "video";
  captionEn?: string;
  captionEs?: string;
  capturedAt?: string;
};

const two = (n: number) => String(n).padStart(2, "0");

// Everything after the cover, in stored order. Figures reserve a 16:10 box so
// nothing shifts while images load. No client JS.
export function CaseGallery({
  media,
  cover,
  locale,
  labels,
}: {
  media: GalleryMedia[];
  cover: string | null;
  locale: Locale;
  labels: { figure: string };
}) {
  const items = media.filter((item) => item.url !== cover);
  if (items.length === 0) return null;
  const total = items.length;
  return (
    <div className="flex flex-col gap-8">
      {items.map((item, index) => {
        const alt = localized(item, "alt", locale) as string;
        const caption = (
          localized(item, "caption", locale) as string | undefined
        )?.trim();
        const date = item.capturedAt
          ? formatMonthYear(
              item.capturedAt.length === 7
                ? `${item.capturedAt}-01`
                : item.capturedAt,
              locale,
            )
          : null;
        const segments: Segment[] = [];
        if (caption) segments.push({ key: "caption", content: caption });
        if (date) segments.push({ key: "date", content: date });
        if (segments.length === 0) {
          segments.push({
            key: "n",
            content: labels.figure
              .replace("{n}", two(index + 1))
              .replace("{total}", two(total)),
          });
        }
        return (
          <figure key={item.url}>
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
              {item.type === "video" ? (
                // biome-ignore lint/a11y/useMediaCaption: screen recording without audio
                <video
                  src={item.url}
                  controls
                  preload="none"
                  playsInline
                  aria-label={alt}
                  className="size-full object-cover"
                />
              ) : (
                <Image
                  src={item.url}
                  alt={alt}
                  fill
                  loading="lazy"
                  sizes="(min-width: 1024px) 650px, 100vw"
                  className="object-cover"
                />
              )}
            </div>
            <figcaption className="mt-2">
              <SegmentLine
                as="div"
                segments={segments}
                className="text-ink-2"
              />
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
