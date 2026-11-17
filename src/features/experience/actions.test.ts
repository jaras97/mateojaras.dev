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
  company: "Empresa",
  roleEn: "Engineer",
  roleEs: "Ingeniero",
  type: "employment",
  location: "",
  startDate: "2021-08-01",
  endDate: "",
  bulletsEn: ["one"],
  bulletsEs: ["uno"],
  skillIds: [B],
  projectIds: [C],
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

describe("every experience action without a session", () => {
  it("returns error session and writes nothing", async () => {
    requireActionSession.mockResolvedValue(null);
    const actions = await import("./actions");
    const results = await Promise.all([
      actions.createExperience({}),
      actions.saveExperienceDraft(A, input),
      actions.publishExperience(A, input),
      actions.discardExperienceDraft(A),
      actions.reorderExperiences([A, B]),
      actions.setExperienceVisible(A, false),
      actions.deleteExperience(A, "Empresa"),
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

describe("saveExperienceDraft", () => {
  it("keeps the edit and the relations in draft for a published row, no tag", async () => {
    selects.push([{ id: A, status: "published" }]);
    const { saveExperienceDraft } = await import("./actions");
    const result = await saveExperienceDraft(A, input);
    expect(result).toMatchObject({ ok: true });
    expect(calls.batch).not.toHaveBeenCalled();
    expect(calls.set).toHaveBeenCalledTimes(1);
    expect(calls.set.mock.calls[0][0]).toMatchObject({
      draft: { company: "Empresa", skillIds: [B], projectIds: [C] },
    });
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("writes columns and relations in one batch for a never-published row", async () => {
    selects.push([{ id: A, status: "draft" }]);
    const { saveExperienceDraft } = await import("./actions");
    const result = await saveExperienceDraft(A, input);
    expect(result).toMatchObject({ ok: true });
    expect(calls.batch).toHaveBeenCalledTimes(1);
    expect(calls.set.mock.calls[0][0]).toMatchObject({
      location: null,
      endDate: null,
    });
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("rejects a malformed relation id", async () => {
    const { saveExperienceDraft } = await import("./actions");
    const result = await saveExperienceDraft(A, {
      ...input,
      skillIds: ["not-a-uuid"],
    });
    expect(result).toMatchObject({ ok: false, error: "validation" });
    expect(calls.batch).not.toHaveBeenCalled();
  });
});

describe("publishExperience", () => {
  it("rejects a half-empty bullet pair", async () => {
    const { publishExperience } = await import("./actions");
    const result = await publishExperience(A, {
      ...input,
      bulletsEn: ["one", ""],
      bulletsEs: ["uno", "dos"],
    });
    expect(result).toMatchObject({ ok: false, error: "validation" });
    expect(calls.batch).not.toHaveBeenCalled();
  });

  it("rejects an end date before the start date", async () => {
    const { publishExperience } = await import("./actions");
    const result = await publishExperience(A, {
      ...input,
      endDate: "2020-01-01",
    });
    expect(result).toMatchObject({ ok: false, error: "validation" });
  });

  it("publishes in one batch and tags once", async () => {
    selects.push([{ id: A, status: "draft" }]);
    const { publishExperience } = await import("./actions");
    const result = await publishExperience(A, input);
    expect(result).toMatchObject({ ok: true });
    expect(calls.batch).toHaveBeenCalledTimes(1);
    expect(calls.set.mock.calls[0][0]).toMatchObject({
      status: "published",
      draft: null,
    });
    expect(updateTag).toHaveBeenCalledTimes(1);
    expect(updateTag).toHaveBeenCalledWith("experience");
  });
});

describe("reorderExperiences", () => {
  it("refuses a partial list", async () => {
    selects.push([{ id: A }, { id: B }, { id: C }]);
    const { reorderExperiences } = await import("./actions");
    const result = await reorderExperiences([A, B]);
    expect(result).toMatchObject({ ok: false, error: "validation" });
    expect(calls.batch).not.toHaveBeenCalled();
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("writes order = index and tags once", async () => {
    selects.push([{ id: A }, { id: B }, { id: C }]);
    const { reorderExperiences } = await import("./actions");
    const result = await reorderExperiences([C, A, B]);
    expect(result).toMatchObject({ ok: true });
    expect(calls.set.mock.calls.map(([v]) => v)).toEqual([
      { order: 0 },
      { order: 1 },
      { order: 2 },
    ]);
    expect(updateTag).toHaveBeenCalledWith("experience");
  });
});

describe("deleteExperience", () => {
  it("refuses a wrong confirmation name", async () => {
    selects.push([{ id: A, company: "Empresa", status: "published" }]);
    const { deleteExperience } = await import("./actions");
    const result = await deleteExperience(A, "otra");
    expect(result).toMatchObject({ ok: false, error: "validation" });
    expect(calls.delete).not.toHaveBeenCalled();
  });

  it("tags only when the deleted row was published", async () => {
    selects.push([{ id: A, company: "Empresa", status: "draft" }]);
    const { deleteExperience } = await import("./actions");
    expect(await deleteExperience(A, "Empresa")).toMatchObject({ ok: true });
    expect(updateTag).not.toHaveBeenCalled();

    selects.push([{ id: A, company: "Empresa", status: "published" }]);
    expect(await deleteExperience(A, "Empresa")).toMatchObject({ ok: true });
    expect(updateTag).toHaveBeenCalledWith("experience");
  });
});
