import { connection } from "next/server";
import { getLatestResume } from "@/features/resume/queries";

// Public. Streams the latest stored PDF of one locale from Blob. The upstream
// URL comes from the database row, never from the request.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string }> },
) {
  await connection();
  const { lang } = await params;
  if (lang !== "en" && lang !== "es") {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const row = await getLatestResume(lang);
  if (!row) return Response.json({ error: "not_found" }, { status: 404 });

  const upstream = await fetch(row.pdfUrl);
  if (!upstream.ok || !upstream.body) {
    return Response.json({ error: "bad_gateway" }, { status: 502 });
  }

  const length = upstream.headers.get("content-length");
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="mateo-jaramillo-cv-${lang}.pdf"`,
      "Cache-Control": "public, max-age=0, must-revalidate",
      ...(length ? { "Content-Length": length } : {}),
    },
  });
}
