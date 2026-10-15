// Applies db/schema.sql (or the SQL file given as an argument) to DATABASE_URL.
// Usage: npm run db:migrate · npm run db:seed-quest
import { readFile } from "node:fs/promises";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (add it to .env.local)");
  process.exit(1);
}
const sql = postgres(url, { prepare: false, max: 1, onnotice: () => {} });
try {
  const file = process.argv[2];
  await sql.unsafe(await readFile(file ? file : new URL("../db/schema.sql", import.meta.url), "utf8"));
  console.log(file ? `Applied ${file}.` : "Database schema is up to date.");
} finally {
  await sql.end();
}
