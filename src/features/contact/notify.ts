import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { getSiteSettingsCore } from "@/features/site-settings/queries";
import { getMailer } from "@/lib/mailer";

type Msg = {
  name: string;
  email: string;
  message: string;
  locale: "en" | "es";
};

export function buildContactEmail(msg: Msg, to: string) {
  const name = msg.name.replace(/[\r\n]+/g, " ").trim();
  return {
    from: "mateojaras.dev <contacto@mateojaras.dev>",
    to,
    replyTo: msg.email,
    subject: `Mensaje de ${name} · mateojaras.dev`,
    text: `${name} <${msg.email}> (${msg.locale})\n\n${msg.message}`,
  };
}

// Runs inside after(): the visitor already has their answer. Any failure only
// leaves email_sent_at null, which the admin inbox shows (D-10).
export async function notifyByEmail(id: string, msg: Msg): Promise<void> {
  const mailer = getMailer();
  if (!mailer) {
    console.error("Falta RESEND_API_KEY: mensaje guardado sin aviso", id);
    return;
  }
  try {
    const settings = await getSiteSettingsCore({ includeDrafts: false });
    if (!settings?.email) {
      console.error("contact notify: site_settings.email vacío", id);
      return;
    }
    const { error } = await mailer.emails.send(
      buildContactEmail(msg, settings.email),
    );
    if (error) {
      console.error("contact notify: Resend rechazó el envío", error.name, id);
      return;
    }
  } catch (error) {
    console.error(
      "contact notify failed",
      error instanceof Error ? error.name : "UnknownError",
      id,
    );
    return;
  }
  try {
    await db
      .update(contactMessages)
      .set({ emailSentAt: new Date() })
      .where(eq(contactMessages.id, id));
  } catch (error) {
    console.error(
      "email_sent_at update failed",
      error instanceof Error ? error.name : "UnknownError",
      id,
    );
  }
}
