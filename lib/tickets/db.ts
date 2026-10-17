import "server-only";
import postgres from "postgres";

// One shared client per server instance. `prepare: false` keeps it compatible
// with transaction-mode poolers (Supabase pooler on :6543, PgBouncer).
// Serverless instances can't close idle sockets while frozen, so each one holds few
// connections and lets them go fast: the pooler allows 200 clients across all instances.
// `max_pipeline: 0` stops postgres.js stacking queries on a busy connection when more run
// at once than `max` (e.g. a page's Promise.all): through the pooler that hangs the connection.
// It's a real option that the typings leave out, hence the separate object.
const globalForDb = globalThis as unknown as { sql?: postgres.Sql };
const options = { prepare: false, max: 2, idle_timeout: 5, max_lifetime: 60, connect_timeout: 10, max_pipeline: 0 };

export function db() {
  if (!process.env.DATABASE_URL) throw new ConfigError("DATABASE_URL is not set");
  globalForDb.sql ??= postgres(process.env.DATABASE_URL, options);
  return globalForDb.sql;
}

export class ConfigError extends Error {}
