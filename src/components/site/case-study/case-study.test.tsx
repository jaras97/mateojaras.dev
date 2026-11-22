import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CaseGallery } from "@/components/site/case-study/case-gallery";
import { CaseHeader } from "@/components/site/case-study/case-header";
import { CaseMetrics } from "@/components/site/case-study/case-metrics";
import { CaseSections } from "@/components/site/case-study/case-sections";
import { PlainText } from "@/components/site/case-study/plain-text";

// Test inputs, not site content.
const sectionLabels = {
  problem: "Problem",
  role: "Role",
  solution: "Solution",
  results: "Results",
  decisions: "Decisions",
};

const baseProject = {
  problemEn: "Test problem",
  problemEs: "Problema de prueba",
  roleEn: "Test role",
  roleEs: "Rol de prueba",
  solutionEn: "Test solution",
  solutionEs: "Solución de prueba",
  caseStudyEn: null,
  caseStudyEs: null,
  resultsEn: [] as string[],
  resultsEs: [] as string[],
  techDecisionsEn: {
    decisions: [{ title: "Decision one", body: "Because." }],
  },
  techDecisionsEs: null,
};

describe("CaseMetrics", () => {
  it("renders nothing for no metrics", () => {
    expect(
      renderToStaticMarkup(<CaseMetrics metrics={[]} label="Key figures" />),
    ).toBe("");
  });

  it("renders dt before dd for each metric", () => {
    const html = renderToStaticMarkup(
      <CaseMetrics
        label="Key figures"
        metrics={[
          { label: "L1", value: "V1" },
          { label: "L2", value: "V2" },
        ]}
      />,
    );
    expect(html.match(/<dt/g)).toHaveLength(2);
    expect(html.match(/<dd/g)).toHaveLength(2);
    expect(html.indexOf("<dt")).toBeLessThan(html.indexOf("<dd"));
    expect(html).toContain("flex-col-reverse");
  });

  it("keeps only the first three", () => {
    const metrics = [1, 2, 3, 4].map((n) => ({
      label: `L${n}`,
      value: `V${n}`,
    }));
    const html = renderToStaticMarkup(
      <CaseMetrics label="Key figures" metrics={metrics} />,
    );
    expect(html.match(/<dt/g)).toHaveLength(3);
  });
});

describe("CaseSections", () => {
  it("skips Results and keeps the numbers fixed", () => {
    const html = renderToStaticMarkup(
      <CaseSections
        project={baseProject}
        locale="en"
        slug="demo"
        labels={sectionLabels}
      />,
    );
    for (const n of ["01", "02", "03", "05"]) expect(html).toContain(n);
    expect(html).not.toContain("04");
    expect(html).toContain('id="demo-problem"');
    expect(html).toContain('id="demo-role"');
    expect(html).toContain('id="demo-solution"');
    expect(html).toContain('id="demo-decisions"');
    expect(html).not.toContain('id="demo-results"');
  });

  it("renders results as a list when present", () => {
    const html = renderToStaticMarkup(
      <CaseSections
        project={{ ...baseProject, resultsEn: ["Test result"] }}
        locale="en"
        slug="demo"
        labels={sectionLabels}
      />,
    );
    expect(html).toContain('id="demo-results"');
    expect(html).toContain("<li>Test result</li>");
  });
});

describe("PlainText", () => {
  it("renders paragraphs and lists", () => {
    const html = renderToStaticMarkup(
      <PlainText text={"First\n\n- one\n- two"} />,
    );
    expect(html).toContain("<p");
    expect(html.match(/<li/g)).toHaveLength(2);
  });
  it("renders nothing for an empty string", () => {
    expect(renderToStaticMarkup(<PlainText text="" />)).toBe("");
  });
});

describe("CaseHeader period", () => {
  const props = {
    title: "Test title",
    tagline: "Test tagline",
    locale: "en" as const,
    stack: [] as string[],
    liveUrl: "https://example.com/app",
    repoUrl: null,
    backHref: "/#work",
    contactHref: "/contact",
    labels: {
      backHome: "All projects",
      present: "present",
      source: "Source code",
      internalTool: "Internal tool, sample data",
      demoText: "Demo text",
      demoLink: "Ask for a demo",
    },
  };
  it("prints both dates", () => {
    const html = renderToStaticMarkup(
      <CaseHeader {...props} startedAt="2025-09-01" finishedAt="2025-11-01" />,
    );
    expect(html).toContain("Sep 2025 – Nov 2025");
  });
  it("prints present without an end date", () => {
    const html = renderToStaticMarkup(
      <CaseHeader {...props} startedAt="2025-09-01" finishedAt={null} />,
    );
    expect(html).toContain("Sep 2025 – present");
  });
  it("omits the period without a start date", () => {
    const html = renderToStaticMarkup(
      <CaseHeader {...props} startedAt={null} finishedAt={null} />,
    );
    expect(html).not.toContain("present");
  });
  it("shows the live hostname and the source link", () => {
    const html = renderToStaticMarkup(
      <CaseHeader
        {...props}
        startedAt={null}
        finishedAt={null}
        repoUrl="https://github.com/x/y"
      />,
    );
    expect(html).toContain("example.com");
    expect(html).toContain("Source code");
  });
  it("shows the internal-tool label and demo link without liveUrl", () => {
    for (const liveUrl of [null, ""]) {
      const html = renderToStaticMarkup(
        <CaseHeader
          {...props}
          liveUrl={liveUrl}
          startedAt={null}
          finishedAt={null}
          stack={["React", "Next.js"]}
        />,
      );
      expect(html).toContain("Internal tool, sample data");
      expect(html).toContain('href="/contact"');
      expect(html).toContain("React · Next.js");
    }
  });
});

describe("CaseGallery", () => {
  const labels = { figure: "{n} / {total}" };
  const item = (url: string, extra = {}) => ({
    url,
    altEn: `alt ${url}`,
    altEs: `alt es ${url}`,
    type: "image" as const,
    ...extra,
  });
  const render = (media: ReturnType<typeof item>[], cover = "c") =>
    renderToStaticMarkup(
      <CaseGallery media={media} cover={cover} locale="en" labels={labels} />,
    );

  it("renders nothing with only the cover", () => {
    expect(render([item("c")])).toBe("");
    expect(render([])).toBe("");
  });

  it("captions with text and date, text alone, date alone or the counter", () => {
    const html = render([
      item("c"),
      item("https://x.dev/1.png", {
        captionEn: "Home",
        captionEs: "Inicio",
        capturedAt: "2026-03",
      }),
      item("https://x.dev/2.png", { captionEn: "Only text" }),
      item("https://x.dev/3.png", { capturedAt: "2026-03-15" }),
      item("https://x.dev/4.png"),
    ]);
    expect(html).toContain("Home");
    expect(html).toContain("Mar 2026");
    expect(html).toContain("Only text");
    expect(html).toContain("04 / 04");
    expect(html).not.toContain("alt https://x.dev/c");
  });

  it("renders video with controls and an aria-label", () => {
    const html = render([
      item("c"),
      item("https://x.dev/v.mp4", { type: "video" }),
    ]);
    expect(html).toContain("<video");
    expect(html).toContain("controls");
    expect(html).toContain('preload="none"');
    expect(html).toContain('aria-label="alt https://x.dev/v.mp4"');
  });
});
