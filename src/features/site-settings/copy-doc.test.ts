import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { readAbout, readFreelanceBullets } from "./copy-doc";

const raw = readFileSync(
  fileURLToPath(new URL("../../../docs/copy.md", import.meta.url)),
  "utf8",
);

describe("readAbout", () => {
  it("returns the blockquote text of both languages without comments", () => {
    const about = readAbout(raw);
    expect(about.es.startsWith("Soy Mateo Jaramillo")).toBe(true);
    expect(about.en.startsWith("I’m Mateo Jaramillo")).toBe(true);
    for (const text of [about.en, about.es]) {
      expect(text).not.toContain("<!--");
      expect(text).not.toMatch(/^>/);
      expect(text).not.toContain("\n");
    }
  });

  it("throws naming the section when ## About is missing", () => {
    expect(() => readAbout("## Now\nEN:\n> x\n")).toThrow(/## About/);
  });
});

describe("readFreelanceBullets", () => {
  it("returns three paired bullets in order without labels", () => {
    const { en, es } = readFreelanceBullets(raw);
    expect(en).toHaveLength(3);
    expect(es).toHaveLength(3);
    expect(en[0]).toMatch(/^I built the website for Centro Estético ManuJ/);
    expect(es[0]).toMatch(/^Construí el sitio de Centro Estético ManuJ/);
    for (const b of [...en, ...es]) expect(b).not.toMatch(/^(EN|ES):/);
  });

  it("does not pick up the Sofka placeholder bullet", () => {
    const all = readFreelanceBullets(raw);
    expect([...all.en, ...all.es].join(" ")).not.toMatch(/Pendiente/);
  });
});
