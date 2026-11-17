import { getJsonResume } from "@/features/resume/json-resume";
import { jsonResumeSchema } from "@/features/resume/json-resume-schema";

// Public JSON Resume behind the /resume.json and /resume.es.json rewrites.
export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "es" }];
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string }> },
) {
  const { lang } = await params;
  if (lang !== "en" && lang !== "es") {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const json = await getJsonResume(lang);
  const parsed = jsonResumeSchema.safeParse(json);
  if (!parsed.success) {
    console.error("JSON Resume failed validation", parsed.error.issues);
    return Response.json({ error: "invalid_resume" }, { status: 500 });
  }
  return Response.json(json, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
