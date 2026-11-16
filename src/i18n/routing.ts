import { defineRouting } from "next-intl/routing";
import { locales } from "@/lib/locale";

// `/` is always English: no Accept-Language detection and no NEXT_LOCALE cookie.
export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeDetection: false,
  localeCookie: false,
  pathnames: {
    "/": "/",
    "/projects/[slug]": { en: "/projects/[slug]", es: "/proyectos/[slug]" },
  },
});
