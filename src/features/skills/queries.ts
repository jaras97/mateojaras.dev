// Public reads of skills. The cached wrapper never reads the locale (skills
// have no localized columns). The CV builder calls the core with includeDrafts.
import { and, asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { draftMode } from "next/headers";
import { db } from "@/db";
import type { Db } from "@/db/client";
import { skills } from "@/db/schema";
import { tags } from "@/lib/cache-tags";
import { applyDraft, stripDraft } from "@/lib/draft";

type Opts = { includeDrafts: boolean };

export function skillsQuery(handle: Db, { includeDrafts }: Opts) {
  const base = handle.select().from(skills);
  return (
    includeDrafts
      ? base
      : base.where(
          and(eq(skills.status, "published"), eq(skills.visible, true)),
        )
  ).orderBy(asc(skills.category), asc(skills.order));
}

// Public reads never carry `draft`; Draft Mode overlays it on the columns.
export async function getSkillsCore(opts: Opts) {
  const rows = await skillsQuery(db, opts);
  return rows.map((row) =>
    opts.includeDrafts ? applyDraft(row) : stripDraft(row),
  );
}

export async function getSkills() {
  "use cache";
  cacheTag(tags.skills);
  cacheLife("max");
  const { isEnabled } = await draftMode();
  return getSkillsCore({ includeDrafts: isEnabled });
}
