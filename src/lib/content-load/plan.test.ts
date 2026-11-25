import { describe, expect, it } from "vitest";
import { naturalKey } from "./plan";

describe("naturalKey", () => {
  it("joins institution and programEn for education", () => {
    expect(
      naturalKey("education", { institution: "Udemy", programEn: "FastAPI" }),
    ).toBe("Udemy|FastAPI");
  });

  it("joins company, type and startDate for experiences", () => {
    expect(
      naturalKey("experiences", {
        company: "Freelance",
        type: "freelance",
        startDate: "2025-09-01",
      }),
    ).toBe("Freelance|freelance|2025-09-01");
  });

  it("uses the slug for projects and the name for skills", () => {
    expect(naturalKey("projects", { slug: "prendo" })).toBe("prendo");
    expect(naturalKey("skills", { name: "React" })).toBe("React");
  });
});
