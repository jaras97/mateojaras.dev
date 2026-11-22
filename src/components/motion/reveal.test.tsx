import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Reveal } from "@/components/motion/reveal";

describe("Reveal", () => {
  it("renders a div with the reveal class and its stagger index", () => {
    const html = renderToStaticMarkup(<Reveal index={2}>x</Reveal>);
    expect(html).toContain('class="reveal"');
    expect(html).toContain("--reveal-index:2");
    expect(html.startsWith("<div")).toBe(true);
  });

  it("caps the stagger at index 5", () => {
    const html = renderToStaticMarkup(<Reveal index={9}>x</Reveal>);
    expect(html).toContain("--reveal-index:5");
  });

  it("renders the element given by as", () => {
    const html = renderToStaticMarkup(
      <Reveal index={0} as="section" className="k">
        x
      </Reveal>,
    );
    expect(html.startsWith("<section")).toBe(true);
    expect(html).toContain("reveal k");
  });
});
