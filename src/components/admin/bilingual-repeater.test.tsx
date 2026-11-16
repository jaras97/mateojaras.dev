// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { afterEach, describe, expect, it } from "vitest";
import { adminMessages } from "@/lib/messages";
import { BilingualRepeater } from "./bilingual-repeater";
import { FormLabelsProvider } from "./form-labels";

const { common, form, projects, richText, errors, toasts, skills } =
  adminMessages;

function Harness({ rows }: { rows: { es: string; en: string }[] }) {
  const methods = useForm({ defaultValues: { results: rows } });
  return (
    <FormLabelsProvider
      labels={{ common, form, projects, richText, errors, toasts, skills }}
    >
      <FormProvider {...methods}>
        <BilingualRepeater
          name="results"
          label="Resultados"
          addLabel="Añadir resultado"
          emptyRow={{ es: "", en: "" }}
          columns={[
            { kind: "bilingual", label: "Resultado", esKey: "es", enKey: "en" },
          ]}
        />
      </FormProvider>
    </FormLabelsProvider>
  );
}

afterEach(cleanup);

describe("BilingualRepeater", () => {
  it("with no rows shows only the add button", () => {
    render(<Harness rows={[]} />);
    expect(
      screen.getByRole("button", { name: "Añadir resultado" }),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Quitar" })).toBeNull();
  });

  it("adds a row with an ES and an EN control, and removes it", async () => {
    const user = userEvent.setup();
    render(<Harness rows={[]} />);
    await user.click(screen.getByRole("button", { name: "Añadir resultado" }));
    expect(screen.getByLabelText("Resultado 1 ES")).toBeTruthy();
    expect(screen.getByLabelText("Resultado 1 EN")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Quitar" }));
    expect(screen.queryByLabelText("Resultado 1 ES")).toBeNull();
  });

  it("disables Subir on the first row and Bajar on the last", () => {
    render(
      <Harness
        rows={[
          { es: "a", en: "a" },
          { es: "b", en: "b" },
        ]}
      />,
    );
    const [first, second] = screen.getAllByRole("listitem");
    expect(
      within(first)
        .getByRole("button", { name: "Subir" })
        .hasAttribute("disabled"),
    ).toBe(true);
    expect(
      within(second)
        .getByRole("button", { name: "Bajar" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });

  it("moves a row down", async () => {
    const user = userEvent.setup();
    render(
      <Harness
        rows={[
          { es: "uno", en: "one" },
          { es: "dos", en: "two" },
        ]}
      />,
    );
    const [first] = screen.getAllByRole("listitem");
    await user.click(within(first).getByRole("button", { name: "Bajar" }));
    const values = screen
      .getAllByLabelText(/ ES$/)
      .map((input) => (input as HTMLInputElement).value);
    expect(values).toEqual(["dos", "uno"]);
  });
});
