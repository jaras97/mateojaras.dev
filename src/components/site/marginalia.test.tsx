import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Marginalia } from "@/components/site/marginalia";

// Test inputs, not site content.
describe("Marginalia", () => {
  it("renders one note for one filled entry", () => {
    const html = renderToStaticMarkup(
      <Marginalia
        notes={[
          { label: "Trade-offs", body: "a" },
          { label: "Verified", body: "" },
          { label: "AI tools", body: "  " },
        ]}
      />,
    );
    expect(html).toContain("<aside");
    expect(html).toContain("Trade-offs");
    expect(html).not.toContain("Verified");
    expect(html).not.toContain("AI tools");
  });

  it("renders nothing when every note is empty", () => {
    expect(
      renderToStaticMarkup(<Marginalia notes={[{ label: "L", body: "" }]} />),
    ).toBe("");
    expect(renderToStaticMarkup(<Marginalia notes={[]} />)).toBe("");
  });
});
