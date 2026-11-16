import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  let resolved = locale;
  if (!resolved) {
    const param = await rootParams.locale();
    // Undefined means the admin root layout (no [locale] segment): Spanish UI.
    if (param === undefined) resolved = "es";
    else if (hasLocale(routing.locales, param)) resolved = param;
    else notFound();
  }
  return {
    locale: resolved,
    timeZone: "America/Bogota",
    messages: (await import(`../../messages/${resolved}.json`)).default,
  };
});
