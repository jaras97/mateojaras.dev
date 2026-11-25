import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  readAbout,
  readFreelanceBullets,
  readHeadline,
  readNow,
} from "./copy-doc";

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
  it("returns four paired bullets in order without labels", () => {
    const { en, es } = readFreelanceBullets(raw);
    expect(en).toHaveLength(4);
    expect(es).toHaveLength(4);
    expect(en[0]).toMatch(/^I’m building Prendo/);
    expect(es[0]).toMatch(/^Estoy construyendo Prendo/);
    for (const b of [...en, ...es]) expect(b).not.toMatch(/^(EN|ES):/);
  });

  it("does not pick up the Sofka placeholder bullet", () => {
    const all = readFreelanceBullets(raw);
    expect([...all.en, ...all.es].join(" ")).not.toMatch(/Pendiente/);
  });
});

describe("readHeadline", () => {
  it("returns both headlines without comments", () => {
    const h = readHeadline(raw);
    expect(h.en.startsWith("I’m an AI full stack developer")).toBe(true);
    expect(h.es.startsWith("Soy AI full stack developer")).toBe(true);
    for (const t of [h.en, h.es]) expect(t).not.toContain("<!--");
  });

  it("throws naming docs/copy.md when absent", () => {
    expect(() => readHeadline("## Hero\n")).toThrow(/docs\/copy\.md/);
  });
});

describe("readNow", () => {
  it("returns paragraph arrays for both languages", () => {
    const now = readNow(raw);
    expect(now.en.length).toBeGreaterThan(0);
    expect(now.es.length).toBeGreaterThan(0);
    expect(now.es).toHaveLength(2);
    expect(now.es[0]).toMatch(/^Estoy construyendo una función de IA en Prendo/);
    expect(now.en[0]).toMatch(/^I’m building an AI feature in Prendo/);
  });
});
