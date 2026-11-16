// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { signInEmail, replace, refresh } = vi.hoisted(() => ({
  signInEmail: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: { signIn: { email: signInEmail } },
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
}));

import { LoginForm } from "./login-form";

// Test labels, not site copy.
const labels = {
  email: "Correo",
  password: "Contraseña",
  submit: "Entrar",
  invalid: "Credenciales incorrectas",
  required: "Campo obligatorio",
};

beforeEach(() => {
  signInEmail.mockReset();
  replace.mockClear();
  refresh.mockClear();
});
afterEach(cleanup);

describe("LoginForm", () => {
  it("shows the required message and does not call signIn for an invalid email", async () => {
    const user = userEvent.setup();
    render(<LoginForm labels={labels} />);
    await user.type(screen.getByLabelText("Correo"), "not-an-email");
    await user.type(screen.getByLabelText("Contraseña"), "x");
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByText("Campo obligatorio")).toBeTruthy();
    expect(signInEmail).not.toHaveBeenCalled();
  });

  it("calls signIn.email once with the credentials and navigates on success", async () => {
    signInEmail.mockResolvedValue({ data: {}, error: null });
    const user = userEvent.setup();
    render(<LoginForm labels={labels} />);
    await user.type(screen.getByLabelText("Correo"), "a@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "secret");
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/admin"));
    expect(signInEmail).toHaveBeenCalledTimes(1);
    expect(signInEmail).toHaveBeenCalledWith({
      email: "a@example.com",
      password: "secret",
    });
  });

  it("shows one generic message on a server error", async () => {
    signInEmail.mockResolvedValue({ data: null, error: { status: 401 } });
    const user = userEvent.setup();
    render(<LoginForm labels={labels} />);
    await user.type(screen.getByLabelText("Correo"), "a@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "wrong");
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "Credenciales incorrectas",
    );
    expect(replace).not.toHaveBeenCalled();
  });

  it("offers no way to create an account", () => {
    render(<LoginForm labels={labels} />);
    const text = [
      ...screen.queryAllByRole("link"),
      ...screen.queryAllByRole("button"),
    ]
      .map((e) => e.textContent)
      .join(" ");
    expect(text).not.toMatch(/regist|sign up|crear cuenta/i);
  });
});
