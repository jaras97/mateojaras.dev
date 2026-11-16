import { beforeEach, describe, expect, it, vi } from "vitest";

// Fake db: `select()` pops the next queued result; writes are recorded.
const selects: unknown[][] = [];
const calls = {
  set: vi.fn(),
  batch: vi.fn(async () => []),
  update: vi.fn(),
  delete: vi.fn(),
};

function selectChain() {
  const rows = selects.shift() ?? [];
  const chain: Record<string, unknown> = {
    from: () => chain,
    where: () => chain,
    limit: () => chain,
    orderBy: () => chain,
    // biome-ignore lint/suspicious/noThenProperty: drizzle builders are awaitable
    then: (resolve: (value: unknown) => void) => resolve(rows),
  };
  return chain;
}

const fakeDb = {
  select: () => selectChain(),
  update: (...args: unknown[]) => {
    calls.update(...args);
    return {
      set: (value: unknown) => {
        calls.set(value);
        return { where: async () => ({ kind: "update" }) };
      },
    };
  },
  delete: (...args: unknown[]) => {
    calls.delete(...args);
    return { where: async () => ({ kind: "delete" }) };
  },
  batch: calls.batch,
};

const requireActionSession = vi.fn();
const updateTag = vi.fn();
const exportContent = vi.fn(async () => []);

vi.mock("@/db", () => ({ db: fakeDb }));
vi.mock("@/lib/dal", () => ({ requireActionSession }));
vi.mock("next/cache", () => ({ updateTag }));
vi.mock("next/server", () => ({ after: (fn: () => unknown) => fn() }));
vi.mock("@/lib/content-export", () => ({ exportContent }));

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";
const C = "33333333-3333-4333-8333-333333333333";
const session = { userId: "u1", name: "Admin", email: "a@example.com" };

beforeEach(() => {
  vi.resetModules();
  selects.length = 0;
  for (const fn of Object.values(calls)) fn.mockClear();
  updateTag.mockClear();
  exportContent.mockClear();
  requireActionSession.mockReset();
  requireActionSession.mockResolvedValue(session);
});

describe("every list action without a session", () => {
  it("returns error session and writes nothing", async () => {
    requireActionSession.mockResolvedValue(null);
    const actions = await import("./list-actions");
    const results = await Promise.all([
      actions.reorderProjects([A, B]),
      actions.setProjectVisible(A, false),
      actions.setProjectFeatured(A, true),
      actions.deleteProject(A, "Titulo"),
    ]);
    for (const result of results) {
      expect(result).toEqual({ ok: false, error: "session" });
    }
    expect(calls.update).not.toHaveBeenCalled();
    expect(calls.delete).not.toHaveBeenCalled();
    expect(calls.batch).not.toHaveBeenCalled();
    expect(updateTag).not.toHaveBeenCalled();
  });
});

describe("reorderProjects", () => {
  it("rejects an id list that is not exactly the set of existing ids", async () => {
    selects.push([{ id: A }, { id: B }, { id: C }]);
    const { reorderProjects } = await import("./list-actions");
    const result = await reorderProjects([A, B]);
    expect(result).toMatchObject({ ok: false, error: "validation" });
    expect(calls.batch).not.toHaveBeenCalled();
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("rejects duplicated ids even when the length matches", async () => {
    selects.push([{ id: A }, { id: B }]);
    const { reorderProjects } = await import("./list-actions");
    const result = await reorderProjects([A, A]);
    expect(result).toMatchObject({ ok: false, error: "validation" });
    expect(calls.batch).not.toHaveBeenCalled();
  });

  it("writes order = index for a full permutation in one batch and tags once", async () => {
    selects.push([{ id: A }, { id: B }, { id: C }]);
    const { reorderProjects } = await import("./list-actions");
    const result = await reorderProjects([C, A, B]);
    expect(result).toMatchObject({ ok: true });
    expect(calls.batch).toHaveBeenCalledTimes(1);
    expect(calls.set.mock.calls.map(([v]) => v)).toEqual([
      { order: 0 },
      { order: 1 },
      { order: 2 },
    ]);
    expect(updateTag).toHaveBeenCalledTimes(1);
    expect(updateTag).toHaveBeenCalledWith("projects");
  });
});

describe("setProjectVisible and setProjectFeatured", () => {
  it("setProjectVisible updates only visible and tags the list and the project", async () => {
    selects.push([{ slug: "mi-proyecto" }]);
    const { setProjectVisible } = await import("./list-actions");
    const result = await setProjectVisible(A, false);
    expect(result).toMatchObject({ ok: true });
    expect(calls.set).toHaveBeenCalledWith({ visible: false });
    expect(updateTag).toHaveBeenCalledWith("projects");
    expect(updateTag).toHaveBeenCalledWith("project:mi-proyecto");
  });

  it("setProjectFeatured updates only featured", async () => {
    selects.push([{ slug: "mi-proyecto" }]);
    const { setProjectFeatured } = await import("./list-actions");
    const result = await setProjectFeatured(A, true);
    expect(result).toMatchObject({ ok: true });
    expect(calls.set).toHaveBeenCalledWith({ featured: true });
    expect(updateTag).toHaveBeenCalledWith("projects");
  });

  it("returns not_found for an unknown project", async () => {
    selects.push([]);
    const { setProjectVisible } = await import("./list-actions");
    expect(await setProjectVisible(A, true)).toEqual({
      ok: false,
      error: "not_found",
    });
    expect(calls.update).not.toHaveBeenCalled();
  });
});

describe("deleteProject", () => {
  it("rejects a wrong confirmation name and deletes nothing", async () => {
    selects.push([
      { slug: "mi-proyecto", titleEs: "Titulo", status: "published" },
    ]);
    const { deleteProject } = await import("./list-actions");
    const result = await deleteProject(A, "wrong");
    expect(result).toMatchObject({ ok: false, error: "validation" });
    expect(calls.delete).not.toHaveBeenCalled();
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("deletes with the exact title (trimmed) and tags a published row", async () => {
    selects.push([
      { slug: "mi-proyecto", titleEs: "Titulo", status: "published" },
    ]);
    const { deleteProject } = await import("./list-actions");
    const result = await deleteProject(A, "  Titulo ");
    expect(result).toMatchObject({ ok: true });
    expect(calls.delete).toHaveBeenCalledTimes(1);
    expect(updateTag).toHaveBeenCalledWith("projects");
    expect(updateTag).toHaveBeenCalledWith("project:mi-proyecto");
  });

  it("does not tag when the deleted row was a draft", async () => {
    selects.push([{ slug: "borrador", titleEs: "Titulo", status: "draft" }]);
    const { deleteProject } = await import("./list-actions");
    const result = await deleteProject(A, "Titulo");
    expect(result).toMatchObject({ ok: true });
    expect(calls.delete).toHaveBeenCalledTimes(1);
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("is case sensitive", async () => {
    selects.push([{ slug: "p", titleEs: "Titulo", status: "draft" }]);
    const { deleteProject } = await import("./list-actions");
    const result = await deleteProject(A, "titulo");
    expect(result).toMatchObject({ ok: false, error: "validation" });
  });
});
