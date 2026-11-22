import { z } from "zod";

// Minimum time a human needs to fill the form, measured on the client from
// mount. Faster submissions are discarded silently (D-13).
export const MIN_ELAPSED_MS = 3000;

// Messages are codes; the form maps them to Site.contact.errors.*.
export const contactSchema = z.strictObject({
  name: z.string().trim().min(1, "nameRequired").max(100, "nameRequired"),
  email: z.email("emailInvalid").max(254, "emailInvalid"),
  message: z.string().trim().min(10, "messageShort").max(5000, "messageLong"),
  website: z.string().max(200).default(""),
  elapsedMs: z.coerce.number().int().nonnegative().default(0),
  locale: z.enum(["en", "es"]),
});

export type ContactInput = z.output<typeof contactSchema>;
