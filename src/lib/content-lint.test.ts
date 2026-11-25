import { describe, expect, it } from "vitest";
import {
  AI_FEATURE,
  FINISHED,
  IN_PROGRESS,
  lintPair,
  lintStrings,
  lintText,
  V1_CLAIM,
} from "./content-lint";

const kinds = (text: string, scope?: "default" | "now") =>
  lintText(text, "p", scope ? { scope } : undefined).map((i) => i.kind);

describe("lintText basics", () => {
  it("accepts plain copy", () => {
    expect(lintText("Construyo productos")).toEqual([]);
  });

  it("rejects em-dashes", () => {
    const issues = lintText("uno — dos");
    expect(issues[0].kind).toBe("em-dash");
    expect(issues[0].detail).toMatch(/em-dash/);
  });

  it("rejects prices", () => {
    for (const t of ["cuesta 2 millones", "USD 300", "$ 1.500", "COP 5"]) {
      expect(kinds(t)).toContain("price");
    }
  });

  it("rejects infra identifiers", () => {
    expect(kinds("app.fly.dev")).toContain("infra");
    expect(kinds("abc.supabase.co")).toContain("infra");
  });

  it("rejects markers but not ordinary words", () => {
    expect(kinds("TODO")).toContain("marker");
    expect(kinds("[Teo escribe]")).toContain("marker");
    expect(kinds("lorem ipsum")).toContain("marker");
    expect(lintText("Todos los días")).toEqual([]);
  });
});

describe("lintStrings", () => {
  it("walks nested objects and arrays with paths", () => {
    const issues = lintStrings(
      { a: [{ b: "ok" }, { b: "USD 3" }], c: { d: "TODO" } },
      "root",
    );
    expect(issues.map((i) => i.path).sort()).toEqual([
      "root.a[1].b",
      "root.c.d",
    ]);
  });
});

describe("lintPair", () => {
  it("treats 16.5 and 16,5 as equal", () => {
    expect(lintPair("16.5 h", "16,5 h", "x")).toEqual([]);
  });
  it("lists mismatched digits", () => {
    const issues = lintPair("3 phases", "4 fases", "x");
    expect(issues).toHaveLength(1);
    expect(issues[0].kind).toBe("parity");
    expect(issues[0].detail).toMatch(/3/);
    expect(issues[0].detail).toMatch(/4/);
  });
});

describe("claims in the Now scope (D-03)", () => {
  it("allows an in-progress AI feature", () => {
    expect(
      lintText("Estoy construyendo una feature de AI en Prendo.", "now_es", {
        scope: "now",
      }),
    ).toEqual([]);
    expect(
      lintText("I'm building an AI feature in Prendo.", "now_en", {
        scope: "now",
      }),
    ).toEqual([]);
  });

  it("rejects a finished AI feature", () => {
    expect(kinds("Lancé la feature de AI de Prendo.", "now")).toContain(
      "claim",
    );
    expect(kinds("The AI feature in Prendo is live.", "now")).toContain(
      "claim",
    );
  });
});

describe("claims in the default scope", () => {
  it("rejects the AI feature outside the Now", () => {
    expect(kinds("Estoy construyendo una feature de AI en Prendo.")).toContain(
      "claim",
    );
    expect(kinds("Prendo has AI-powered pricing.")).toContain("claim");
  });

  it("allows AI as a tool or as the bot's engine", () => {
    expect(
      lintText("El bot usa la API de Claude para analizar cada anuncio."),
    ).toEqual([]);
    expect(
      lintText("I build products with AI agents and review gates."),
    ).toEqual([]);
  });
});

describe("Prendo v1 claims (D-05)", () => {
  it("rejects v1 running in production or with users", () => {
    expect(
      kinds("Prendo v1 corrió en producción con usuarios reales."),
    ).toContain("claim");
    expect(kinds("The first version had users in production.")).toContain(
      "claim",
    );
  });

  it("allows saying v1 never reached production", () => {
    expect(
      lintText("La v1 se hizo para un cliente y nunca llegó a producción."),
    ).toEqual([]);
    expect(lintText("v1 never reached production.")).toEqual([]);
  });
});

describe("exported claim constants", () => {
  it("expose the four regexes", () => {
    expect(AI_FEATURE.test("AI feature")).toBe(true);
    expect(IN_PROGRESS.test("estoy construyendo")).toBe(true);
    expect(FINISHED.test("lancé")).toBe(true);
    expect(V1_CLAIM.test("v1 en producción")).toBe(true);
  });
});
