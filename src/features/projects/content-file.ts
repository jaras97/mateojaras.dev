import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import type { ProjectContent } from "./content-schema";

const sectionHeading = /^## (.+?)\s*$/;

/**
 * Splits a docs/content file into the YAML between its first two "---" lines
 * and the body sections, keyed by the exact "## fieldName" headings. "###"
 * subheadings stay inside their section. Text outside a section, a repeated
 * heading or a missing front-matter throws, so nothing is silently dropped.
 */
export function splitContentFile(raw: string): {
  frontMatterText: string;
  sections: Record<string, string>;
} {
  const lines = raw.replace(/\r\n?/g, "\n").split("\n");
  if (lines[0]?.trim() !== "---") {
    throw new Error('content file must start with a "---" line');
  }
  const close = lines.findIndex((line, i) => i > 0 && line.trim() === "---");
  if (close === -1) {
    throw new Error('front-matter is not closed by a second "---" line');
  }

  const sections: Record<string, string> = {};
  let current: string | null = null;
  let buffer: string[] = [];
  const flush = () => {
    if (current !== null) sections[current] = buffer.join("\n").trim();
  };

  for (const line of lines.slice(close + 1)) {
    const heading = sectionHeading.exec(line);
    if (heading) {
      flush();
      current = heading[1];
      if (Object.hasOwn(sections, current)) {
        throw new Error(`section "## ${current}" appears twice`);
      }
      buffer = [];
    } else if (current === null) {
      if (line.trim() !== "") {
        throw new Error("body text found before the first ## section");
      }
    } else {
      buffer.push(line);
    }
  }
  flush();

  return { frontMatterText: lines.slice(1, close).join("\n"), sections };
}

/** Parses the front-matter YAML (yaml 2.x, core schema: dates stay strings). */
export function parseFrontMatter(text: string): unknown {
  return parse(text, { uniqueKeys: true });
}

export function parseContentFile(raw: string): ProjectContent {
  const { frontMatterText, sections } = splitContentFile(raw);
  return { frontMatter: parseFrontMatter(frontMatterText), sections };
}

/** Every project file in `dir` (README.md excluded), sorted by name. */
export function loadContentDir(
  dir: string,
): { file: string; content: ProjectContent }[] {
  return readdirSync(dir)
    .filter((file) => file.endsWith(".md") && file !== "README.md")
    .sort()
    .map((file) => {
      try {
        const raw = readFileSync(join(dir, file), "utf8");
        return { file, content: parseContentFile(raw) };
      } catch (error) {
        throw new Error(`${file}: ${(error as Error).message}`, {
          cause: error,
        });
      }
    });
}
