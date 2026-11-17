import { beforeEach, describe, expect, it, vi } from "vitest";

// Fake db: `select()` pops the next queued result; writes are recorded.
const selects: unknown[][] = [];
const calls = {
  set: vi.fn(),
  values: vi.fn(),
  batch: vi.fn(async () => []),
  insert: vi.fn(),
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
        return { where: () => ({ kind: "update" }) };
      },
    };
  },
  insert: (...args: unknown[]) => {
    calls.insert(...args);
    return {
      values: (value: unknown) => {
        calls.values(value);
        return { returning: async () => [{ id: "new-id" }], kind: "insert" };
      },
    };
  },
  delete: (...args: unknown[]) => {
    calls.delete(...args);
    return { where: () => ({ kind: "delete" }) };
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

const input = {
  name: "Skill temporal",
  category: "tools",
  icon: null,
  yearsUsed: 2,
  featured: false,
};

beforeEach(() => {
  vi.resetModules();
  selects.length = 0;
  for (const fn of Object.values(calls)) fn.mockClear();
  updateTag.mockClear();
  exportContent.mockClear();
  requireActionSession.mockReset();
  requireActionSession.mockResolvedValue(session);
});

describe("every skill action without a session", () => {
  it("returns error session and writes nothing", async () => {
    requireActionSession.mockResolvedValue(null);
    const actions = await import("./actions");
    const results = await Promise.all([
      actions.createSkill({}),
      actions.saveSkillDraft(A, input),
      actions.publishSkill(A, input),
      actions.discardSkillDraft(A),
      actions.reorderSkills("tools", [A, B]),
      actions.setSkillVisible(A, false),
      actions.setSkillFeatured(A, true),
      actions.deleteSkill(A, "Skill temporal"),
    ]);
    expect(results).toHaveLength(8);
    for (const result of results) {
      expect(result).toEqual({ ok: false, error: "session" });
    }
    expect(calls.update).not.toHaveBeenCalled();
    expect(calls.insert).not.toHaveBeenCalled();
    expect(calls.delete).not.toHaveBeenCalled();
    expect(calls.batch).not.toHaveBeenCalled();
    expect(updateTag).not.toHaveBeenCalled();
  });
});

describe("createSkill", () => {
  it("refuses an existing name as a conflict on the name field", async () => {
    selects.push([{ id: B }]);
    const { createSkill } = await import("./actions");
    const result = await createSkill({ name: "React", category: "frontend" });
    expect(result).toMatchObject({ ok: false, error: "conflict" });
    expect(result.ok === false && result.fieldErrors?.name).toBeTruthy();
    expect(calls.insert).not.toHaveBeenCalled();
  });

  it("creates a draft at the end of its category without a public tag", async () => {
    selects.push([], [{ value: 3 }]);
    const { createSkill } = await import("./actions");
    const result = await createSkill({ name: "Nueva", category: "tools" });
    expect(result).toMatchObject({ ok: true, id: "new-id" });
    expect(calls.values).toHaveBeenCalledWith(
      expect.objectContaining({ status: "draft", order: 4, category: "tools" }),
    );
    expect(updateTag).not.toHaveBeenCalled();
  });
});

describe("saveSkillDraft and publishSkill", () => {
  it("keeps the edit in draft for a published row, no tag", async () => {
    selects.push([{ id: A, status: "published", draft: null }], []);
    const { saveSkillDraft } = await import("./actions");
    const result = await saveSkillDraft(A, input);
    expect(result.ok).toBe(true);
    expect(calls.set).toHaveBeenCalledWith({
      draft: expect.objectContaining({ name: "Skill temporal" }),
    });
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("refuses a name that another skill already has", async () => {
    selects.push([{ id: A, status: "draft", draft: null }], [{ id: B }]);
    const { saveSkillDraft } = await import("./actions");
    const result = await saveSkillDraft(A, input);
    expect(result).toMatchObject({ ok: false, error: "conflict" });
    expect(calls.set).not.toHaveBeenCalled();
  });

  it("publish invalidates the skills and projects tags and nothing else", async () => {
    selects.push([{ id: A, status: "draft", draft: null }], []);
    const { publishSkill } = await import("./actions");
    const result = await publishSkill(A, input);
    expect(result.ok).toBe(true);
    expect(calls.set).toHaveBeenCalledWith(
      expect.objectContaining({ status: "published", draft: null }),
    );
    expect(updateTag.mock.calls.map((c) => c[0]).sort()).toEqual([
      "projects",
      "skills",
    ]);
  });

  it("refuses to publish a blank name", async () => {
    const { publishSkill } = await import("./actions");
    const result = await publishSkill(A, { ...input, name: " " });
    expect(result).toMatchObject({ ok: false, error: "validation" });
    expect(updateTag).not.toHaveBeenCalled();
  });
});

describe("reorderSkills", () => {
  it("refuses ids of another category", async () => {
    selects.push([{ id: A }, { id: B }]);
    const { reorderSkills } = await import("./actions");
    const result = await reorderSkills("tools", [A, C]);
    expect(result).toMatchObject({ ok: false, error: "validation" });
    expect(calls.batch).not.toHaveBeenCalled();
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("refuses a list that omits a skill of the category", async () => {
    selects.push([{ id: A }, { id: B }]);
    const { reorderSkills } = await import("./actions");
    const result = await reorderSkills("tools", [A]);
    expect(result).toMatchObject({ ok: false, error: "validation" });
    expect(calls.batch).not.toHaveBeenCalled();
  });

  it("writes the exact set and invalidates both tags", async () => {
    selects.push([{ id: A }, { id: B }]);
    const { reorderSkills } = await import("./actions");
    const result = await reorderSkills("tools", [B, A]);
    expect(result.ok).toBe(true);
    expect(calls.batch).toHaveBeenCalledTimes(1);
    expect(updateTag.mock.calls.map((c) => c[0]).sort()).toEqual([
      "projects",
      "skills",
    ]);
  });
});

describe("structural switches and delete", () => {
  it("featured keeps a pending draft in step with the column", async () => {
    selects.push([
      { id: A, status: "published", draft: { name: "X", featured: false } },
    ]);
    const { setSkillFeatured } = await import("./actions");
    const result = await setSkillFeatured(A, true);
    expect(result.ok).toBe(true);
    expect(calls.set).toHaveBeenCalledWith({
      featured: true,
      draft: { name: "X", featured: true },
    });
    expect(updateTag.mock.calls.map((c) => c[0]).sort()).toEqual([
      "projects",
      "skills",
    ]);
  });

  it("visible invalidates both tags", async () => {
    selects.push([{ id: A, status: "published", draft: null }]);
    const { setSkillVisible } = await import("./actions");
    await setSkillVisible(A, false);
    expect(updateTag.mock.calls.map((c) => c[0]).sort()).toEqual([
      "projects",
      "skills",
    ]);
  });

  it("delete needs the typed name; a draft row touches no tag", async () => {
    const { deleteSkill } = await import("./actions");
    selects.push([{ id: A, status: "draft", name: "React" }]);
    expect(await deleteSkill(A, "otro")).toMatchObject({
      ok: false,
      error: "validation",
    });
    expect(calls.delete).not.toHaveBeenCalled();
    selects.push([{ id: A, status: "draft", name: "React" }]);
    expect((await deleteSkill(A, "React")).ok).toBe(true);
    expect(calls.delete).toHaveBeenCalledTimes(1);
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("delete of a published row invalidates both tags", async () => {
    selects.push([{ id: A, status: "published", name: "React" }]);
    const { deleteSkill } = await import("./actions");
    await deleteSkill(A, "React");
    expect(updateTag.mock.calls.map((c) => c[0]).sort()).toEqual([
      "projects",
      "skills",
    ]);
  });
});
