import { beforeEach, describe, expect, it, vi } from "vitest";
import en from "../../../messages/en.json";

// Fake cores that honor includeDrafts like the real ones: with drafts on they
// overlay `draft`, with drafts off they hide unpublished or hidden rows.
type Row = Record<string, unknown> & {
  status: string;
  visible: boolean;
  draft?: Record<string, unknown> | null;
};

function fakeCore(rows: Row[]) {
  return vi.fn(async ({ includeDrafts }: { includeDrafts: boolean }) =>
    rows
      .filter((r) => includeDrafts || (r.status === "published" && r.visible))
      .map(({ draft, ...rest }) =>
        includeDrafts && draft ? { ...rest, ...draft } : rest,
      ),
  );
}

const settings = {
  name: "Mateo Jaramillo",
  headlineEn: "Headline EN",
  headlineEs: "Titular ES",
  bioEn: "Bio EN",
  bioEs: "Bio ES",
  timezone: "America/Bogota",
  location: "Medellín, Colombia",
  languages: [{ code: "es", level: "native" }],
  email: "a@example.com",
  githubUrl: null,
  linkedinUrl: null,
};

const projects: Row[] = [
  {
    status: "published",
    visible: true,
    featured: true,
    titleEn: "Published title",
    titleEs: "Título publicado",
    taglineEn: null,
    taglineEs: null,
    liveUrl: null,
    draft: { titleEn: "Draft title" },
  },
  {
    status: "draft",
    visible: true,
    featured: true,
    titleEn: "Never published",
    titleEs: "Nunca publicado",
    taglineEn: null,
    taglineEs: null,
    liveUrl: null,
  },
  {
    status: "published",
    visible: true,
    featured: false,
    titleEn: "Not featured",
    titleEs: "No destacado",
    taglineEn: null,
    taglineEs: null,
    liveUrl: null,
  },
];

const experiences: Row[] = [
  {
    status: "published",
    visible: true,
    company: "Shown Co",
    roleEn: "Dev",
    roleEs: "",
    location: null,
    startDate: "2021-08-01",
    endDate: null,
    bulletsEn: ["one"],
    bulletsEs: [],
  },
  {
    status: "published",
    visible: false,
    company: "Hidden Co",
    roleEn: "Dev",
    roleEs: "Dev",
    location: null,
    startDate: "2020-01-01",
    endDate: null,
    bulletsEn: [],
    bulletsEs: [],
  },
];

const cores = {
  settings: vi.fn(async (_o: { includeDrafts: boolean }) => settings),
  projects: fakeCore(projects),
  experiences: fakeCore(experiences),
  skills: fakeCore([
    {
      status: "published",
      visible: true,
      name: "React",
      category: "frontend",
      featured: false,
    },
    {
      status: "published",
      visible: true,
      name: "Next.js",
      category: "frontend",
      featured: true,
    },
  ]),
  education: fakeCore([]),
};

vi.mock("@/features/site-settings/queries", () => ({
  getSiteSettingsCore: (o: { includeDrafts: boolean }) => cores.settings(o),
}));
vi.mock("@/features/projects/queries", () => ({
  getProjectsCore: (o: { includeDrafts: boolean }) => cores.projects(o),
}));
vi.mock("@/features/experience/queries", () => ({
  getExperiencesCore: (o: { includeDrafts: boolean }) => cores.experiences(o),
}));
vi.mock("@/features/skills/queries", () => ({
  getSkillsCore: (o: { includeDrafts: boolean }) => cores.skills(o),
}));
vi.mock("@/features/education/queries", () => ({
  getEducationCore: (o: { includeDrafts: boolean }) => cores.education(o),
}));
vi.mock("next-intl/server", () => ({
  getTranslations: async () => {
    const cv = en.Cv as Record<string, unknown>;
    return (key: string) =>
      key.split(".").reduce<unknown>((acc, part) => {
        return (acc as Record<string, unknown>)[part];
      }, cv) as string;
  },
}));

beforeEach(() => {
  for (const fn of Object.values(cores)) fn.mockClear();
});

describe("buildCvData", () => {
  it("reads every core with includeDrafts false", async () => {
    const { buildCvData } = await import("./cv-data");
    await buildCvData("en");
    for (const fn of Object.values(cores)) {
      expect(fn).toHaveBeenCalledWith({ includeDrafts: false });
    }
  });

  it("uses the published title, not the pending draft, and drops never-published and non-featured projects", async () => {
    const { buildCvData } = await import("./cv-data");
    const data = await buildCvData("en");
    expect(data.projects.map((p) => p.title)).toEqual(["Published title"]);
  });

  it("omits hidden experience and falls back to English for a blank Spanish field", async () => {
    const { buildCvData } = await import("./cv-data");
    const data = await buildCvData("es");
    expect(data.experience.map((e) => e.company)).toEqual(["Shown Co"]);
    expect(data.experience[0].role).toBe("Dev");
    expect(data.experience[0].bullets).toEqual(["one"]);
    expect(data.headline).toBe("Titular ES");
  });

  it("lists featured skills first and labels languages and categories", async () => {
    const { buildCvData } = await import("./cv-data");
    const data = await buildCvData("en");
    expect(data.skills).toEqual([
      { category: "Frontend", names: ["Next.js", "React"] },
    ]);
    expect(data.languages).toEqual([{ name: "Spanish", level: "Native" }]);
    expect(data.contact.utcOffset).toBe("UTC-5");
  });
});
