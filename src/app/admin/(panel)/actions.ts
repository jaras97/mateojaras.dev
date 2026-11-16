"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireSession } from "@/lib/dal";

// Guarded first: without a session it redirects and never reaches signOut.
export async function signOutAction() {
  await requireSession();
  await auth.api.signOut({ headers: await headers() });
  redirect("/admin/login");
}
