import { buttonVariants } from "@/components/ui/button";

export function CaseCta({
  closing,
  label,
  href,
}: {
  closing: string;
  label: string;
  href: string;
}) {
  return (
    <div className="mt-16 flex flex-col gap-6 border-t border-border pt-6 lg:mt-24">
      <p className="max-w-prose text-[25px] leading-snug">{closing}</p>
      <div>
        <a href={href} className={buttonVariants({ size: "lg" })}>
          {label}
        </a>
      </div>
    </div>
  );
}
