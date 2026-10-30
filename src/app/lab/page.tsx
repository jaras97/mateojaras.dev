import Link from "next/link";
import { labMessages } from "@/lib/messages";

const t = labMessages.index;

const links = [
  { href: "/lab/tokens", label: t.tokensLink },
  { href: "/lab/hero", label: t.heroLink },
];

export default function LabIndexPage() {
  return (
    <main className="mx-auto max-w-page px-6 py-12 md:px-12 lg:py-16">
      <h1 className="font-heading text-4xl font-semibold tracking-display text-balance">
        {t.title}
      </h1>
      <ul className="mt-8 flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-base underline underline-offset-4 decoration-border hover:decoration-foreground motion-safe:transition-colors motion-safe:duration-[160ms]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
