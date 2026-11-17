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
  institution: "Universidad",
  programEn: "Systems Engineering",
  programEs: "Ingeniería de Sistemas",
  startDate: "2018-01-15",
  endDate: "",
  statusEn: "",
  statusEs: "",
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

describe("every education action without a session", () => {
  it("returns error session and writes nothing", async () => {
    requireActionSession.mockResolvedValue(null);
    const actions = await import("./actions");
    const results = await Promise.all([
      actions.createEducation({}),
      actions.saveEducationDraft(A, input),
      actions.publishEducation(A, input),
      actions.discardEducationDraft(A),
      actions.reorderEducation([A, B]),
      actions.setEducationVisible(A, false),
      actions.deleteEducation(A, "Universidad"),
    ]);
    expect(results).toHaveLength(7);
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

describe("saveEducationDraft", () => {
  it("keeps the edit in draft for a published row, no tag", async () => {
    selects.push([{ id: A, status: "published" }]);
    const { saveEducationDraft } = await import("./actions");
    const result = await saveEducationDraft(A, input);
    expect(result).toMatchObject({ ok: true });
    expect(calls.set).toHaveBeenCalledTimes(1);
    expect(calls.set.mock.calls[0][0]).toMatchObject({
      draft: { institution: "Universidad" },
    });
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("writes the columns of a never-published row, blanks as null, no tag", async () => {
    selects.push([{ id: A, status: "draft" }]);
    const { saveEducationDraft } = await import("./actions");
    const result = await saveEducationDraft(A, input);
    expect(result).toMatchObject({ ok: true });
    expect(calls.set.mock.calls[0][0]).toMatchObject({
      institution: "Universidad",
      endDate: null,
      statusEn: null,
    });
    expect(updateTag).not.toHaveBeenCalled();
  });
});

describe("publishEducation", () => {
  it("without programEs returns fieldErrors.programEs and writes nothing", async () => {
    const { publishEducation } = await import("./actions");
    const result = await publishEducation(A, { ...input, programEs: " " });
    expect(result).toMatchObject({
      ok: false,
      error: "validation",
      fieldErrors: { programEs: expect.any(Array) },
    });
    expect(calls.update).not.toHaveBeenCalled();
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("rejects an end date before the start date", async () => {
    const { publishEducation } = await import("./actions");
    const result = await publishEducation(A, {
      ...input,
      endDate: "2017-01-01",
    });
    expect(result).toMatchObject({ ok: false, error: "validation" });
  });

  it("publishes, clears the draft and tags once", async () => {
    selects.push([{ id: A, status: "draft" }]);
    const { publishEducation } = await import("./actions");
    const result = await publishEducation(A, input);
    expect(result).toMatchObject({ ok: true });
    expect(calls.set.mock.calls[0][0]).toMatchObject({
      status: "published",
      draft: null,
    });
    expect(updateTag).toHaveBeenCalledTimes(1);
    expect(updateTag).toHaveBeenCalledWith("education");
  });
});

describe("reorderEducation", () => {
  it("refuses a partial list", async () => {
    selects.push([{ id: A }, { id: B }, { id: C }]);
    const { reorderEducation } = await import("./actions");
    const result = await reorderEducation([A, B]);
    expect(result).toMatchObject({ ok: false, error: "validation" });
    expect(calls.batch).not.toHaveBeenCalled();
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("writes order = index in one batch and tags once", async () => {
    selects.push([{ id: A }, { id: B }, { id: C }]);
    const { reorderEducation } = await import("./actions");
    const result = await reorderEducation([C, A, B]);
    expect(result).toMatchObject({ ok: true });
    expect(calls.batch).toHaveBeenCalledTimes(1);
    expect(calls.set.mock.calls.map(([v]) => v)).toEqual([
      { order: 0 },
      { order: 1 },
      { order: 2 },
    ]);
    expect(updateTag).toHaveBeenCalledWith("education");
  });
});

describe("setEducationVisible", () => {
  it("writes the flag and tags", async () => {
    selects.push([{ id: A, status: "published" }]);
    const { setEducationVisible } = await import("./actions");
    expect(await setEducationVisible(A, false)).toMatchObject({ ok: true });
    expect(calls.set.mock.calls[0][0]).toEqual({ visible: false });
    expect(updateTag).toHaveBeenCalledWith("education");
  });
});

describe("deleteEducation", () => {
  it("refuses a wrong confirmation name", async () => {
    selects.push([{ id: A, institution: "Universidad", status: "published" }]);
    const { deleteEducation } = await import("./actions");
    const result = await deleteEducation(A, "otra");
    expect(result).toMatchObject({ ok: false, error: "validation" });
    expect(calls.delete).not.toHaveBeenCalled();
  });

  it("tags only when the deleted row was published", async () => {
    selects.push([{ id: A, institution: "Universidad", status: "draft" }]);
    const { deleteEducation } = await import("./actions");
    expect(await deleteEducation(A, "Universidad")).toMatchObject({
      ok: true,
    });
    expect(updateTag).not.toHaveBeenCalled();

    selects.push([{ id: A, institution: "Universidad", status: "published" }]);
    expect(await deleteEducation(A, "Universidad")).toMatchObject({
      ok: true,
    });
    expect(updateTag).toHaveBeenCalledWith("education");
  });
});
