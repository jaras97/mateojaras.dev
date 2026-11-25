// Pure content checks run by scripts/load-content.ts before any write (no
// file access, no framework imports). They enforce the CLAUDE.md rules: no
// em-dashes, prices, infra identifiers or placeholder markers, en/es digit
// parity, and the D-03/D-05 claim rules about Prendo.
// The claim rules are heuristics over loaded copy; Teo's review stays the
// primary gate. URL fields (liveUrl, repoUrl) are the caller's responsibility:
// do not pass them through lintText, they may legitimately contain hosts.
import {
  digitTokens,
  stringsIn,
  surplus,
} from "@/features/projects/content-schema";

export type LintIssue = {
  path: string;
  kind: "em-dash" | "price" | "infra" | "marker" | "parity" | "claim";
  detail: string;
};

export type LintScope = "default" | "now";

// Unicode-aware word boundaries: \b misbehaves next to accented letters.
const word = (source: string) =>
  new RegExp(`(?<![\\p{L}\\p{N}_])(?:${source})(?![\\p{L}\\p{N}_])`, "iu");

export const AI_FEATURE = word(
  String.raw`AI[- ]features?|AI-powered|features?\s+(?:de|con|with|of)\s+(?:AI|IA)|funcionalidad(?:es)?\s+(?:de|con)\s+(?:AI|IA)|función\s+(?:de|con)\s+(?:AI|IA)`,
);

export const IN_PROGRESS = word(
  String.raw`estoy\s+(?:construyendo|añadiendo|agregando|desarrollando)|i['’]m\s+(?:building|adding|developing)|i\s+am\s+(?:building|adding|developing)|en\s+desarrollo|in\s+development|in\s+progress|en\s+progreso`,
);

export const FINISHED = word(
  String.raw`ya\s+funciona|ya\s+está\s+lista|ya\s+está\s+en\s+producción|lancé|terminé|is\s+live|shipped|launched|finished|now\s+works|ya\s+disponible`,
);

// A sentence about v1 running in production or having users, without a negation.
export const V1_CLAIM =
  /^(?=[\s\S]*(?<![\p{L}\p{N}_])(?:v1|primera versión|first version)(?![\p{L}\p{N}_]))(?=[\s\S]*(?<![\p{L}\p{N}_])(?:producción|production|usuarios|users|en uso|in use)(?![\p{L}\p{N}_]))(?![\s\S]*(?<![\p{L}\p{N}_])(?:nunca|never|no llegó|did not|didn['’]t|not reach)(?![\p{L}\p{N}_]))/iu;

const EM_DASH = /—/;
const PRICE = /\b(?:COP|USD|EUR)\b|\$|\bmillones?\b|\bmillions?\b/i;
const INFRA = /fly\.dev|fly\.io|supabase\.co|\.vercel\.app|\biad\b/i;
const MARKER = /\[Teo escribe\]|\bTODO\b|lorem/i;

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function lintText(
  text: string,
  path = "",
  opts?: { scope?: LintScope },
): LintIssue[] {
  const scope = opts?.scope ?? "default";
  const issues: LintIssue[] = [];
  const add = (kind: LintIssue["kind"], detail: string) =>
    issues.push({ path, kind, detail });

  if (EM_DASH.test(text)) add("em-dash", "em-dash found");
  const price = PRICE.exec(text);
  if (price) add("price", `price or amount "${price[0]}"`);
  const infra = INFRA.exec(text);
  if (infra) add("infra", `infra identifier "${infra[0]}"`);
  const marker = MARKER.exec(text);
  if (marker) add("marker", `placeholder marker "${marker[0]}"`);

  for (const sentence of sentences(text)) {
    if (AI_FEATURE.test(sentence)) {
      if (scope === "default") {
        add("claim", "AI feature outside the Now (D-03)");
      } else if (!IN_PROGRESS.test(sentence) || FINISHED.test(sentence)) {
        add(
          "claim",
          "AI feature in the Now must be in progress, not finished (D-03)",
        );
      }
    }
    if (V1_CLAIM.test(sentence)) {
      add("claim", "Prendo v1 never reached production (D-05)");
    }
  }
  return issues;
}

export function lintStrings(
  value: unknown,
  path = "",
  opts?: { scope?: LintScope },
): LintIssue[] {
  if (typeof value === "string") return lintText(value, path, opts);
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => lintStrings(item, `${path}[${i}]`, opts));
  }
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).flatMap(([key, item]) =>
      lintStrings(item, path ? `${path}.${key}` : key, opts),
    );
  }
  return [];
}

// en and es must carry the same multiset of digit sequences ("16.5" = "16,5").
export function lintPair(en: unknown, es: unknown, path = ""): LintIssue[] {
  const enTokens = digitTokens(stringsIn(en));
  const esTokens = digitTokens(stringsIn(es));
  const onlyEn = surplus(enTokens, esTokens);
  const onlyEs = surplus(esTokens, enTokens);
  if (onlyEn.length === 0 && onlyEs.length === 0) return [];
  return [
    {
      path,
      kind: "parity",
      detail: `digits only in en: [${onlyEn.join(", ")}], only in es: [${onlyEs.join(", ")}]`,
    },
  ];
}
