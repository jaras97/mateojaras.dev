import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ path: "/foo" }));
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  usePathname: () => state.path,
}));

import { RequestedPath } from "./requested-path";

describe("RequestedPath", () => {
  it("renders the decoded pathname", () => {
    state.path = "/es/proyectos/caf%C3%A9";
    expect(renderToStaticMarkup(<RequestedPath />)).toContain(
      "/es/proyectos/café",
    );
  });

  it("falls back to the raw pathname on a malformed escape", () => {
    state.path = "/%E0%A4%A";
    expect(renderToStaticMarkup(<RequestedPath />)).toContain("/%E0%A4%A");
  });

  it("renders markup-like input as text, never as markup", () => {
    state.path = "/<script>alert(1)</script>";
    const html = renderToStaticMarkup(<RequestedPath />);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
