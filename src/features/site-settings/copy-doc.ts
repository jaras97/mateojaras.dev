// Pure parsers over docs/copy.md. HTML comments (authorship, enStatus) are
// dropped so they never reach the database.

function stripComments(raw: string): string {
  return raw.replace(/\r\n?/g, "\n").replace(/<!--[\s\S]*?-->/g, "");
}

function section(raw: string, heading: RegExp, label: string): string {
  const lines = stripComments(raw).split("\n");
  const start = lines.findIndex((l) => heading.test(l));
  if (start === -1)
    throw new Error(`docs/copy.md: section "${label}" not found`);
  const level = /^#+/.exec(lines[start])?.[0].length ?? 2;
  const out: string[] = [];
  for (const line of lines.slice(start + 1)) {
    const h = /^(#+) /.exec(line);
    if (h && h[1].length <= level) break;
    out.push(line);
  }
  return out.join("\n");
}

/** Text of the "EN:" / "ES:" blockquotes under "## About". */
export function readAbout(raw: string): { en: string; es: string } {
  const body = section(raw, /^## About\b/, "## About");
  const grab = (label: "EN" | "ES") => {
    const lines = body.split("\n");
    const at = lines.findIndex((l) => l.trim() === `${label}:`);
    if (at === -1)
      throw new Error(`docs/copy.md: "${label}:" not found in ## About`);
    const quote: string[] = [];
    for (const line of lines.slice(at + 1)) {
      if (line.startsWith(">")) quote.push(line.replace(/^>\s?/, ""));
      else if (quote.length > 0 || line.trim() !== "") break;
    }
    const text = quote.join(" ").trim();
    if (!text)
      throw new Error(`docs/copy.md: "${label}:" in ## About is empty`);
    return text;
  };
  return { en: grab("EN"), es: grab("ES") };
}

/** The "- EN: ..." / "  ES: ..." bullet pairs under "### Freelance". */
export function readFreelanceBullets(raw: string): {
  en: string[];
  es: string[];
} {
  const body = section(raw, /^### Freelance\b/, "### Freelance");
  const en: string[] = [];
  const es: string[] = [];
  for (const line of body.split("\n")) {
    const e = /^- EN:\s*(.+)$/.exec(line);
    const s = /^\s+ES:\s*(.+)$/.exec(line);
    if (e) en.push(e[1].trim());
    else if (s) es.push(s[1].trim());
  }
  if (en.length === 0 || en.length !== es.length) {
    throw new Error(
      `docs/copy.md: Freelance bullets unpaired (${en.length} EN, ${es.length} ES)`,
    );
  }
  return { en, es };
}
