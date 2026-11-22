// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ContactAside } from "./contact-aside";

const labels = {
  orWrite: "Or write directly",
  preferCall: "Prefer a call?",
  calendar: "Book a call",
  copy: { copy: "Copy email", copied: "Copied", failed: "Failed" },
};

afterEach(cleanup);

describe("ContactAside", () => {
  it("shows the address and no call block without a calendar url", () => {
    render(<ContactAside email="a@b.co" calendarUrl={null} labels={labels} />);
    expect(screen.getByText("a@b.co")).toBeTruthy();
    expect(screen.queryByText("Prefer a call?")).toBeNull();
  });

  it("ignores a non-https calendar url", () => {
    render(
      <ContactAside
        email="a@b.co"
        calendarUrl="javascript:x"
        labels={labels}
      />,
    );
    expect(screen.queryByRole("link", { name: /Book a call/ })).toBeNull();
    expect(screen.queryByText("Prefer a call?")).toBeNull();
  });

  it("links an https calendar url", () => {
    render(
      <ContactAside
        email="a@b.co"
        calendarUrl="https://cal.com/teo"
        labels={labels}
      />,
    );
    expect(
      screen.getByRole("link", { name: /Book a call/ }).getAttribute("href"),
    ).toBe("https://cal.com/teo");
  });
});
