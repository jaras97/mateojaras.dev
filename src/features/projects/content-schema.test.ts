import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadContentDir, splitContentFile } from "./content-file";
import {
  checkNumberParity,
  type ProjectContent,
  validateProjectContent,
} from "./content-schema";

// Synthetic inputs: they exist only in this file and are never written to
// docs/content (CLAUDE.md forbids invented content in the site, not in tests).
const FIXTURE_SLUG = "contract-fixture";
const S = "Texto sintético del contrato";

function fixture(): {
  frontMatter: Record<string, unknown>;
  sections: Record<string, string>;
} {
  return {
    frontMatter: {
      slug: FIXTURE_SLUG,
      enStatus: "draft-translation",
      source: "interview-2026-10-30",
      clientPermission: true,
      sampleData: false,
      titleEs: `${S}, título`,
      titleEn: `${S}, title`,
      taglineEs: `${S}, frase`,
      taglineEn: `${S}, tagline`,
      liveUrl: "https://example.com",
      repoUrl: null,
      startedAt: "2025-01-01",
      finishedAt: null,
      stack: ["Next.js"],
      metrics: [
        {
          labelEs: `${S}, métrica`,
          labelEn: `${S}, metric`,
          value: "1",
          sourceEs: `${S}, fuente, oct 2026`,
          sourceEn: `${S}, source, Oct 2026`,
        },
      ],
      resultsEs: [`${S}, resultado`],
      resultsEn: [`${S}, result`],
      techDecisionsEs: {
        decisions: [
          { title: `${S} 1`, body: `${S}, cuerpo 1` },
          { title: `${S} 2`, body: `${S}, cuerpo 2` },
        ],
      },
      techDecisionsEn: {
        decisions: [
          { title: `${S} 1`, body: `${S}, body 1` },
          { title: `${S} 2`, body: `${S}, body 2` },
        ],
      },
    },
    sections: {
      problemEs: `${S}, problema`,
      problemEn: `${S}, problem`,
      roleEs: `${S}, rol`,
      roleEn: `${S}, role`,
      solutionEs: `${S}, solución`,
      solutionEn: `${S}, solution`,
    },
  };
}

function metricOf(doc: ReturnType<typeof fixture>): Record<string, unknown> {
  return (doc.frontMatter.metrics as Record<string, unknown>[])[0];
}

const issuesOf = (doc: ProjectContent) => validateProjectContent(doc).issues;

