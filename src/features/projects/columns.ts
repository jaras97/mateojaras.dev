// Pure mapper from a validated payload to table columns. Shared by the admin
// Server Actions and the content loader (pure, no framework imports).
import type { z } from "zod";
import type { projectDraftSchema } from "./validation";

type Parsed = z.output<typeof projectDraftSchema>;

const blank = (value: string | null) =>
  value === null || value.trim() === "" ? null : value;

// Form values -> column values: empty strings become null for nullable columns.
export function projectColumns(input: Parsed) {
  const { skillIds: _skillIds, ...columns } = input;
  return {
    ...columns,
    taglineEn: blank(input.taglineEn),
    taglineEs: blank(input.taglineEs),
    problemEn: blank(input.problemEn),
    problemEs: blank(input.problemEs),
    roleEn: blank(input.roleEn),
    roleEs: blank(input.roleEs),
    solutionEn: blank(input.solutionEn),
    solutionEs: blank(input.solutionEs),
    liveUrl: blank(input.liveUrl),
    repoUrl: blank(input.repoUrl),
    coverImage: blank(input.coverImage),
    startedAt: blank(input.startedAt),
    finishedAt: blank(input.finishedAt),
  };
}
