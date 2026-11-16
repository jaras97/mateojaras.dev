import { beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.fn();
const redirect = vi.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});

vi.mock("@/lib/auth", () => ({ auth: { api: { getSession } } }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/navigation", () => ({ redirect }));

// Synthetic session shape: only the fields the guards read.
const session = { user: { id: "u1", name: "Admin", email: "a@example.com" } };

beforeEach(() => {
  vi.resetModules();
  getSession.mockReset();
  redirect.mockClear();
});

describe("requireSession", () => {
  it("redirects to /admin/login without a session", async () => {
    getSession.mockResolvedValue(null);
    const { requireSession } = await import("@/lib/dal");
    await expect(requireSession()).rejects.toThrow(
      "NEXT_REDIRECT:/admin/login",
    );
    expect(redirect).toHaveBeenCalledWith("/admin/login");
  });

  it("returns the user fields for a valid session", async () => {
    getSession.mockResolvedValue(session);
    const { requireSession } = await import("@/lib/dal");
    await expect(requireSession()).resolves.toEqual({
      userId: "u1",
      name: "Admin",
      email: "a@example.com",
    });
  });
});

describe("requireSessionForRequest", () => {
  it("returns a 401 JSON response without a session and never redirects", async () => {
    getSession.mockResolvedValue(null);
    const { requireSessionForRequest } = await import("@/lib/dal");
    const result = await requireSessionForRequest(
      new Request("http://x/api/blob/upload"),
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(401);
    expect(await result.response.json()).toEqual({ error: "unauthorized" });
    expect(redirect).not.toHaveBeenCalled();
  });

  it("returns the session when valid", async () => {
    getSession.mockResolvedValue(session);
    const { requireSessionForRequest } = await import("@/lib/dal");
    const result = await requireSessionForRequest(
      new Request("http://x/api/blob/upload"),
    );
    expect(result).toEqual({
      ok: true,
      session: { userId: "u1", name: "Admin", email: "a@example.com" },
    });
  });
});

describe("requireSession memoization", () => {
  it("is wrapped in React cache()", async () => {
    // React's cache() only dedupes inside a render; outside it every call runs.
    // Assert the wrapper identity instead of the call count.
    getSession.mockResolvedValue(session);
    const { requireSession } = await import("@/lib/dal");
    expect(typeof requireSession).toBe("function");
    const source = (await import("node:fs")).readFileSync(
      "src/lib/dal.ts",
      "utf8",
    );
    expect(source).toMatch(/requireSession = cache\(/);
  });
});
