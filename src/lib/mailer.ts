import "server-only";
import { Resend } from "resend";

// Null when RESEND_API_KEY is missing; the caller logs and skips the notice.
export function getMailer(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  return key ? new Resend(key) : null;
}