describe("docs/content contract (synthetic inputs)", () => {
  it("accepts a complete document and passes number parity", () => {
    const doc = fixture();
    expect(issuesOf(doc)).toEqual([]);
    expect(checkNumberParity(doc)).toEqual({
      ok: true,
      onlyInEs: [],
      onlyInEn: [],
    });
  });

  it("rejects a metric whose sourceEn is empty", () => {
    const doc = fixture();
    metricOf(doc).sourceEn = "  ";
    expect(issuesOf(doc).some((i) => i.startsWith("metrics.0.sourceEn"))).toBe(
      true,
    );
  });

  it("rejects a metric without sourceEn", () => {
    const doc = fixture();
    delete metricOf(doc).sourceEn;
    expect(issuesOf(doc).some((i) => i.startsWith("metrics.0.sourceEn"))).toBe(
      true,
    );
  });

  it("rejects a metric whose sourceEs is empty", () => {
    const doc = fixture();
    metricOf(doc).sourceEs = "";
    expect(issuesOf(doc).some((i) => i.startsWith("metrics.0.sourceEs"))).toBe(
      true,
    );
  });

  it("rejects the single-language metric shape { label, value, source }", () => {
    const doc = fixture();
    doc.frontMatter.metrics = [
      { label: `${S}, métrica`, value: "1", source: `${S}, fuente` },
    ];
    const issues = issuesOf(doc);
    expect(issues.some((i) => i.startsWith("metrics.0"))).toBe(true);
    expect(issues.some((i) => i.includes("Unrecognized key"))).toBe(true);
  });

  it("still reports a metric issue when pendingFields lists metrics", () => {
    const doc = fixture();
    metricOf(doc).sourceEn = "";
    doc.frontMatter.pendingFields = ["metrics"];
    expect(issuesOf(doc).some((i) => i.startsWith("metrics.0.sourceEn"))).toBe(
      true,
    );
  });

  it("rejects slug in pendingFields", () => {
    const doc = fixture();
    doc.frontMatter.pendingFields = ["slug"];
    expect(issuesOf(doc)).toContain(
      "pendingFields: slug is fixed at G4 and cannot be pending",
    );
  });

  it("fails parity when a metric label or source adds or changes a figure", () => {
    const label = fixture();
    metricOf(label).labelEn = `${S}, metric 90`;
    expect(checkNumberParity(label)).toMatchObject({
      ok: false,
      onlyInEn: ["90"],
    });

    const source = fixture();
    metricOf(source).sourceEs = "PageSpeed, oct 2025";
    metricOf(source).sourceEn = "PageSpeed, Oct 2026";
    expect(checkNumberParity(source)).toEqual({
      ok: false,
      onlyInEs: ["2025"],
      onlyInEn: ["2026"],
    });
  });

  it("rejects one technical decision and four technical decisions", () => {
    const one = fixture();
    const es = one.frontMatter.techDecisionsEs as { decisions: unknown[] };
    es.decisions = es.decisions.slice(0, 1);
    expect(
      issuesOf(one).some((i) => i.startsWith("techDecisionsEs.decisions")),
    ).toBe(true);

    const four = fixture();
    const es4 = four.frontMatter.techDecisionsEs as { decisions: unknown[] };
    es4.decisions = [...es4.decisions, ...es4.decisions];
    expect(
      issuesOf(four).some((i) => i.startsWith("techDecisionsEs.decisions")),
    ).toBe(true);
  });

  it("reports a figure present only in the English tagline", () => {
    const doc = fixture();
    doc.frontMatter.taglineEn = `${S}, 40% faster`;
    expect(checkNumberParity(doc)).toEqual({
      ok: false,
      onlyInEs: [],
      onlyInEn: ["40"],
    });
  });

  it("treats 2.5 and 2,5 as the same figure", () => {
    const doc = fixture();
    doc.sections.problemEs = `${S}, 2,5 s`;
    doc.sections.problemEn = `${S}, 2.5 s`;
    expect(checkNumberParity(doc).ok).toBe(true);
  });

  it("requires problemEs unless pendingFields lists it", () => {
    const doc = fixture();
    delete doc.sections.problemEs;
    expect(issuesOf(doc).some((i) => i.startsWith("problemEs"))).toBe(true);
    doc.frontMatter.pendingFields = ["problemEs"];
    expect(issuesOf(doc)).toEqual([]);
  });

  it("has no default for clientPermission: absent fails unless pending", () => {
    const doc = fixture();
    delete doc.frontMatter.clientPermission;
    expect(issuesOf(doc).some((i) => i.startsWith("clientPermission"))).toBe(
      true,
    );
    doc.frontMatter.pendingFields = ["clientPermission"];
    expect(issuesOf(doc)).toEqual([]);
  });

  it("rejects an enStatus other than draft-translation or approved", () => {
    const doc = fixture();
    doc.frontMatter.enStatus = "draft";
    expect(issuesOf(doc).some((i) => i.startsWith("enStatus"))).toBe(true);
  });

  it("rejects unknown front-matter keys and unknown pendingFields names", () => {
    const doc = fixture();
    doc.frontMatter.taglinEs = `${S}, errata`;
    doc.frontMatter.pendingFields = ["problemaEs"];
    const issues = issuesOf(doc);
    expect(issues.some((i) => i.includes("taglinEs"))).toBe(true);
    expect(issues).toContain("pendingFields: unknown field problemaEs");
  });

  it("requires altStatus with media, and a coverImage among the media files", () => {
    const doc = fixture();
    doc.frontMatter.media = [
      {
        file: `material/${FIXTURE_SLUG}/01-vista.webp`,
        altEs: `${S}, alt`,
        altEn: `${S}, alt`,
        type: "image",
      },
    ];
    doc.frontMatter.coverImage = `material/${FIXTURE_SLUG}/02-otra.webp`;
    const issues = issuesOf(doc);
    expect(issues).toContain("altStatus: required once media has entries");
    expect(issues.some((i) => i.startsWith("coverImage"))).toBe(true);

    doc.frontMatter.altStatus = "draft";
    doc.frontMatter.coverImage = `material/${FIXTURE_SLUG}/01-vista.webp`;
    expect(issuesOf(doc)).toEqual([]);
  });
});

describe("splitContentFile", () => {
  it("splits the front-matter from sections keyed by exact ## headings", () => {
    const raw = [
      "---",
      `slug: ${FIXTURE_SLUG}`,
      "---",
      "",
      "## problemEs",
      `${S}, problema`,
      "",
      "### Subtítulo",
      "Más texto",
      "## problemEn",
      `${S}, problem`,
      "",
    ].join("\r\n");
    expect(splitContentFile(raw)).toEqual({
      frontMatterText: `slug: ${FIXTURE_SLUG}`,
      sections: {
        problemEs: `${S}, problema\n\n### Subtítulo\nMás texto`,
        problemEn: `${S}, problem`,
      },
    });
  });

  it("throws on a missing front-matter, stray text or a repeated section", () => {
    expect(() => splitContentFile("## problemEs\ntexto")).toThrow();
    expect(() => splitContentFile("---\nslug: x\n---\ntexto suelto")).toThrow();
    expect(() =>
      splitContentFile("---\nslug: x\n---\n## roleEs\na\n## roleEs\nb"),
    ).toThrow(/twice/);
  });
});

describe("docs/content project files", () => {
  const dir = fileURLToPath(new URL("../../../docs/content", import.meta.url));
  const files = loadContentDir(dir);
  const minFiles = Number(process.env.CONTENT_MIN_FILES ?? 0);

  it(`validates every real file (${files.length} found)`, () => {
    expect(files.length).toBeGreaterThanOrEqual(minFiles);

    const problems: string[] = [];
    for (const { file, content } of files) {
      const slug = (content.frontMatter as { slug?: unknown } | null)?.slug;
      if (file !== `${slug}.md`) {
        problems.push(`${file}: file name does not match slug ${String(slug)}`);
      }
      if (slug === FIXTURE_SLUG || file.includes(FIXTURE_SLUG)) {
        problems.push(`${file}: uses the synthetic test slug`);
      }
      for (const issue of validateProjectContent(content).issues) {
        problems.push(`${file}: ${issue}`);
      }
      const parity = checkNumberParity(content);
      if (!parity.ok) {
        problems.push(
          `${file}: number parity, only in es [${parity.onlyInEs}], only in en [${parity.onlyInEn}]`,
        );
      }
    }
    expect(problems).toEqual([]);
  });
});
