import { describe, expect, it } from "vitest";
import { replyMailto } from "./mailto";

describe("replyMailto", () => {
  it("encodes the address and a Re: subject", () => {
    expect(replyMailto({ email: "a+b@x.dev", message: "Hola & más" })).toBe(
      "mailto:a%2Bb%40x.dev?subject=Re%3A%20Hola%20%26%20m%C3%A1s",
    );
  });

  it("uses the first line only and cuts it at 60 characters", () => {
    const href = replyMailto({
      email: "a@x.dev",
      message: `${"x".repeat(80)}\nsegunda línea`,
    });
    expect(href).toBe(`mailto:a%40x.dev?subject=Re%3A%20${"x".repeat(60)}`);
  });

  it("cannot inject extra headers through the address or the subject", () => {
    const href = replyMailto({
      email: "a@x.dev?bcc=evil@x.dev",
      message: "hi\r\nbcc: evil@x.dev",
    });
    expect(href).not.toMatch(/[?&]bcc=/);
    expect(href.split("?")).toHaveLength(2);
    expect(href).not.toContain("%0D");
  });
});
