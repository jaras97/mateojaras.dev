// Pure mapper from a validated payload to table columns. Shared by the admin
// Server Actions and the content loader (pure, no framework imports).
import type { z } from "zod";
import type { skillDraftSchema } from "./validation";

type Parsed = z.output<typeof skillDraftSchema>;

const blank = (value: string | null) =>
  value === null || value.trim() === "" ? null : value.trim();

export function skillColumns(input: Parsed) {
  return { ...input, icon: blank(input.icon) };
}
