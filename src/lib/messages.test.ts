import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import es from "../../messages/es.json";

type Tree = { [key: string]: unknown };

function keyPaths(tree: Tree, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([key, value]) =>
    value !== null && typeof value === "object" && !Array.isArray(value)
      ? keyPaths(value as Tree, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

function difference(a: string[], b: string[]) {
  const other = new Set(b);
  return a.filter((key) => !other.has(key));
}

const files: Record<"en" | "es", Tree> = { en, es };

describe("messages/en.json and messages/es.json", () => {
  it("declare the same namespaces", () => {
    const enNamespaces = Object.keys(files.en).sort();
    const esNamespaces = Object.keys(files.es).sort();
    expect(
      {
        onlyInEn: difference(enNamespaces, esNamespaces),
        onlyInEs: difference(esNamespaces, enNamespaces),
      },
      "namespaces present in only one of the two files",
    ).toEqual({ onlyInEn: [], onlyInEs: [] });
  });

  for (const namespace of Object.keys(files.en)) {
    it(`carry the same keys in the ${namespace} namespace`, () => {
      const enKeys = keyPaths(files.en[namespace] as Tree).sort();
      const esKeys = keyPaths((files.es[namespace] ?? {}) as Tree).sort();
      expect(
        {
          onlyInEn: difference(enKeys, esKeys),
          onlyInEs: difference(esKeys, enKeys),
        },
        `${namespace}: keys present in only one of the two files`,
      ).toEqual({ onlyInEn: [], onlyInEs: [] });
      expect(enKeys.length).toBeGreaterThan(0);
    });
  }

  for (const locale of ["en", "es"] as const) {
    it(`keep ${locale} Site and Admin.messages free of em-dashes, emojis and exclamation marks`, () => {
      const tree = files[locale] as Tree;
      const admin = tree.Admin as Tree;
      const values = (t: Tree): string[] =>
        Object.values(t).flatMap((v) =>
          v !== null && typeof v === "object" ? values(v as Tree) : [String(v)],
        );
      const strings = [
        ...values(tree.Site as Tree),
        ...values(admin.messages as Tree),
      ];
      const offenders = strings.filter((v) =>
        /—|!|\p{Extended_Pictographic}/u.test(v),
      );
      expect(offenders).toEqual([]);
    });
  }
});
