import { beforeEach, describe, expect, it, vi } from "vitest";

const signOut = vi.fn();
const requireSession = vi.fn();
const redirect = vi.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});

vi.mock("@/lib/auth", () => ({ auth: { api: { signOut } } }));
vi.mock("@/lib/dal", () => ({ requireSession }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/navigation", () => ({ redirect }));

beforeEach(() => {
  vi.resetModules();
  signOut.mockReset();
  requireSession.mockReset();
  redirect.mockClear();
});

describe("signOutAction", () => {
  it("redirects without a session and never calls signOut", async () => {
    requireSession.mockImplementation(async () => redirect("/admin/login"));
    const { signOutAction } = await import("./actions");
    await expect(signOutAction()).rejects.toThrow("NEXT_REDIRECT:/admin/login");
    expect(signOut).not.toHaveBeenCalled();
  });

  it("signs out then redirects to the login with a session", async () => {
    requireSession.mockResolvedValue({
      userId: "u1",
      name: "Admin",
      email: "a@example.com",
    });
    signOut.mockResolvedValue({ success: true });
    const { signOutAction } = await import("./actions");
    await expect(signOutAction()).rejects.toThrow("NEXT_REDIRECT:/admin/login");
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
