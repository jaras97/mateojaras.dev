import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FooterLine } from "./footer-line";

const labels = { cv: "CV", source: "Src", github: "GH", linkedin: "LI" };
const base = { name: "N", location: "L" };
const seps = (html: string) => html.split('aria-hidden="true"').length - 1;

describe("FooterLine", () => {
  it("omits unset GitHub and LinkedIn with their separators", () => {
    const html = renderToStaticMarkup(
      <FooterLine
        settings={{ ...base, githubUrl: null, linkedinUrl: null }}
        locale="es"
        labels={labels}
      />,
    );
    expect(seps(html)).toBe(3);
    expect(html).not.toContain("GH");
    expect(html).toContain('href="/cv/es.pdf"');
  });

  it("renders all six segments when set", () => {
    const html = renderToStaticMarkup(
      <FooterLine
        settings={{
          ...base,
          githubUrl: "https://github.com/x",
          linkedinUrl: "https://linkedin.com/in/x",
        }}
        locale="en"
        labels={labels}
      />,
    );
    expect(seps(html)).toBe(5);
    expect(html).toContain('href="/cv/en.pdf"');
    expect(html).toContain("https://github.com/jaras97/mateojaras.dev");
  });

  it("gives every footer link a 24px minimum target height (K-29)", () => {
    const html = renderToStaticMarkup(
      <FooterLine
        settings={{
          ...base,
          githubUrl: "https://github.com/x",
          linkedinUrl: "https://linkedin.com/in/x",
        }}
        locale="en"
        labels={labels}
      />,
    );
    const links = html.match(/<a [^>]*>/g) ?? [];
    expect(links).toHaveLength(4);
    for (const link of links) expect(link).toContain("py-[3px]");
  });
});
