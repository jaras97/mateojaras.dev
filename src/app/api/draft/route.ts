import { eq } from "drizzle-orm";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { getPathname } from "@/i18n/navigation";
import { requireSessionForRequest } from "@/lib/dal";
import { safeReturnPath } from "@/lib/draft-preview";

const querySchema = z.object({
  kind: z.enum(["project", "home"]),
  locale: z.enum(["en", "es"]).default("es"),
  id: z.uuid().optional(),
});

// Enable Draft Mode for a signed-in admin and send them to the real public
// route. The target is built from the database row, never from client input.
export async function GET(request: NextRequest) {
  const gate = await requireSessionForRequest(request);
  if (!gate.ok) return gate.response;

  const params = request.nextUrl.searchParams;
  const parsed = querySchema.safeParse({
    kind: params.get("kind") ?? undefined,
    locale: params.get("locale") ?? undefined,
    id: params.get("id") ?? undefined,
  });
  if (!parsed.success) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const { kind, locale, id } = parsed.data;

  let path: string;
  if (kind === "home") {
    path = getPathname({ locale, href: "/" });
  } else {
    if (!id) return Response.json({ error: "bad_request" }, { status: 400 });
    const rows = await db
      .select({ slug: projects.slug })
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);
    if (!rows[0]) return Response.json({ error: "not_found" }, { status: 404 });
    path = getPathname({
      locale,
      href: { pathname: "/projects/[slug]", params: { slug: rows[0].slug } },
    });
  }

  (await draftMode()).enable();
  redirect(path);
}

// Exit is a POST form (never a prefetched Link): clears the cookie and goes
// back to the same path.
export async function POST(request: NextRequest) {
  (await draftMode()).disable();
  const form = await request.formData();
  redirect(safeReturnPath(form.get("path")));
}
