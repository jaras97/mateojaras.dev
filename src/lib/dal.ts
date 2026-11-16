import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";

export type AdminSession = { userId: string; name: string; email: string };

function toAdminSession(
  session: { user: { id: string; name: string; email: string } } | null,
): AdminSession | null {
  if (!session) return null;
  const { id, name, email } = session.user;
  return { userId: id, name, email };
}

// Admin loaders, Server Actions and AuthGate call this (02-07, phase 3).
export const requireSession = cache(async (): Promise<AdminSession> => {
  const session = toAdminSession(
    await auth.api.getSession({ headers: await headers() }),
  );
  if (!session) redirect("/admin/login");
  return session;
});

// Server Actions call this first: null instead of a redirect, so the action
// can answer { ok: false, error: "session" } and the form can show the copy.
export const requireActionSession = cache(
  async (): Promise<AdminSession | null> =>
    toAdminSession(await auth.api.getSession({ headers: await headers() })),
);

// Route Handlers (phase 3 Blob upload, AUTH-03) call this first: a Response, never a redirect.
export async function requireSessionForRequest(
  request: Request,
): Promise<
  { ok: true; session: AdminSession } | { ok: false; response: Response }
> {
  const session = toAdminSession(
    await auth.api.getSession({ headers: request.headers }),
  );
  if (!session) {
    return {
      ok: false,
      response: Response.json({ error: "unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true, session };
}
