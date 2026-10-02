import "server-only";
import postgres from "postgres";

// One shared client per server instance. `prepare: false` keeps it compatible
// with transaction-mode poolers (Supabase pooler on :6543, PgBouncer).
const globalForDb = globalThis as unknown as { sql?: postgres.Sql };

export function db() {
  if (!process.env.DATABASE_URL) throw new ConfigError("DATABASE_URL is not set");
  globalForDb.sql ??= postgres(process.env.DATABASE_URL, { prepare: false, max: 5, idle_timeout: 20 });
  return globalForDb.sql;
}

export class ConfigError extends Error {}
