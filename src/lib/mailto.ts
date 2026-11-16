const SUBJECT_MAX = 60;

// Reply link for a contact message. The address and the subject are encoded
// separately, so nothing in a visitor's text can add headers (bcc, body).
export function replyMailto({
  email,
  message,
  prefix = "Re: ",
}: {
  email: string;
  message: string;
  prefix?: string;
}): string {
  const firstLine = message.split(/\r\n|\r|\n/, 1)[0] ?? "";
  const subject = `${prefix}${firstLine.trim().slice(0, SUBJECT_MAX)}`;
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}`;
}
