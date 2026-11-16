import { beforeEach, describe, expect, it, vi } from "vitest";

const calls = {
  set: vi.fn(),
  where: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const fakeDb = {
  update: (...args: unknown[]) => {
    calls.update(...args);
    return {
      set: (value: unknown) => {
        calls.set(value);
        return {
          where: async (cond: unknown) => {
            calls.where(cond);
            return [];
          },
        };
      },
    };
  },
  delete: (...args: unknown[]) => {
    calls.delete(...args);
    return {
      where: async (cond: unknown) => {
        calls.where(cond);
        return [];
      },
    };
  },
};

const requireActionSession = vi.fn();
const updateTag = vi.fn();
const exportContent = vi.fn();

vi.mock("@/db", () => ({ db: fakeDb }));
vi.mock("@/lib/dal", () => ({ requireActionSession }));
vi.mock("next/cache", () => ({ updateTag }));
vi.mock("@/lib/content-export", () => ({ exportContent }));

const ID = "11111111-1111-4111-8111-111111111111";
const session = { userId: "u1", name: "Admin", email: "a@example.com" };

beforeEach(() => {
  vi.resetModules();
  for (const fn of Object.values(calls)) fn.mockClear();
  updateTag.mockClear();
  exportContent.mockClear();
  requireActionSession.mockReset();
  requireActionSession.mockResolvedValue(session);
});

describe("contact actions without a session", () => {
  it("return error session and touch nothing", async () => {
    requireActionSession.mockResolvedValue(null);
    const actions = await import("./actions");
    const results = await Promise.all([
      actions.markMessageRead(ID),
      actions.markMessageUnread(ID),
      actions.deleteMessage(ID),
    ]);
    for (const result of results) {
      expect(result).toEqual({ ok: false, error: "session" });
    }
    expect(calls.update).not.toHaveBeenCalled();
    expect(calls.delete).not.toHaveBeenCalled();
  });
});

describe("contact actions", () => {
  it("reject ids that are not uuids", async () => {
    const actions = await import("./actions");
    expect(await actions.markMessageRead("nope")).toMatchObject({
      ok: false,
      error: "validation",
    });
    expect(await actions.deleteMessage("nope")).toMatchObject({
      ok: false,
      error: "validation",
    });
    expect(calls.update).not.toHaveBeenCalled();
    expect(calls.delete).not.toHaveBeenCalled();
  });

  it("markMessageRead sets readAt to a date, only where it is null", async () => {
    const actions = await import("./actions");
    const result = await actions.markMessageRead(ID);
    expect(result).toMatchObject({ ok: true });
    expect(calls.set).toHaveBeenCalledTimes(1);
    expect(calls.set.mock.calls[0][0].readAt).toBeInstanceOf(Date);
    expect(calls.where).toHaveBeenCalledTimes(1);
  });

  it("markMessageUnread sets readAt to null", async () => {
    const actions = await import("./actions");
    expect(await actions.markMessageUnread(ID)).toMatchObject({ ok: true });
    expect(calls.set).toHaveBeenCalledWith({ readAt: null });
  });

  it("deleteMessage deletes one row and never exports or tags", async () => {
    const actions = await import("./actions");
    expect(await actions.deleteMessage(ID)).toMatchObject({ ok: true });
    expect(calls.delete).toHaveBeenCalledTimes(1);
    expect(calls.where).toHaveBeenCalledTimes(1);
    expect(updateTag).not.toHaveBeenCalled();
    expect(exportContent).not.toHaveBeenCalled();
  });
});
