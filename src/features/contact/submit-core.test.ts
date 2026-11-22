import { beforeEach, describe, expect, it, vi } from "vitest";
import { type ContactDeps, submitContactCore } from "./submit-core";

const input = {
  name: "Ana",
  email: "ana@example.com",
  message: "Hola, quiero hablar de un proyecto.",
  website: "",
  elapsedMs: 4000,
};

function makeDeps(over: Partial<ContactDeps> = {}) {
  const limit = vi.fn().mockResolvedValue({ success: true });
  const insert = vi.fn().mockResolvedValue({ id: "id-1" });
  const schedule = vi.fn();
  const log = vi.fn();
  const deps: ContactDeps = {
    limiter: { limit },
    ipHash: "hash",
    insert,
    schedule,
    log,
    ...over,
  };
  return { deps, limit, insert, schedule, log };
}

let m: ReturnType<typeof makeDeps>;
beforeEach(() => {
  m = makeDeps();
});

describe("submitContactCore", () => {
  it("returns a validation error with field codes", async () => {
    const r = await submitContactCore("en", { ...input, name: "" }, m.deps);
    expect(r).toMatchObject({ ok: false, error: "validation" });
    expect(m.insert).not.toHaveBeenCalled();
  });

  it("silently discards a filled honeypot", async () => {
    const r = await submitContactCore(
      "en",
      { ...input, website: "bot" },
      m.deps,
    );
    expect(r).toEqual({ ok: true });
    expect(m.insert).not.toHaveBeenCalled();
    expect(m.limit).not.toHaveBeenCalled();
  });

  it("silently discards a submission faster than 3 s", async () => {
    const r = await submitContactCore(
      "en",
      { ...input, elapsedMs: 2999 },
      m.deps,
    );
    expect(r).toEqual({ ok: true });
    expect(m.insert).not.toHaveBeenCalled();
  });

  it("fails closed without a limiter and names the env var", async () => {
    m = makeDeps({ limiter: null });
    const r = await submitContactCore("en", input, m.deps);
    expect(r).toEqual({ ok: false, error: "unavailable" });
    expect(m.insert).not.toHaveBeenCalled();
    expect(m.log.mock.calls[0][0]).toContain("UPSTASH_REDIS_REST_URL");
  });

  it("treats reason timeout as unavailable", async () => {
    m.limit.mockResolvedValue({ success: true, reason: "timeout" });
    const r = await submitContactCore("en", input, m.deps);
    expect(r).toEqual({ ok: false, error: "unavailable" });
    expect(m.insert).not.toHaveBeenCalled();
  });

  it("returns rate_limited when the limiter refuses", async () => {
    m.limit.mockResolvedValue({ success: false });
    const r = await submitContactCore("en", input, m.deps);
    expect(r).toEqual({ ok: false, error: "rate_limited" });
    expect(m.insert).not.toHaveBeenCalled();
  });

  it("returns unavailable when the limiter throws", async () => {
    m.limit.mockRejectedValue(new Error("down"));
    const r = await submitContactCore("en", input, m.deps);
    expect(r).toEqual({ ok: false, error: "unavailable" });
    expect(m.insert).not.toHaveBeenCalled();
  });

  it("inserts once, schedules the notification and succeeds", async () => {
    const r = await submitContactCore("es", input, m.deps);
    expect(r).toEqual({ ok: true });
    expect(m.insert).toHaveBeenCalledTimes(1);
    expect(m.insert).toHaveBeenCalledWith({
      name: "Ana",
      email: "ana@example.com",
      message: input.message,
      locale: "es",
      ipHash: "hash",
    });
    expect(m.schedule).toHaveBeenCalledWith(
      "id-1",
      expect.objectContaining({ email: "ana@example.com" }),
    );
  });

  it("returns unavailable and does not notify when the insert throws", async () => {
    m.insert.mockRejectedValue(new Error("db"));
    const r = await submitContactCore("en", input, m.deps);
    expect(r).toEqual({ ok: false, error: "unavailable" });
    expect(m.schedule).not.toHaveBeenCalled();
  });

  it("never logs visitor data", async () => {
    m.insert.mockRejectedValue(new Error("db"));
    await submitContactCore("en", input, m.deps);
    const logged = JSON.stringify(m.log.mock.calls);
    expect(logged).not.toContain("ana@example.com");
    expect(logged).not.toContain("Hola");
  });
});
