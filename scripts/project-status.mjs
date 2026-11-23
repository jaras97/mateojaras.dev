// Lists projects (slug, status, visible, order, filled-field counts) and can set one to draft.
// Usage: node scripts/project-status.mjs            -> list
//        node scripts/project-status.mjs draft SLUG -> status = 'draft'
// Loads .env.local internally; prints no secrets.
import { neon } from "@neondatabase/serverless";

process.loadEnvFile(".env.local");
const sql = neon(process.env.DATABASE_URL);

const [cmd, slug] = process.argv.slice(2);
if (cmd === "draft") {
  if (!slug) throw new Error("slug required");
  const rows = await sql`
    update projects set status = 'draft' where slug = ${slug}
    returning slug, status, visible`;
  console.log("updated", JSON.stringify(rows));
}
const rows = await sql`
  select slug, status, visible, "order",
    (tagline_en is not null and tagline_en <> '') as tagline,
    (problem_en is not null and problem_en <> '') as problem,
    (cover_image is not null) as cover
  from projects order by "order" asc, slug asc`;
console.table(rows);
