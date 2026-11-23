// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SiteErrorProvider } from "@/components/site/site-error-provider";
import LocaleError from "./error";

const labels = {
  title: "Algo salió mal",
  body: "Esta página no cargó.",
  retry: "Intentar de nuevo",
  write: "O escríbeme a {email}.",
};

afterEach(cleanup);

function setup(email: string | null, retry = vi.fn()) {
  const error = Object.assign(new Error("secret db detail"), {
    digest: "digest-123",
  });
  render(
    <SiteErrorProvider labels={labels} email={email}>
      <LocaleError error={error} retry={retry} />
    </SiteErrorProvider>,
  );
  return retry;
}

describe("LocaleError", () => {
  it("focuses the heading, retries on click and links the email", async () => {
    const retry = setup("a@b.co");
    const h1 = screen.getByRole("heading", {
      level: 1,
      name: "Algo salió mal",
    });
    expect(document.activeElement).toBe(h1);
    await userEvent.click(
      screen.getByRole("button", { name: "Intentar de nuevo" }),
    );
    expect(retry).toHaveBeenCalledTimes(1);
    const link = screen.getByRole("link", { name: "a@b.co" });
    expect(link.getAttribute("href")).toBe("mailto:a@b.co");
  });

  it("omits the write line without an email", () => {
    setup(null);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByText(/O escríbeme/)).toBeNull();
    expect(
      screen.getByRole("button", { name: "Intentar de nuevo" }),
    ).toBeTruthy();
  });

  it("never renders error details", () => {
    setup("a@b.co");
    expect(document.body.textContent).not.toContain("secret db detail");
    expect(document.body.textContent).not.toContain("digest-123");
  });

  it("renders nothing without a provider", () => {
    const { container } = render(
      <LocaleError error={new Error("x")} retry={() => {}} />,
    );
    expect(container.innerHTML).toBe("");
  });
});
