import { neon } from "@neondatabase/serverless";

// Specs run their own queries inline with this client. It points at whatever
// DATABASE_URL names (the Neon dev branch for e2e); specs skip without it.
export const sql = neon(process.env.DATABASE_URL ?? "");

export async function firstPublishedProject() {
  const rows = (await sql`
    select id, slug, title_es as "titleEs"
    from projects
    where status = 'published' and visible = true
    order by "order" asc
    limit 1
  `) as { id: string; slug: string; titleEs: string }[];
  return rows[0];
}
