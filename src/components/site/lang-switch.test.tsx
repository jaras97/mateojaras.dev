import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  segments: ["about"] as string[],
  params: {} as Record<string, string>,
}));
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  useParams: () => state.params,
  useSelectedLayoutSegments: () => state.segments,
}));

import { LangSwitch } from "./lang-switch";

describe("LangSwitch", () => {
  it("in en marks EN current and links to the localized Spanish page", () => {
    state.segments = ["about"];
    const html = renderToStaticMarkup(
      <LangSwitch locale="en" toOther="Ver esta página en español" />,
    );
    expect(html).toContain('aria-current="true"');
    expect(html).toContain('href="/es/sobre-mi"');
    expect(html).toContain('hrefLang="es"');
    expect(html).toContain('lang="es"');
  });

  it("in es links to the unprefixed English page", () => {
    state.segments = ["about"];
    const html = renderToStaticMarkup(
      <LangSwitch locale="es" toOther="View this page in English" />,
    );
    expect(html).toContain('href="/about"');
    expect(html).not.toContain("/en/");
  });

  it("keeps the slug on case studies", () => {
    state.segments = ["projects", "demo"];
    state.params = { slug: "demo" };
    const html = renderToStaticMarkup(<LangSwitch locale="en" toOther="x" />);
    expect(html).toContain('href="/es/proyectos/demo"');
  });
});
