// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { submitContact } = vi.hoisted(() => ({ submitContact: vi.fn() }));
vi.mock("../public-actions", () => ({ submitContact }));

import { ContactForm } from "./contact-form";

const labels = {
  name: "Nombre",
  email: "Correo",
  message: "Mensaje",
  honeypot: "Deja vacío",
  send: "Enviar",
  sending: "Enviando",
  confirmation: "Gracias",
  errors: {
    nameRequired: "Escribe tu nombre",
    emailInvalid: "Email inválido",
    messageShort: "Mensaje corto",
    messageLong: "Mensaje largo",
    rateLimited: "Límite alcanzado",
    unavailable: "No disponible",
  },
};

beforeEach(() => submitContact.mockReset());
afterEach(cleanup);

describe("ContactForm", () => {
  it("shows the localized errors and focuses the first invalid field", async () => {
    const user = userEvent.setup();
    render(<ContactForm locale="es" email="a@b.co" labels={labels} />);
    await user.click(screen.getByRole("button", { name: "Enviar" }));
    expect(await screen.findByText("Escribe tu nombre")).toBeTruthy();
    expect(screen.getByText("Email inválido")).toBeTruthy();
    expect(screen.getByText("Mensaje corto")).toBeTruthy();
    expect(submitContact).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByLabelText("Nombre")),
    );
    expect(screen.getByLabelText("Nombre").getAttribute("aria-invalid")).toBe(
      "true",
    );
  });

  it("replaces the form with a focused confirmation on success", async () => {
    submitContact.mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(<ContactForm locale="es" email="a@b.co" labels={labels} />);
    await user.type(screen.getByLabelText("Nombre"), "Ana");
    await user.type(screen.getByLabelText("Correo"), "ana@example.com");
    await user.type(screen.getByLabelText("Mensaje"), "Hola, un mensaje largo");
    await user.click(screen.getByRole("button", { name: "Enviar" }));
    const h2 = await screen.findByRole("heading", { level: 2, name: "Gracias" });
    await waitFor(() => expect(document.activeElement).toBe(h2));
    expect(screen.queryByLabelText("Nombre")).toBeNull();
    expect(submitContact).toHaveBeenCalledWith(
      "es",
      expect.objectContaining({ name: "Ana", locale: "es" }),
    );
  });

  it("shows a role=alert with a mailto link on rate_limited and keeps values", async () => {
    submitContact.mockResolvedValue({ ok: false, error: "rate_limited" });
    const user = userEvent.setup();
    render(<ContactForm locale="es" email="a@b.co" labels={labels} />);
    await user.type(screen.getByLabelText("Nombre"), "Ana");
    await user.type(screen.getByLabelText("Correo"), "ana@example.com");
    await user.type(screen.getByLabelText("Mensaje"), "Hola, un mensaje largo");
    await user.click(screen.getByRole("button", { name: "Enviar" }));
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Límite alcanzado");
    expect(alert.querySelector("a")?.getAttribute("href")).toBe("mailto:a@b.co");
    expect((screen.getByLabelText("Nombre") as HTMLInputElement).value).toBe(
      "Ana",
    );
  });
});
