// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { afterEach, describe, expect, it } from "vitest";
import { adminMessages } from "@/lib/messages";
import { BilingualField } from "./bilingual-field";
import { FormLabelsProvider } from "./form-labels";

const { common, form, projects, richText, errors, toasts, skills } =
  adminMessages;

function Harness({
  defaults,
  children,
}: {
  defaults: Record<string, string>;
  children: ReactNode;
}) {
  const methods = useForm({ defaultValues: defaults });
  return (
    <FormLabelsProvider
      labels={{ common, form, projects, richText, errors, toasts, skills }}
    >
      <FormProvider {...methods}>{children}</FormProvider>
    </FormLabelsProvider>
  );
}

afterEach(cleanup);

describe("BilingualField", () => {
  it("shows Falta ES while the ES value is empty and hides it once typed", async () => {
    const user = userEvent.setup();
    render(
      <Harness defaults={{ titleEs: "", titleEn: "Hello" }}>
        <BilingualField name="title" label="Título" />
      </Harness>,
    );
    expect(screen.getByText("Falta ES")).toBeTruthy();
    await user.type(screen.getByLabelText("Título ES"), "Hola");
    expect(screen.queryByText("Falta ES")).toBeNull();
  });

  it("treats a whitespace-only ES value as empty", () => {
    render(
      <Harness defaults={{ titleEs: "   ", titleEn: "Hello" }}>
        <BilingualField name="title" label="Título" />
      </Harness>,
    );
    expect(screen.getByText("Falta ES")).toBeTruthy();
  });

  it("labels the two controls with their language", () => {
    render(
      <Harness defaults={{ titleEs: "Hola", titleEn: "Hello" }}>
        <BilingualField name="title" label="Título" />
      </Harness>,
    );
    expect(screen.getByLabelText("Título ES").getAttribute("lang")).toBe("es");
    expect(screen.getByLabelText("Título EN").getAttribute("lang")).toBe("en");
  });
});
