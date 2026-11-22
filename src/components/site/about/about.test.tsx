import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EducationList } from "@/components/site/about/education-list";
import { ExperienceList } from "@/components/site/about/experience-list";
import { LanguageList } from "@/components/site/about/language-list";
import { NowSection } from "@/components/site/about/now-section";
import { StackList } from "@/components/site/about/stack-list";

// Test inputs, not site content.
const categoryLabels = {
  frontend: "Frontend",
  state: "State",
  testing: "Testing",
  backend: "Backend",
  ai: "AI",
  tools: "Tools",
};
const years = (n: number) => `${n} years`;

describe("StackList", () => {
  const skills = [
    { id: "1", name: "Tool B", category: "tools", yearsUsed: 3 },
    { id: "2", name: "Lib A", category: "frontend", yearsUsed: 5 },
    { id: "3", name: "Lib C", category: "frontend", yearsUsed: null },
  ] as const;

  it("groups by category in enum order and omits empty categories", () => {
    const html = renderToStaticMarkup(
      <StackList
        skills={[...skills]}
        categoryLabels={categoryLabels}
        years={years}
      />,
    );
    expect(html.indexOf("Frontend")).toBeLessThan(html.indexOf("Tools"));
    expect(html).not.toContain("Backend");
    expect(html).toContain("5 years");
  });

  it("shows only the name when years are null and never a level bar", () => {
    const html = renderToStaticMarkup(
      <StackList
        skills={[...skills]}
        categoryLabels={categoryLabels}
        years={years}
      />,
    );
    expect(html).toContain("Lib C");
    expect(html.match(/years/g)).toHaveLength(2);
    expect(html).not.toContain("progressbar");
    expect(html).not.toContain("width:");
  });

  it("renders nothing without skills", () => {
    expect(
      renderToStaticMarkup(
        <StackList skills={[]} categoryLabels={categoryLabels} years={years} />,
      ),
    ).toBe("");
  });
});

describe("ExperienceList", () => {
  const labels = {
    present: "Present",
    type: { employment: "Employment", freelance: "Freelance" },
  };
  const row = {
    id: "e1",
    company: "Acme Test",
    role: "Test role",
    type: "employment" as const,
    location: "Testville",
    startDate: "2021-08-02",
    endDate: "2025-08-30",
    bullets: ["Did a thing"],
  };

  it("renders period, type, location and bullets", () => {
    const html = renderToStaticMarkup(
      <ExperienceList rows={[row]} locale="en" labels={labels} />,
    );
    expect(html).toContain("Aug 2021 – Aug 2025");
    expect(html).toContain("Employment");
    expect(html).toContain("Testville");
    expect(html).toContain("Did a thing");
  });

  it("uses the present label for an open period and omits an empty list", () => {
    const html = renderToStaticMarkup(
      <ExperienceList
        rows={[{ ...row, endDate: null, bullets: [] }]}
        locale="en"
        labels={labels}
      />,
    );
    expect(html).toContain("Aug 2021 – Present");
    expect(html).not.toContain("<ul");
  });

  it("renders nothing without rows", () => {
    expect(
      renderToStaticMarkup(
        <ExperienceList rows={[]} locale="en" labels={labels} />,
      ),
    ).toBe("");
  });
});

describe("EducationList", () => {
  it("renders institution, program and status", () => {
    const html = renderToStaticMarkup(
      <EducationList
        locale="en"
        presentLabel="Present"
        rows={[
          {
            id: "d1",
            institution: "Test Institute",
            program: "Test program",
            startDate: "2016-01-01",
            endDate: null,
            status: "In progress",
          },
        ]}
      />,
    );
    expect(html).toContain("Test Institute");
    expect(html).toContain("Test program");
    expect(html).toContain("In progress");
    expect(html).toContain("Jan 2016 – Present");
  });
});

describe("LanguageList", () => {
  const levels = { native: "Native", B2: "B2" };
  it("names the language in the page locale, capitalized, with its level", () => {
    const en = renderToStaticMarkup(
      <LanguageList
        locale="en"
        languages={[
          { code: "es", level: "native" },
          { code: "en", level: "B2" },
        ]}
        levels={levels}
      />,
    );
    expect(en).toContain("Spanish");
    expect(en).toContain("Native");
    const es = renderToStaticMarkup(
      <LanguageList
        locale="es"
        languages={[{ code: "es", level: "native" }]}
        levels={levels}
      />,
    );
    expect(es).toContain("Español");
  });

  it("renders nothing without languages", () => {
    expect(
      renderToStaticMarkup(
        <LanguageList locale="en" languages={[]} levels={levels} />,
      ),
    ).toBe("");
  });
});

describe("NowSection", () => {
  const doc = {
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: "Testing now" }] },
    ],
  };
  it("renders the dated body in the given timezone", () => {
    const html = renderToStaticMarkup(
      <NowSection
        doc={doc}
        updatedAt={new Date("2026-11-23T02:00:00Z")}
        timeZone="America/Bogota"
        locale="en"
        updatedLabel={(d) => `Updated ${d}`}
      />,
    );
    expect(html).toContain("Testing now");
    expect(html).toContain("Updated 22 Nov 2026");
  });

  it("renders nothing for an empty doc", () => {
    expect(
      renderToStaticMarkup(
        <NowSection
          doc={{ type: "doc", content: [] }}
          updatedAt={new Date("2026-11-23T02:00:00Z")}
          timeZone="America/Bogota"
          locale="en"
          updatedLabel={(d) => d}
        />,
      ),
    ).toBe("");
  });
});
