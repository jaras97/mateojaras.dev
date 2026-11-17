import { describe, expect, it } from "vitest";
import { formFieldName, toDraftInput, toFormValues } from "./form-model";
import type { ExperienceDraftInput } from "./validation";

const draft: ExperienceDraftInput = {
  company: "Empresa",
  roleEn: "Engineer",
  roleEs: "Ingeniero",
  type: "employment",
  location: null,
  startDate: "2021-08-01",
  endDate: null,
  bulletsEn: ["one"],
  bulletsEs: ["uno", "dos"],
  skillIds: [],
  projectIds: [],
};

describe("experience form model", () => {
  it("pairs bullets by index and pads the shorter locale", () => {
    const values = toFormValues(draft);
    expect(values.bullets).toEqual([
      { es: "uno", en: "one" },
      { es: "dos", en: "" },
    ]);
    expect(values.current).toBe(true);
  });

  it("clears the end date when the position is current", () => {
    const values = { ...toFormValues(draft), endDate: "2025-08-01" };
    expect(toDraftInput({ ...values, current: true }).endDate).toBe("");
    expect(toDraftInput({ ...values, current: false }).endDate).toBe(
      "2025-08-01",
    );
  });

  it("maps bullet issue paths to form field names", () => {
    expect(formFieldName(["bulletsEs", 1])).toBe("bullets.1.es");
    expect(formFieldName(["bulletsEn", 0])).toBe("bullets.0.en");
    expect(formFieldName(["company"])).toBe("company");
  });
});
