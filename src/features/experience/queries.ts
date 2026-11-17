// Public reads of experience. Cores take explicit arguments (and are the Plan B
// seam); the cached wrapper never reads the locale, the page applies
// localized() afterwards. The CV builder calls the core with includeDrafts.
import { and, asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { draftMode } from "next/headers";
import { db } from "@/db";
import type { Db } from "@/db/client";
import { experiences } from "@/db/schema";
import { tags } from "@/lib/cache-tags";
import { applyDraft, stripDraft } from "@/lib/draft";

type Opts = { includeDrafts: boolean };

export function experiencesQuery(handle: Db, { includeDrafts }: Opts) {
  const base = handle.select().from(experiences);
  return (
    includeDrafts
      ? base
      : base.where(
          and(
            eq(experiences.status, "published"),
            eq(experiences.visible, true),
          ),
        )
  ).orderBy(asc(experiences.order));
}

// Public reads never carry `draft`; Draft Mode overlays it on the columns.
export async function getExperiencesCore(opts: Opts) {
  const rows = await experiencesQuery(db, opts);
  return rows.map((row) =>
    opts.includeDrafts ? applyDraft(row) : stripDraft(row),
  );
}

export async function getExperiences() {
  "use cache";
  cacheTag(tags.experience);
  cacheLife("max");
  const { isEnabled } = await draftMode();
  return getExperiencesCore({ includeDrafts: isEnabled });
}
