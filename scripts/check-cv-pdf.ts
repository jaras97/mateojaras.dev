// Usage: tsx scripts/check-cv-pdf.ts <url> [<url>…] [--chars=áéíóúñ]
//        [--expect-text=<s>]… [--reject-text=<s>]…
// Downloads each CV and checks magic bytes, Content-Length, pages and the
// Spanish characters in the text layer. Prints one PASS/FAIL line per URL.
import { extractText, getDocumentProxy } from "unpdf";

// --chars=íéñ narrows the set when the real content of a locale lacks a letter.
const charsArg = process.argv.find((a) => a.startsWith("--chars="));
const REQUIRED = charsArg
  ? [...charsArg.slice("--chars=".length).normalize("NFC")]
  : ["á", "é", "í", "ó", "ú", "ñ"];
// Repeatable: --expect-text=<s> must appear, --reject-text=<s> must not.
const flagValues = (flag: string) =>
  process.argv
    .filter((a) => a.startsWith(flag))
    .map((a) => a.slice(flag.length).normalize("NFC"));
const EXPECT_TEXT = flagValues("--expect-text=");
const REJECT_TEXT = flagValues("--reject-text=");

async function check(url: string): Promise<string[]> {
  const problems: string[] = [];
  const response = await fetch(url);
  if (!response.ok) return [`HTTP ${response.status}`];
  const bytes = new Uint8Array(await response.arrayBuffer());
  const magic = new TextDecoder("latin1").decode(bytes.subarray(0, 5));
  if (magic !== "%PDF-") problems.push(`magic bytes "${magic}"`);
  const length = response.headers.get("content-length");
  if (length && Number(length) !== bytes.length) {
    problems.push(`Content-Length ${length} != ${bytes.length} bytes`);
  }
  if (problems.length > 0) return problems;
  const pdf = await getDocumentProxy(bytes);
  const { totalPages, text } = await extractText(pdf, { mergePages: true });
  if (totalPages > 2) problems.push(`${totalPages} pages (max 2)`);
  const normalized = text.normalize("NFC");
  const missing = REQUIRED.filter((ch) => !normalized.includes(ch));
  if (missing.length > 0) problems.push(`missing ${missing.join(" ")}`);
  for (const s of EXPECT_TEXT) {
    if (!normalized.includes(s)) problems.push(`missing text "${s}"`);
  }
  for (const s of REJECT_TEXT) {
    if (normalized.includes(s)) problems.push(`found text "${s}"`);
  }
  return problems;
}

async function main() {
  const urls = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  if (urls.length === 0) {
    console.error("Usage: tsx scripts/check-cv-pdf.ts <url> [<url>…]");
    process.exit(2);
  }

  let failed = false;
  for (const url of urls) {
    try {
      const problems = await check(url);
      if (problems.length > 0) failed = true;
      console.log(
        problems.length > 0
          ? `FAIL ${url}: ${problems.join("; ")}`
          : `PASS ${url}`,
      );
    } catch (error) {
      failed = true;
      console.log(`FAIL ${url}: ${(error as Error).message}`);
    }
  }
  process.exit(failed ? 1 : 0);
}

main();
