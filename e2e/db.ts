import { neon } from "@neondatabase/serverless";
import { isProductionTarget } from "./target";

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

export async function countProjects() {
  const rows = (await sql`select count(*)::int as n from projects`) as {
    n: number;
  }[];
  return rows[0].n;
}

export type OrderRow = {
  id: string;
  slug: string;
  titleEs: string;
  status: string;
  visible: boolean;
};

export async function projectOrder() {
  return (await sql`
    select id, slug, title_es as "titleEs", status, visible
    from projects
    order by "order" asc, id asc
  `) as OrderRow[];
}

export const TEMP_TITLE = "Proyecto temporal e2e";

// Test data only: a draft that never shows on the public site.
export async function insertTempProject() {
  if (isProductionTarget()) {
    throw new Error(
      "Refusing to write test data to production (e2e/target.ts)",
    );
  }
  const slug = `e2e-temp-${Date.now()}`;
  const rows = (await sql`
    insert into projects (slug, status, visible, "order", title_en, title_es)
    values (${slug}, 'draft', true, 999, ${TEMP_TITLE}, ${TEMP_TITLE})
    returning id
  `) as { id: string }[];
  return { id: rows[0].id, slug };
}

export async function deleteTempProjects() {
  if (isProductionTarget()) {
    throw new Error(
      "Refusing to write test data to production (e2e/target.ts)",
    );
  }
  await sql`delete from projects where slug like 'e2e-temp-%'`;
}
