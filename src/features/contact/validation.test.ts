import { describe, expect, it } from "vitest";
import { contactSchema } from "./validation";

const valid = {
  name: "Ana",
  email: "ana@example.com",
  message: "Hola, quiero hablar de un proyecto.",
  locale: "es",
};

function codes(input: unknown) {
  const r = contactSchema.safeParse(input);
  return r.success ? [] : r.error.issues.map((i) => i.message);
}

describe("contactSchema", () => {
  it("accepts a valid message and applies defaults", () => {
    const r = contactSchema.parse(valid);
    expect(r.website).toBe("");
    expect(r.elapsedMs).toBe(0);
  });

  it("reports nameRequired for an empty name", () => {
    expect(codes({ ...valid, name: "" })).toContain("nameRequired");
  });

  it("reports emailInvalid for a malformed email", () => {
    expect(codes({ ...valid, email: "x" })).toContain("emailInvalid");
  });

  it("reports messageShort and messageLong at the bounds", () => {
    expect(codes({ ...valid, message: "123456789" })).toContain("messageShort");
    expect(codes({ ...valid, message: "a".repeat(5001) })).toContain(
      "messageLong",
    );
  });

  it("trims the name and coerces elapsedMs", () => {
    const r = contactSchema.parse({ ...valid, name: "  Ana ", elapsedMs: "4000" });
    expect(r.name).toBe("Ana");
    expect(r.elapsedMs).toBe(4000);
  });

  it("rejects an unknown locale and unknown keys", () => {
    expect(contactSchema.safeParse({ ...valid, locale: "fr" }).success).toBe(
      false,
    );
    expect(contactSchema.safeParse({ ...valid, admin: true }).success).toBe(
      false,
    );
  });
});
