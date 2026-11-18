import { beforeEach, describe, expect, it, vi } from "vitest";

const calls = {
  batch: vi.fn(async () => []),
  values: vi.fn(),
  maxVersion: 2 as number | null,
};
const fakeDb = {
  select: () => ({
    from: async () => [{ value: calls.maxVersion }],
  }),
  insert: () => ({
    values: (v: unknown) => {
      calls.values(v);
      return { kind: "insert", v };
    },
  }),
  batch: calls.batch,
};

const requireActionSession = vi.fn();
const hasBlobToken = vi.fn();
const updateTag = vi.fn();
const put = vi.fn();
const del = vi.fn(async () => undefined);
const renderToBuffer = vi.fn();
const buildCvData = vi.fn();

vi.mock("@/db", () => ({ db: fakeDb }));
vi.mock("@/lib/dal", () => ({ requireActionSession }));
vi.mock("@/lib/blob", () => ({ hasBlobToken }));
vi.mock("next/cache", () => ({ updateTag }));
vi.mock("@vercel/blob", () => ({ put, del }));
vi.mock("@react-pdf/renderer", () => ({ renderToBuffer }));
vi.mock("./cv-data", () => ({ buildCvData }));
vi.mock("./pdf/cv-document", () => ({ CvDocument: () => null }));
vi.mock("./pdf/fonts", () => ({ registerCvFonts: vi.fn() }));

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  calls.maxVersion = 2;
  for (const fn of [
    calls.batch,
    calls.values,
    requireActionSession,
    hasBlobToken,
    updateTag,
    put,
    del,
    renderToBuffer,
    buildCvData,
  ]) {
    fn.mockReset();
  }
  requireActionSession.mockResolvedValue({ userId: "u1" });
  hasBlobToken.mockReturnValue(true);
  buildCvData.mockImplementation(async (locale: string) => ({ locale }));
  renderToBuffer.mockResolvedValue(Buffer.from("%PDF-1.7"));
  put.mockImplementation(async (path: string) => ({
    url: `https://x.public.blob.vercel-storage.com/${path}`,
  }));
  calls.batch.mockResolvedValue([]);
});

describe("generateCv", () => {
  it("rejects without a session before anything else", async () => {
    requireActionSession.mockResolvedValue(null);
    const { generateCv } = await import("./actions");
    expect(await generateCv()).toEqual({ ok: false, error: "session" });
    expect(put).not.toHaveBeenCalled();
  });

  it("returns token and writes nothing without BLOB_READ_WRITE_TOKEN", async () => {
    hasBlobToken.mockReturnValue(false);
    const { generateCv } = await import("./actions");
    expect(await generateCv()).toEqual({ ok: false, error: "token" });
    expect(renderToBuffer).not.toHaveBeenCalled();
    expect(calls.batch).not.toHaveBeenCalled();
  });

  it("writes no row when rendering fails", async () => {
    renderToBuffer.mockRejectedValue(new Error("render roto"));
    const { generateCv } = await import("./actions");
    const result = await generateCv();
    expect(result).toMatchObject({
      ok: false,
      error: "server",
      fieldErrors: { motivo: ["render roto"] },
    });
    expect(put).not.toHaveBeenCalled();
    expect(calls.batch).not.toHaveBeenCalled();
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("writes no row and cleans up when the second upload fails", async () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "test-token");
    put
      .mockResolvedValueOnce({ url: "https://x/en.pdf" })
      .mockRejectedValueOnce(new Error("upload roto"));
    const { generateCv } = await import("./actions");
    const result = await generateCv();
    expect(result).toMatchObject({ ok: false, error: "server" });
    expect(calls.batch).not.toHaveBeenCalled();
    expect(del).toHaveBeenCalledWith(
      ["https://x/en.pdf"],
      expect.objectContaining({ token: "test-token" }),
    );
  });

  it("inserts two rows with the same next version and invalidates once", async () => {
    const { generateCv } = await import("./actions");
    const result = await generateCv();
    expect(result).toMatchObject({ ok: true, version: 3 });
    expect(put).toHaveBeenCalledTimes(2);
    expect(put.mock.calls[0][0]).toBe("resume/en/v3.pdf");
    expect(put.mock.calls[1][0]).toBe("resume/es/v3.pdf");
    expect(put.mock.calls[0][2]).toMatchObject({
      access: "public",
      contentType: "application/pdf",
      addRandomSuffix: true,
    });
    expect(calls.batch).toHaveBeenCalledTimes(1);
    const rows = calls.values.mock.calls.map((c) => c[0]);
    expect(rows).toEqual([
      expect.objectContaining({ locale: "en", version: 3 }),
      expect.objectContaining({ locale: "es", version: 3 }),
    ]);
    expect(updateTag).toHaveBeenCalledTimes(1);
    expect(updateTag).toHaveBeenCalledWith("resume");
  });

  it("starts at v1 when no version exists", async () => {
    calls.maxVersion = null;
    const { generateCv } = await import("./actions");
    expect(await generateCv()).toMatchObject({ ok: true, version: 1 });
  });
});
