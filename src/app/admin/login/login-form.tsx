"use client";

import "./zod-jitless";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type LoginInput, loginSchema } from "@/features/auth/validation";
import { authClient } from "@/lib/auth-client";

export type LoginLabels = {
  email: string;
  password: string;
  submit: string;
  invalid: string;
  required: string;
};

export function LoginForm({ labels }: { labels: LoginLabels }) {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const { register, handleSubmit, control } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { errors, isSubmitting } = useFormState({ control });

  async function onSubmit(values: LoginInput) {
    setFailed(false);
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });
    if (error) {
      setFailed(true);
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">{labels.email}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
        {errors.email ? (
          <p id="email-error" className="text-sm text-destructive">
            {labels.required}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">{labels.password}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? "password-error" : undefined}
          {...register("password")}
        />
        {errors.password ? (
          <p id="password-error" className="text-sm text-destructive">
            {labels.required}
          </p>
        ) : null}
      </div>
      {failed ? (
        <p role="alert" className="text-sm text-destructive">
          {labels.invalid}
        </p>
      ) : null}
      <Button type="submit" disabled={isSubmitting}>
        {labels.submit}
      </Button>
    </form>
  );
}
