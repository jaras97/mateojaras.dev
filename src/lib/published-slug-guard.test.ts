import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetForTests,
  isPublishedSlug,
  TIMEOUT_MS,
  TTL_MS,
} from "./published-slug-guard";

beforeEach(() => {
  __resetForTests();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

function deps(load: () => Promise<string[]>, now = () => Date.now()) {
  return { load, waitUntil: vi.fn(), now };
}

describe("isPublishedSlug", () => {
  it("cold memo, slug listed: true, one load, no background work", async () => {
    const d = deps(vi.fn().mockResolvedValue(["a", "b"]));
    expect(await isPublishedSlug("a", d)).toBe(true);
    expect(d.load).toHaveBeenCalledTimes(1);
    expect(d.waitUntil).not.toHaveBeenCalled();
    // memo filled: a second hit does not load again
    expect(await isPublishedSlug("b", d)).toBe(true);
    expect(d.load).toHaveBeenCalledTimes(1);
  });

  it("cold memo, slug unknown: false (deterministic 404), positives memoized", async () => {
    const d = deps(vi.fn().mockResolvedValue(["a"]));
    expect(await isPublishedSlug("nope", d)).toBe(false);
    expect(await isPublishedSlug("a", d)).toBe(true);
    expect(d.load).toHaveBeenCalledTimes(1);
  });

  it("cold memo, load rejects: fails open and stays cold", async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error("db down"))
      .mockResolvedValueOnce(["a"]);
    const d = deps(load);
    expect(await isPublishedSlug("x", d)).toBe(true);
    expect(await isPublishedSlug("x", d)).toBe(false);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("cold memo, load slower than the timeout: fails open, late result fills memo", async () => {
    let resolve!: (v: string[]) => void;
    const load = vi.fn(
      () =>
        new Promise<string[]>((r) => {
          resolve = r;
        }),
    );
    const d = deps(load);
    const p = isPublishedSlug("x", d);
    await vi.advanceTimersByTimeAsync(TIMEOUT_MS + 1);
    expect(await p).toBe(true);
    resolve(["x"]);
    await Promise.resolve();
    expect(await isPublishedSlug("x", d)).toBe(true);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("concurrent cold calls share one in-flight load", async () => {
    const load = vi.fn().mockResolvedValue(["a", "b"]);
    const d = deps(load);
    const [x, y] = await Promise.all([
      isPublishedSlug("a", d),
      isPublishedSlug("b", d),
    ]);
    expect([x, y]).toEqual([true, true]);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("warm hit, fresh: true without loading", async () => {
    const load = vi.fn().mockResolvedValue(["a"]);
    const d = deps(load);
    await isPublishedSlug("a", d);
    expect(await isPublishedSlug("a", d)).toBe(true);
    expect(load).toHaveBeenCalledTimes(1);
    expect(d.waitUntil).not.toHaveBeenCalled();
  });

  it("warm hit older than the TTL: true and one background refresh", async () => {
    let t = 0;
    const load = vi.fn().mockResolvedValue(["a"]);
    const d = deps(load, () => t);
    await isPublishedSlug("a", d);
    t = TTL_MS + 1;
    expect(await isPublishedSlug("a", d)).toBe(true);
    expect(d.waitUntil).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("warm miss, slug now published: true and memoized", async () => {
    const load = vi
      .fn()
      .mockResolvedValueOnce(["a"])
      .mockResolvedValueOnce(["a", "late"]);
    const d = deps(load);
    await isPublishedSlug("a", d);
    expect(await isPublishedSlug("late", d)).toBe(true);
    expect(await isPublishedSlug("late", d)).toBe(true);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("warm miss, still unknown: false, and never memoized as a negative", async () => {
    const load = vi.fn().mockResolvedValue(["a"]);
    const d = deps(load);
    await isPublishedSlug("a", d);
    expect(await isPublishedSlug("nope", d)).toBe(false);
    expect(await isPublishedSlug("nope", d)).toBe(false);
    expect(load).toHaveBeenCalledTimes(3);
  });

  it("warm miss, load rejects: fails open", async () => {
    const load = vi
      .fn()
      .mockResolvedValueOnce(["a"])
      .mockRejectedValueOnce(new Error("db down"));
    const d = deps(load);
    await isPublishedSlug("a", d);
    expect(await isPublishedSlug("nope", d)).toBe(true);
  });

  it("warm miss, load times out: fails open", async () => {
    const load = vi
      .fn()
      .mockResolvedValueOnce(["a"])
      .mockImplementationOnce(() => new Promise<string[]>(() => {}));
    const d = deps(load);
    await isPublishedSlug("a", d);
    const p = isPublishedSlug("nope", d);
    await vi.advanceTimersByTimeAsync(TIMEOUT_MS + 1);
    expect(await p).toBe(true);
  });
});
