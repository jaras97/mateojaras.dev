// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Activity } from "react";
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
    rateLimited: "Límite alcanzado, escribe a {email}",
    unavailable: "No disponible, escribe a {email}",
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
    const h2 = await screen.findByRole("heading", {
      level: 2,
      name: "Gracias",
    });
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
    expect(alert.querySelector("a")?.getAttribute("href")).toBe(
      "mailto:a@b.co",
    );
    expect((screen.getByLabelText("Nombre") as HTMLInputElement).value).toBe(
      "Ana",
    );
  });

  it.each([
    new Error('Failed to find Server Action "abc"'),
    new TypeError("Failed to fetch"),
  ])("degrades a rejected action call to the unavailable alert (%s)", async (rejection) => {
    submitContact.mockRejectedValueOnce(rejection);
    const user = userEvent.setup();
    render(<ContactForm locale="es" email="a@b.co" labels={labels} />);
    await user.type(screen.getByLabelText("Nombre"), "Ana");
    await user.type(screen.getByLabelText("Correo"), "ana@example.com");
    await user.type(screen.getByLabelText("Mensaje"), "Hola, un mensaje largo");
    await user.click(screen.getByRole("button", { name: "Enviar" }));
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("No disponible");
    expect(alert.querySelector("a")?.getAttribute("href")).toBe(
      "mailto:a@b.co",
    );
    expect((screen.getByLabelText("Nombre") as HTMLInputElement).value).toBe(
      "Ana",
    );
    expect((screen.getByLabelText("Correo") as HTMLInputElement).value).toBe(
      "ana@example.com",
    );
    expect((screen.getByLabelText("Mensaje") as HTMLInputElement).value).toBe(
      "Hola, un mensaje largo",
    );
    const send = screen.getByRole("button", {
      name: "Enviar",
    }) as HTMLButtonElement;
    expect(send.disabled).toBe(false);
    expect(document.body.textContent).not.toContain(
      "Failed to find Server Action",
    );
    expect(document.body.textContent).not.toContain("Failed to fetch");

    submitContact.mockResolvedValueOnce({ ok: true });
    await user.click(send);
    expect(await screen.findByText("Gracias")).toBeTruthy();
  });

  it("resets a stale confirmation when the Activity is hidden and shown again", async () => {
    submitContact.mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    const ui = (mode: "visible" | "hidden") => (
      <Activity mode={mode}>
        <ContactForm locale="es" email="a@b.co" labels={labels} />
      </Activity>
    );
    const { rerender } = render(ui("visible"));
    await user.type(screen.getByLabelText("Nombre"), "Ana");
    await user.type(screen.getByLabelText("Correo"), "ana@example.com");
    await user.type(screen.getByLabelText("Mensaje"), "Hola, un mensaje largo");
    await user.click(screen.getByRole("button", { name: "Enviar" }));
    await screen.findByRole("heading", { level: 2, name: "Gracias" });
    rerender(ui("hidden"));
    rerender(ui("visible"));
    const name = (await screen.findByLabelText("Nombre")) as HTMLInputElement;
    expect(name.value).toBe("");
    expect(screen.queryByRole("heading", { name: "Gracias" })).toBeNull();
  });
});
