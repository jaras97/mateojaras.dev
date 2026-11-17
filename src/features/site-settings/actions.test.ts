import { beforeEach, describe, expect, it, vi } from "vitest";

const selects: unknown[][] = [];
const calls = {
  set: vi.fn(),
  batch: vi.fn(async () => []),
  update: vi.fn(),
  insert: vi.fn(),
  delete: vi.fn(),
};

function selectChain() {
  const rows = selects.shift() ?? [];
  const chain: Record<string, unknown> = {
    from: () => chain,
    where: () => chain,
    limit: () => chain,
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
    return {};
  },
  delete: (...args: unknown[]) => {
    calls.delete(...args);
    return {};
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

const session = { userId: "u1", name: "Admin", email: "a@example.com" };

const input = {
  name: "Nombre",
  headlineEn: "Headline",
  headlineEs: "Titular",
  bioEn: "Bio",
  bioEs: "Biografía",
  nowEn: null,
  nowEs: null,
  availabilityStatus: "open",
  availableFrom: "",
  timezone: "America/Bogota",
  location: "Medellín, Colombia",
  languages: [{ code: "es", level: "native" }],
  email: "hola@example.com",
  calendarUrl: "",
  githubUrl: "https://github.com/x",
  linkedinUrl: "",
  seoTitleEn: "",
  seoTitleEs: "",
  seoDescriptionEn: "",
  seoDescriptionEs: "",
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

describe("every settings action without a session", () => {
  it("returns error session and writes nothing", async () => {
    requireActionSession.mockResolvedValue(null);
    const actions = await import("./actions");
    const results = await Promise.all([
      actions.saveSettingsDraft(input),
      actions.publishSettings(input),
      actions.discardSettingsDraft(),
    ]);
    for (const result of results) {
      expect(result).toEqual({ ok: false, error: "session" });
    }
    expect(calls.update).not.toHaveBeenCalled();
    expect(calls.batch).not.toHaveBeenCalled();
    expect(updateTag).not.toHaveBeenCalled();
  });
});

describe("saveSettingsDraft", () => {
  it("keeps the edit in draft for a published row and calls no tag", async () => {
    selects.push([{ status: "published" }]);
    const { saveSettingsDraft } = await import("./actions");
    const result = await saveSettingsDraft(input);
    expect(result).toMatchObject({ ok: true });
    expect(calls.set).toHaveBeenCalledTimes(1);
    expect(calls.set.mock.calls[0][0]).toMatchObject({
      draft: { name: "Nombre", githubUrl: "https://github.com/x" },
    });
    expect(calls.set.mock.calls[0][0]).not.toHaveProperty("name");
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("rejects a non-https link", async () => {
    const { saveSettingsDraft } = await import("./actions");
    const result = await saveSettingsDraft({ ...input, githubUrl: "http://x" });
    expect(result).toMatchObject({ ok: false, error: "validation" });
    expect(calls.update).not.toHaveBeenCalled();
  });
});

describe("publishSettings", () => {
  it("rejects a payload without email and writes nothing", async () => {
    const { publishSettings } = await import("./actions");
    const result = await publishSettings({ ...input, email: "" });
    expect(result).toMatchObject({
      ok: false,
      error: "validation",
      fieldErrors: { email: expect.any(Array) },
    });
    expect(calls.batch).not.toHaveBeenCalled();
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("copies the payload into the columns, clears the draft and tags settings only", async () => {
    selects.push([{ status: "published" }]);
    const { publishSettings } = await import("./actions");
    const result = await publishSettings(input);
    expect(result).toMatchObject({ ok: true });
    expect(calls.set.mock.calls[0][0]).toMatchObject({
      name: "Nombre",
      status: "published",
      draft: null,
      availableFrom: null,
      calendarUrl: null,
      linkedinUrl: null,
    });
    expect(updateTag).toHaveBeenCalledTimes(1);
    expect(updateTag).toHaveBeenCalledWith("settings");
  });
});

describe("discardSettingsDraft", () => {
  it("clears the draft without tagging", async () => {
    selects.push([{ status: "published" }]);
    const { discardSettingsDraft } = await import("./actions");
    expect(await discardSettingsDraft()).toMatchObject({ ok: true });
    expect(calls.set.mock.calls[0][0]).toEqual({ draft: null });
    expect(updateTag).not.toHaveBeenCalled();
  });
});
