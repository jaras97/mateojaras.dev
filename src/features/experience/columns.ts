// Pure mapper from a validated payload to table columns. Shared by the admin
// Server Actions and the content loader (pure, no framework imports).
import type { z } from "zod";
import type { experienceDraftSchema } from "./validation";

type Parsed = z.output<typeof experienceDraftSchema>;

const blank = (value: string | null) =>
  value === null || value.trim() === "" ? null : value;

export function experienceColumns(input: Parsed) {
  const { skillIds: _skills, projectIds: _projects, ...columns } = input;
  return {
    ...columns,
    location: blank(input.location),
    endDate: blank(input.endDate),
  };
}
