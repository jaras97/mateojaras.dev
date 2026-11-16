// Creates or re-hashes the single admin. Uses Better Auth's internal adapter
// (no public API creates users while sign-up is disabled); keep it in this one helper.
import type { betterAuth } from "better-auth";

type AuthInstance = ReturnType<typeof betterAuth>;

export async function ensureAdmin(
  auth: AuthInstance,
  { email, password, name }: { email: string; password: string; name: string },
): Promise<"created" | "updated"> {
  const ctx = await auth.$context;
  const hash = await ctx.password.hash(password);
  const found = await ctx.internalAdapter.findUserByEmail(email);
  if (found) {
    await ctx.internalAdapter.updatePassword(found.user.id, hash);
    return "updated";
  }
  // The second argument is only read when user.validateUserInfo is configured (it is not).
  const user = await ctx.internalAdapter.createUser(
    { email, name, emailVerified: true },
    { method: "email-password" } as never,
  );
  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: hash,
  });
  return "created";
}
