import { beforeEach, describe, expect, it, vi } from "vitest";

const { send, getMailer, set, where, getSettings } = vi.hoisted(() => {
  const where = vi.fn().mockResolvedValue(undefined);
  const set = vi.fn(() => ({ where }));
  return {
    send: vi.fn(),
    getMailer: vi.fn(),
    set,
    where,
    getSettings: vi.fn(),
  };
});

vi.mock("@/lib/mailer", () => ({ getMailer }));
vi.mock("@/db", () => ({ db: { update: vi.fn(() => ({ set })) } }));
vi.mock("@/features/site-settings/queries", () => ({
  getSiteSettingsCore: getSettings,
}));

import { buildContactEmail, notifyByEmail } from "./notify";

const msg = {
  name: "Ana",
  email: "ana@example.com",
  message: "Hola, quiero hablar de un proyecto.",
  locale: "es" as const,
};

beforeEach(() => {
  send.mockReset();
  set.mockClear();
  where.mockReset().mockResolvedValue(undefined);
  getMailer.mockReset().mockReturnValue({ emails: { send } });
  getSettings.mockReset().mockResolvedValue({ email: "teo@example.com" });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("buildContactEmail", () => {
  it("strips CR/LF from the subject and sets replyTo", () => {
    const e = buildContactEmail(
      { ...msg, name: "Ana\r\nBcc: x@y.com" },
      "teo@example.com",
    );
    expect(e.subject).not.toMatch(/[\r\n]/);
    expect(e.replyTo).toBe("ana@example.com");
    expect(e.from).toBe("mateojaras.dev <contacto@mateojaras.dev>");
    expect(e.to).toBe("teo@example.com");
  });
});

describe("notifyByEmail", () => {
  it("records email_sent_at after a successful send", async () => {
    send.mockResolvedValue({ data: { id: "1" }, error: null });
    await notifyByEmail("id-1", msg);
    expect(set).toHaveBeenCalledWith({ emailSentAt: expect.any(Date) });
  });

  it("does not record when Resend returns an error", async () => {
    send.mockResolvedValue({ data: null, error: { name: "validation_error" } });
    await notifyByEmail("id-1", msg);
    expect(set).not.toHaveBeenCalled();
  });

  it("logs and returns when RESEND_API_KEY is missing", async () => {
    getMailer.mockReturnValue(null);
    await notifyByEmail("id-1", msg);
    expect(send).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("RESEND_API_KEY"),
      "id-1",
    );
  });

  it("does not rethrow when the update fails", async () => {
    send.mockResolvedValue({ data: { id: "1" }, error: null });
    where.mockRejectedValue(new Error("no column"));
    await expect(notifyByEmail("id-1", msg)).resolves.toBeUndefined();
  });
});
