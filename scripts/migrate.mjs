import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const connectionString = process.env.MIGRATION_DATABASE_URL;
if (!connectionString) {
  throw new Error("MIGRATION_DATABASE_URL is required for database migrations");
}

const migrationUrl = new URL("../db/migrations/001_initial.sql", import.meta.url);
const migration = await readFile(fileURLToPath(migrationUrl), "utf8");
const sql = postgres(connectionString, { max: 1 });

try {
  await sql.unsafe(migration);
  const [state] = await sql`
    select
      to_regclass('public.shipreceipt_evidence') is not null as evidence_table,
      to_regclass('public.shipreceipt_receipts') is not null as receipts_table
  `;
  if (!state?.evidence_table || !state?.receipts_table) {
    throw new Error("ShipReceipt migration completed without both required tables");
  }
  console.log("ShipReceipt database migration verified");
} finally {
  await sql.end();
}
