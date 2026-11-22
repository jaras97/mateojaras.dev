import Image from "next/image";

// The LCP image: eager and high priority, fixed 16:10 box (CLS 0). Never
// inside Reveal (Pitfall 9).
export function CaseCover({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
      <Image
        src={src}
        alt={alt}
        fill
        fetchPriority="high"
        loading="eager"
        sizes="(min-width: 1024px) 1000px, 100vw"
        className="object-cover"
      />
    </div>
  );
}
