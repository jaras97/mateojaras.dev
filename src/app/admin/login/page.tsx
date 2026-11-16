import { getTranslations } from "next-intl/server";
import { LoginForm } from "./login-form";

// No redirect on cookie presence: a stale cookie must not loop (Pitfall 8).
export default async function LoginPage() {
  const t = await getTranslations({ locale: "es", namespace: "Admin.login" });
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-6 py-16">
      <h1 className="font-heading text-3xl font-semibold tracking-display">
        {t("title")}
      </h1>
      <LoginForm
        labels={{
          email: t("email"),
          password: t("password"),
          submit: t("submit"),
          invalid: t("invalid"),
          required: t("required"),
        }}
      />
    </main>
  );
}
