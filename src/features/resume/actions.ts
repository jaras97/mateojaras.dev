"use server";

import { renderToBuffer } from "@react-pdf/renderer";
import { del, put } from "@vercel/blob";
import { max } from "drizzle-orm";
import { updateTag } from "next/cache";
import { db } from "@/db";
import { resumeVersions } from "@/db/schema";
import type { ActionResult } from "@/lib/action-result";
import { hasBlobToken } from "@/lib/blob";
import { tags } from "@/lib/cache-tags";
import { requireActionSession } from "@/lib/dal";
import { buildCvData } from "./cv-data";
import { CvDocument } from "./pdf/cv-document";
import { registerCvFonts } from "./pdf/fonts";

const LOCALES = ["en", "es"] as const;

function failure(error: unknown): Extract<ActionResult, { ok: false }> {
  console.error("generateCv failed", error);
  const motivo = error instanceof Error ? error.message : "error desconocido";
  return { ok: false, error: "server", fieldErrors: { motivo: [motivo] } };
}

// One click, both locales: render, upload, then insert both rows in one batch.
// Any failure before the insert writes nothing to the database.
export async function generateCv(): Promise<ActionResult<{ version: number }>> {
  const session = await requireActionSession();
  if (!session) return { ok: false, error: "session" };
  if (!hasBlobToken()) return { ok: false, error: "token" };

  const uploaded: string[] = [];
  try {
    const [last] = await db
      .select({ value: max(resumeVersions.version) })
      .from(resumeVersions);
    const version = (last?.value ?? 0) + 1;

    registerCvFonts();
    const buffers = await Promise.all(
      LOCALES.map(async (locale) => {
        const data = await buildCvData(locale);
        return renderToBuffer(CvDocument({ data }));
      }),
    );

    const urls: string[] = [];
    for (const [index, locale] of LOCALES.entries()) {
      const blob = await put(
        `resume/${locale}/v${version}.pdf`,
        buffers[index],
        {
          access: "public",
          contentType: "application/pdf",
          addRandomSuffix: true,
        },
      );
      uploaded.push(blob.url);
      urls.push(blob.url);
    }

    await db.batch([
      db
        .insert(resumeVersions)
        .values({ locale: "en", version, pdfUrl: urls[0] }),
      db
        .insert(resumeVersions)
        .values({ locale: "es", version, pdfUrl: urls[1] }),
    ]);
    updateTag(tags.resume);
    return { ok: true, savedAt: new Date().toISOString(), version };
  } catch (error) {
    // Orphaned files are removed best-effort; the history never lists them.
    if (uploaded.length > 0) {
      await del(uploaded).catch((e) => console.error("blob cleanup failed", e));
    }
    return failure(error);
  }
}
