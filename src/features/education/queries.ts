// Public reads of education. Cores take explicit arguments (and are the Plan B
// seam); the cached wrapper never reads the locale, the page applies
// localized() afterwards. The CV builder calls the core with includeDrafts.
import { and, asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { draftMode } from "next/headers";
import { db } from "@/db";
import type { Db } from "@/db/client";
import { education } from "@/db/schema";
import { tags } from "@/lib/cache-tags";
import { applyDraft, stripDraft } from "@/lib/draft";

type Opts = { includeDrafts: boolean };

export function educationQuery(handle: Db, { includeDrafts }: Opts) {
  const base = handle.select().from(education);
  return (
    includeDrafts
      ? base
      : base.where(
          and(eq(education.status, "published"), eq(education.visible, true)),
        )
  ).orderBy(asc(education.order));
}

// Public reads never carry `draft`; Draft Mode overlays it on the columns.
export async function getEducationCore(opts: Opts) {
  const rows = await educationQuery(db, opts);
  return rows.map((row) =>
    opts.includeDrafts ? applyDraft(row) : stripDraft(row),
  );
}

export async function getEducation() {
  "use cache";
  cacheTag(tags.education);
  cacheLife("max");
  const { isEnabled } = await draftMode();
  return getEducationCore({ includeDrafts: isEnabled });
}
