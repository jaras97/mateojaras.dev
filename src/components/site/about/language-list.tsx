import type { Locale } from "@/features/site-settings/types";

export type LanguageEntry = { code: string; level: string };

function languageName(code: string, locale: Locale) {
  const name = new Intl.DisplayNames(locale, { type: "language" }).of(code);
  const text = name ?? code;
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
}

export function LanguageList({
  languages,
  locale,
  levels,
}: {
  languages: LanguageEntry[];
  locale: Locale;
  levels: Record<string, string>;
}) {
  if (languages.length === 0) return null;
  return (
    <dl className="space-y-2">
      {languages.map((l) => (
        <div key={l.code} className="flex items-baseline gap-4">
          <dt className="font-semibold">{languageName(l.code, locale)}</dt>
          <dd className="font-mono text-sm text-muted-foreground">
            {levels[l.level] ?? l.level}
          </dd>
        </div>
      ))}
    </dl>
  );
}
