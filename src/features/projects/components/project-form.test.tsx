// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { saveProjectDraft, publishProject, refresh } = vi.hoisted(() => ({
  saveProjectDraft: vi.fn(),
  publishProject: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("../actions", () => ({ saveProjectDraft, publishProject }));
vi.mock("../list-actions", () => ({ setProjectFeatured: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh, push: vi.fn() }),
}));
vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), { error: vi.fn() }),
}));
// ProseMirror does not run in jsdom; the editor has its own coverage in e2e.
vi.mock("@/components/admin/rich-text-editor", () => ({
  default: () => <div data-testid="editor" />,
}));

import { FormLabelsProvider } from "@/components/admin/form-labels";
import { NavigationBlockerProvider } from "@/components/admin/navigation-blocker";
import { adminMessages } from "@/lib/messages";
import { projectFormValues } from "../validation";
import { ProjectForm } from "./project-form";

const { common, form, projects, richText, errors, toasts, skills, confirm } =
  adminMessages;

// Complete except problemEs, so publish fails on exactly one field.
const row = {
  id: "00000000-0000-4000-8000-000000000001",
  slug: "demo",
  titleEn: "Demo",
  titleEs: "Demo",
  taglineEn: "tag",
  taglineEs: "etiqueta",
  problemEn: "problem",
  problemEs: "",
  roleEn: "role",
  roleEs: "papel",
  solutionEn: "solution",
  solutionEs: "solucion",
} as unknown as Parameters<typeof projectFormValues>[0];

function renderForm() {
  return render(
    <NavigationBlockerProvider
      labels={{
        title: confirm.unsaved.title,
        body: confirm.unsaved.body,
        stay: confirm.unsaved.stay,
        leave: confirm.unsaved.leave,
      }}
    >
      <FormLabelsProvider
        labels={{ common, form, projects, richText, errors, toasts, skills }}
      >
        <ProjectForm
          version="v1"
          id="00000000-0000-4000-8000-000000000001"
          title="Demo"
          defaults={projectFormValues(row, [])}
          status="draft"
          hasPendingDraft={false}
          featured={false}
          skillOptions={[]}
          previewHref={null}
          uploadsEnabled={false}
        />
      </FormLabelsProvider>
    </NavigationBlockerProvider>,
  );
}

beforeEach(() => {
  saveProjectDraft.mockReset();
  publishProject.mockReset();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ProjectForm", () => {
  it("blocks Publicar when ES problem is empty: alert with the count, focus on the field, no action call", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getAllByRole("button", { name: "Publicar" })[0]);
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe(
      "No se pudo publicar: faltan 1 campos. Están marcados en el formulario.",
    );
    expect(document.activeElement).toBe(screen.getByLabelText("Problema ES"));
    expect(publishProject).not.toHaveBeenCalled();
  });

  it("saves an incomplete draft and shows the saved time", async () => {
    saveProjectDraft.mockResolvedValue({
      ok: true,
      savedAt: new Date().toISOString(),
    });
    const user = userEvent.setup();
    renderForm();
    await user.click(
      screen.getAllByRole("button", { name: /Guardar borrador/ })[0],
    );
    await vi.waitFor(() => expect(saveProjectDraft).toHaveBeenCalledTimes(1));
    expect(await screen.findByText(/^Guardado/)).toBeTruthy();
  });

  it("keeps the values and offers Entrar when the session expired", async () => {
    saveProjectDraft.mockResolvedValue({ ok: false, error: "session" });
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText("Problema ES"), "texto");
    await user.click(
      screen.getAllByRole("button", { name: /Guardar borrador/ })[0],
    );
    const link = await screen.findByRole("link", { name: "Entrar" });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(
      (screen.getByLabelText("Problema ES") as HTMLTextAreaElement).value,
    ).toBe("texto");
  });
});
