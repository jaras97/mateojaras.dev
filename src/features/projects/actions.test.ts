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

const ID = "11111111-1111-4111-8111-111111111111";
const session = { userId: "u1", name: "Admin", email: "a@example.com" };

const input = {
  slug: "mi-proyecto",
  titleEn: "Title",
  titleEs: "Titulo",
  taglineEn: "tagline",
  taglineEs: "frase",
  problemEn: "problem",
  problemEs: "problema",
  roleEn: "role",
  roleEs: "papel",
  solutionEn: "solution",
  solutionEs: "solucion",
  caseStudyEn: null,
  caseStudyEs: null,
  resultsEn: [],
  resultsEs: [],
  metricsEn: [],
  metricsEs: [],
  techDecisionsEn: null,
  techDecisionsEs: null,
  liveUrl: "",
  repoUrl: null,
  coverImage: null,
  media: [],
  startedAt: "",
  finishedAt: "",
  skillIds: [],
};

const published = { id: ID, slug: "mi-proyecto", status: "published" };
const unpublished = { id: ID, slug: "mi-proyecto", status: "draft" };

beforeEach(() => {
  vi.resetModules();
  selects.length = 0;
  for (const fn of Object.values(calls)) fn.mockClear();
  updateTag.mockClear();
  requireActionSession.mockReset();
  requireActionSession.mockResolvedValue(session);
});

describe("every action without a session", () => {
  it("returns error session and writes nothing", async () => {
    requireActionSession.mockResolvedValue(null);
    const actions = await import("./actions");
    const results = await Promise.all([
      actions.saveProjectDraft(ID, input),
      actions.publishProject(ID, input),
      actions.discardProjectDraft(ID),
      actions.createProject({ titleEn: "a", titleEs: "b", slug: "c" }),
    ]);
    for (const result of results) {
      expect(result).toEqual({ ok: false, error: "session" });
    }
    expect(calls.update).not.toHaveBeenCalled();
    expect(calls.insert).not.toHaveBeenCalled();
    expect(calls.delete).not.toHaveBeenCalled();
    expect(calls.batch).not.toHaveBeenCalled();
  });
});

describe("saveProjectDraft", () => {
  it("on a published row writes only { draft } and never calls updateTag", async () => {
    selects.push([published], []);
    const { saveProjectDraft } = await import("./actions");
    const result = await saveProjectDraft(ID, input);
    expect(result.ok).toBe(true);
    expect(calls.set).toHaveBeenCalledTimes(1);
    const written = calls.set.mock.calls[0][0] as Record<string, unknown>;
    expect(Object.keys(written)).toEqual(["draft"]);
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("on a never-published row writes columns and calls no updateTag", async () => {
    selects.push([unpublished], []);
    const { saveProjectDraft } = await import("./actions");
    const result = await saveProjectDraft(ID, input);
    expect(result.ok).toBe(true);
    expect(calls.batch).toHaveBeenCalledTimes(1);
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("rejects mass assignment of status or id", async () => {
    selects.push([published], []);
    const { saveProjectDraft } = await import("./actions");
    const result = await saveProjectDraft(ID, {
      ...input,
      status: "published",
      id: "x",
    });
    expect(result).toMatchObject({ ok: false, error: "validation" });
    expect(calls.set).not.toHaveBeenCalled();
  });
});

describe("publishProject", () => {
  it("copies into the columns and invalidates only the project tags", async () => {
    selects.push([published], []);
    const { publishProject } = await import("./actions");
    const result = await publishProject(ID, input);
    expect(result.ok).toBe(true);
    expect(calls.batch).toHaveBeenCalledTimes(1);
    expect(calls.set).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "published",
        draft: null,
        titleEs: "Titulo",
      }),
    );
    expect(updateTag.mock.calls.map((c) => c[0]).sort()).toEqual(
      ["project:mi-proyecto", "projects"].sort(),
    );
  });

  it("rejects a slug different from the stored slug of a published row", async () => {
    selects.push([published], []);
    const { publishProject } = await import("./actions");
    const result = await publishProject(ID, { ...input, slug: "otro-slug" });
    expect(result).toMatchObject({ ok: false, error: "validation" });
    expect(result.ok === false && result.fieldErrors?.slug?.length).toBe(1);
    expect(calls.batch).not.toHaveBeenCalled();
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("returns conflict when another project owns the slug", async () => {
    selects.push([unpublished], [{ id: "another" }]);
    const { publishProject } = await import("./actions");
    const result = await publishProject(ID, { ...input, slug: "otro-slug" });
    expect(result).toMatchObject({ ok: false, error: "conflict" });
    expect(result.ok === false && result.fieldErrors?.slug?.length).toBe(1);
    expect(calls.batch).not.toHaveBeenCalled();
    expect(updateTag).not.toHaveBeenCalled();
  });
});

describe("createProject", () => {
  it("returns the new id as a draft and calls no updateTag", async () => {
    selects.push([], [{ value: 3 }]);
    const { createProject } = await import("./actions");
    const result = await createProject({
      titleEn: "New",
      titleEs: "Nuevo",
      slug: "nuevo",
    });
    expect(result).toMatchObject({ ok: true, id: "new-id" });
    expect(calls.values).toHaveBeenCalledWith(
      expect.objectContaining({ status: "draft", order: 4, slug: "nuevo" }),
    );
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("returns conflict for a slug already in use", async () => {
    selects.push([{ id: "another" }]);
    const { createProject } = await import("./actions");
    const result = await createProject({
      titleEn: "New",
      titleEs: "Nuevo",
      slug: "nuevo",
    });
    expect(result).toMatchObject({ ok: false, error: "conflict" });
    expect(calls.insert).not.toHaveBeenCalled();
  });
});

describe("discardProjectDraft", () => {
  it("sets draft to null and calls no updateTag", async () => {
    selects.push([published]);
    const { discardProjectDraft } = await import("./actions");
    const result = await discardProjectDraft(ID);
    expect(result.ok).toBe(true);
    expect(calls.set).toHaveBeenCalledWith({ draft: null });
    expect(updateTag).not.toHaveBeenCalled();
  });
});
