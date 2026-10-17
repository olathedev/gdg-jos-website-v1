import "server-only";
import postgres from "postgres";

// One shared client per server instance. `prepare: false` keeps it compatible
// with transaction-mode poolers (Supabase pooler on :6543, PgBouncer).
// Serverless instances can't close idle sockets while frozen, so each one holds few
// connections and lets them go fast: the pooler allows 200 clients across all instances.
const globalForDb = globalThis as unknown as { sql?: postgres.Sql };

export function db() {
  if (!process.env.DATABASE_URL) throw new ConfigError("DATABASE_URL is not set");
  globalForDb.sql ??= postgres(process.env.DATABASE_URL, { prepare: false, max: 2, idle_timeout: 5, max_lifetime: 60, connect_timeout: 10 });
  return globalForDb.sql;
}

export class ConfigError extends Error {}
