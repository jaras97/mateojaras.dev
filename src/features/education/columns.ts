// Pure mapper from a validated payload to table columns. Shared by the admin
// Server Actions and the content loader (pure, no framework imports).
import type { z } from "zod";
import type { educationDraftSchema } from "./validation";

type Parsed = z.output<typeof educationDraftSchema>;

const blank = (value: string | null) =>
  value === null || value.trim() === "" ? null : value;

export function educationColumns(input: Parsed) {
  return {
    ...input,
    startDate: blank(input.startDate),
    endDate: blank(input.endDate),
    statusEn: blank(input.statusEn),
    statusEs: blank(input.statusEs),
  };
}
