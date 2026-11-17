import { z } from "zod";

// Zod mirror of the JSON Resume schema (resume-schema master, draft-07) for the
// sections we emit. Loose objects: the upstream schema allows extra properties.
export const ISO8601_PATTERN =
  /^([1-2][0-9]{3}-[0-1][0-9]-[0-3][0-9]|[1-2][0-9]{3}-[0-1][0-9]|[1-2][0-9]{3})$/;

const date = z.string().regex(ISO8601_PATTERN);
const text = z.string().min(1);

export const jsonResumeSchema = z.looseObject({
  basics: z.looseObject({
    name: text,
    label: z.string().optional(),
    email: z.email().optional(),
    url: z.url().optional(),
    summary: z.string().optional(),
    location: z
      .looseObject({
        city: z.string().optional(),
        region: z.string().optional(),
        countryCode: z.string().optional(),
      })
      .optional(),
    profiles: z
      .array(z.looseObject({ network: text, url: z.url() }))
      .optional(),
  }),
  work: z
    .array(
      z.looseObject({
        name: text,
        position: z.string().optional(),
        location: z.string().optional(),
        startDate: date.optional(),
        endDate: date.optional(),
        highlights: z.array(text).optional(),
      }),
    )
    .optional(),
  education: z
    .array(
      z.looseObject({
        institution: text,
        area: z.string().optional(),
        studyType: z.string().optional(),
        startDate: date.optional(),
        endDate: date.optional(),
      }),
    )
    .optional(),
  skills: z
    .array(
      z.looseObject({
        name: text,
        level: z.string().optional(),
        keywords: z.array(text).optional(),
      }),
    )
    .optional(),
  languages: z
    .array(z.looseObject({ language: text, fluency: z.string().optional() }))
    .optional(),
  projects: z
    .array(
      z.looseObject({
        name: text,
        description: z.string().optional(),
        url: z.url().optional(),
        highlights: z.array(text).optional(),
        keywords: z.array(text).optional(),
        startDate: date.optional(),
        endDate: date.optional(),
      }),
    )
    .optional(),
  meta: z
    .looseObject({
      canonical: z.url().optional(),
      version: z.string().optional(),
      lastModified: z.string().optional(),
    })
    .optional(),
});

export type JsonResume = z.infer<typeof jsonResumeSchema>;
