import { describe, expect, it } from "vitest";
import { adjacentProjects } from "./adjacent";

// Test inputs, not site content.
const a = { slug: "a" };
const b = { slug: "b" };
const c = { slug: "c" };

describe("adjacentProjects", () => {
  it("has no previous at the start and does not wrap", () => {
    expect(adjacentProjects([a, b, c], "a")).toEqual({ prev: null, next: b });
  });
  it("has both neighbours in the middle", () => {
    expect(adjacentProjects([a, b, c], "b")).toEqual({ prev: a, next: c });
  });
  it("has no next at the end and does not wrap", () => {
    expect(adjacentProjects([a, b, c], "c")).toEqual({ prev: b, next: null });
  });
  it("has neither with a single project", () => {
    expect(adjacentProjects([a], "a")).toEqual({ prev: null, next: null });
  });
  it("has neither for an unknown slug", () => {
    expect(adjacentProjects([a, b], "zzz")).toEqual({
      prev: null,
      next: null,
    });
  });
});
