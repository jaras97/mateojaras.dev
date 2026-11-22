import { describe, expect, it } from "vitest";
import { ogContentType, ogSize, renderOgImage } from "./og";

describe("renderOgImage", () => {
  it("returns a 1200x630 png response", async () => {
    expect(ogSize).toEqual({ width: 1200, height: 630 });
    expect(ogContentType).toBe("image/png");
    const res = renderOgImage({
      label: "Case study",
      title: "ManuJ",
      date: "Nov 2026",
    });
    expect(res.headers.get("content-type")).toContain("image/png");
    const buf = await res.arrayBuffer();
    expect(buf.byteLength).toBeGreaterThan(1000);
  });
});
