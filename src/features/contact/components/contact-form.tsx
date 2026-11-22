"use client";

import "@/lib/zod-jitless";
import { zodResolver } from "@hookform/resolvers/zod";
import { Fragment, useEffect, useRef, useState, useTransition } from "react";
import { useForm, useFormState } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContact } from "../public-actions";
import { contactSchema } from "../validation";

type ErrorCode =
  | "nameRequired"
  | "emailInvalid"
  | "messageShort"
  | "messageLong";

export type ContactFormLabels = {
  name: string;
  email: string;
  message: string;
  honeypot: string;
  send: string;
  sending: string;
  confirmation: string;
  // Raw strings; {email} is replaced by a mailto link.
  errors: Record<ErrorCode | "rateLimited" | "unavailable", string>;
};

type FormInput = z.input<typeof contactSchema>;
type FormOutput = z.output<typeof contactSchema>;

function WithMailto({ text, email }: { text: string; email: string }) {
  const parts = text.split("{email}");
  return parts.map((part, i) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: static split of a string
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 ? (
        <a href={`mailto:${email}`} className="underline underline-offset-4">
          {email}
        </a>
      ) : null}
    </Fragment>
  ));
}

export function ContactForm({
  locale,
  email,
  labels,
}: {
  locale: "en" | "es";
  email: string;
  labels: ContactFormLabels;
}) {
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<
    "rateLimited" | "unavailable" | null
  >(null);
  const [done, setDone] = useState(false);
  const startedAt = useRef(0);
  const confirmation = useRef<HTMLHeadingElement>(null);
  const { register, handleSubmit, control, setError } = useForm<
    FormInput,
    unknown,
    FormOutput
  >({
    resolver: zodResolver(contactSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      message: "",
      website: "",
      elapsedMs: 0,
      locale,
    },
  });
  const { errors } = useFormState({ control });

  useEffect(() => {
    startedAt.current = performance.now();
  }, []);
  useEffect(() => {
    if (done) confirmation.current?.focus();
  }, [done]);

  function onSubmit(values: FormOutput) {
    setFormError(null);
    const payload = {
      ...values,
      elapsedMs: Math.round(performance.now() - startedAt.current),
    };
    startTransition(async () => {
      const result = await submitContact(locale, payload);
      if (result.ok) {
        setDone(true);
        return;
      }
      if (result.error === "validation") {
        for (const [field, codes] of Object.entries(result.fieldErrors ?? {})) {
          if (field === "name" || field === "email" || field === "message") {
            setError(field, { message: codes[0] });
          }
        }
        return;
      }
      setFormError(
        result.error === "rate_limited" ? "rateLimited" : "unavailable",
      );
    });
  }

  if (done) {
    return (
      <div aria-live="polite">
        <h2
          ref={confirmation}
          tabIndex={-1}
          className="font-heading text-[25px] leading-tight outline-none"
        >
          {labels.confirmation}
        </h2>
      </div>
    );
  }

  const fieldError = (name: "name" | "email" | "message") => {
    const code = errors[name]?.message as ErrorCode | undefined;
    return code ? (labels.errors[code] ?? labels.errors.unavailable) : null;
  };

  const nameError = fieldError("name");
  const emailError = fieldError("email");
  const messageError = fieldError("message");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-name">{labels.name}</Label>
        <Input
          id="contact-name"
          autoComplete="name"
          aria-invalid={nameError ? true : undefined}
          aria-describedby={nameError ? "contact-name-error" : undefined}
          {...register("name")}
        />
        {nameError ? (
          <p id="contact-name-error" className="text-sm text-destructive">
            {nameError}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-email">{labels.email}</Label>
        <Input
          id="contact-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          aria-invalid={emailError ? true : undefined}
          aria-describedby={emailError ? "contact-email-error" : undefined}
          {...register("email")}
        />
        {emailError ? (
          <p id="contact-email-error" className="text-sm text-destructive">
            {emailError}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-message">{labels.message}</Label>
        <Textarea
          id="contact-message"
          className="min-h-40"
          aria-invalid={messageError ? true : undefined}
          aria-describedby={messageError ? "contact-message-error" : undefined}
          {...register("message")}
        />
        {messageError ? (
          <p id="contact-message-error" className="text-sm text-destructive">
            <WithMailto text={messageError} email={email} />
          </p>
        ) : null}
      </div>
      <div className="sr-only" aria-hidden="true">
        <label>
          {labels.honeypot}
          <input tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>
      {formError ? (
        <p role="alert" className="text-sm text-destructive">
          <WithMailto text={labels.errors[formError]} email={email} />
        </p>
      ) : null}
      <Button
        type="submit"
        size="lg"
        disabled={pending}
        aria-busy={pending}
        className="self-start"
      >
        {pending ? labels.sending : labels.send}
      </Button>
    </form>
  );
}
