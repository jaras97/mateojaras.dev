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
  const deps = {
    limiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
    ipHash: "hash",
    insert: vi.fn().mockResolvedValue({ id: "id-1" }),
    schedule: vi.fn(),
    log: vi.fn(),
    ...over,
  } satisfies ContactDeps;
  return deps;
}

let deps: ReturnType<typeof makeDeps>;
beforeEach(() => {
  deps = makeDeps();
});

describe("submitContactCore", () => {
  it("returns a validation error with field codes", async () => {
    const r = await submitContactCore("en", { ...input, name: "" }, deps);
    expect(r).toMatchObject({ ok: false, error: "validation" });
    expect(deps.insert).not.toHaveBeenCalled();
  });

  it("silently discards a filled honeypot", async () => {
    const r = await submitContactCore("en", { ...input, website: "bot" }, deps);
    expect(r).toEqual({ ok: true });
    expect(deps.insert).not.toHaveBeenCalled();
    expect(deps.limiter?.limit).not.toHaveBeenCalled();
  });

  it("silently discards a submission faster than 3 s", async () => {
    const r = await submitContactCore("en", { ...input, elapsedMs: 2999 }, deps);
    expect(r).toEqual({ ok: true });
    expect(deps.insert).not.toHaveBeenCalled();
  });

  it("fails closed without a limiter and names the env var", async () => {
    deps = makeDeps({ limiter: null });
    const r = await submitContactCore("en", input, deps);
    expect(r).toEqual({ ok: false, error: "unavailable" });
    expect(deps.insert).not.toHaveBeenCalled();
    expect(deps.log.mock.calls[0][0]).toContain("UPSTASH_REDIS_REST_URL");
  });

  it("treats reason timeout as unavailable", async () => {
    deps.limiter.limit.mockResolvedValue({ success: true, reason: "timeout" });
    const r = await submitContactCore("en", input, deps);
    expect(r).toEqual({ ok: false, error: "unavailable" });
    expect(deps.insert).not.toHaveBeenCalled();
  });

  it("returns rate_limited when the limiter refuses", async () => {
    deps.limiter.limit.mockResolvedValue({ success: false });
    const r = await submitContactCore("en", input, deps);
    expect(r).toEqual({ ok: false, error: "rate_limited" });
    expect(deps.insert).not.toHaveBeenCalled();
  });

  it("returns unavailable when the limiter throws", async () => {
    deps.limiter.limit.mockRejectedValue(new Error("down"));
    const r = await submitContactCore("en", input, deps);
    expect(r).toEqual({ ok: false, error: "unavailable" });
    expect(deps.insert).not.toHaveBeenCalled();
  });

  it("inserts once, schedules the notification and succeeds", async () => {
    const r = await submitContactCore("es", input, deps);
    expect(r).toEqual({ ok: true });
    expect(deps.insert).toHaveBeenCalledTimes(1);
    expect(deps.insert).toHaveBeenCalledWith({
      name: "Ana",
      email: "ana@example.com",
      message: input.message,
      locale: "es",
      ipHash: "hash",
    });
    expect(deps.schedule).toHaveBeenCalledWith("id-1", expect.objectContaining({ email: "ana@example.com" }));
  });

  it("returns unavailable and does not notify when the insert throws", async () => {
    deps.insert.mockRejectedValue(new Error("db"));
    const r = await submitContactCore("en", input, deps);
    expect(r).toEqual({ ok: false, error: "unavailable" });
    expect(deps.schedule).not.toHaveBeenCalled();
  });

  it("never logs visitor data", async () => {
    deps.insert.mockRejectedValue(new Error("db"));
    await submitContactCore("en", input, deps);
    const logged = JSON.stringify(deps.log.mock.calls);
    expect(logged).not.toContain("ana@example.com");
    expect(logged).not.toContain("Hola");
  });
});
