// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CopyEmail } from "@/components/site/copy-email";

// Test inputs, not site copy.
const labels = {
  copy: "Copy email",
  copied: "Copied",
  failed: "Copy it by hand",
};
const email = "user@example.test";

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function stubClipboard(writeText: unknown) {
  Object.defineProperty(navigator, "clipboard", {
    value: writeText === undefined ? undefined : { writeText },
    configurable: true,
  });
}

describe("CopyEmail", () => {
  it("writes the address, announces Copied and reverts after 2 s", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    stubClipboard(writeText);
    render(<CopyEmail email={email} labels={labels} idPrefix="t" />);
    await user.click(screen.getByRole("button"));
    expect(writeText).toHaveBeenCalledWith(email);
    expect(document.querySelector('[aria-live="polite"]')?.textContent).toBe(
      "Copied",
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2100);
    });
    expect(document.querySelector('[aria-live="polite"]')?.textContent).toBe(
      "",
    );
  });

  it("shows the failed text when writeText rejects", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    stubClipboard(vi.fn().mockRejectedValue(new Error("denied")));
    render(<CopyEmail email={email} labels={labels} idPrefix="t" />);
    await user.click(screen.getByRole("button"));
    expect(await screen.findByText("Copy it by hand")).toBeTruthy();
    expect(window.getSelection()?.toString()).toBe(email);
  });

  it("shows the failed text when the clipboard is unavailable", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    stubClipboard(undefined);
    render(<CopyEmail email={email} labels={labels} idPrefix="t" />);
    await user.click(screen.getByRole("button"));
    expect(await screen.findByText("Copy it by hand")).toBeTruthy();
  });
});
