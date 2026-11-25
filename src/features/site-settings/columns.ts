// Pure mapper from a validated settings payload to table columns. Shared by the
// admin Server Actions and the content loader (pure, no framework imports).
import type { z } from "zod";
import type { settingsDraftSchema } from "./validation";

type Parsed = z.output<typeof settingsDraftSchema>;

const blank = (value: string | null) =>
  value === null || value.trim() === "" ? null : value;

export function settingsColumns(input: Parsed) {
  return {
    ...input,
    name: input.name.trim(),
    email: input.email.trim(),
    availableFrom: blank(input.availableFrom),
    calendarUrl: blank(input.calendarUrl),
    githubUrl: blank(input.githubUrl),
    linkedinUrl: blank(input.linkedinUrl),
    seoTitleEn: blank(input.seoTitleEn),
    seoTitleEs: blank(input.seoTitleEs),
    seoDescriptionEn: blank(input.seoDescriptionEn),
    seoDescriptionEs: blank(input.seoDescriptionEs),
  };
}
