import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required for the database readiness check");
}

const sql = postgres(connectionString, { max: 1 });

try {
  const [state] = await sql`
    select
      current_user as role,
      current_database() as database,
      to_regclass('public.shipreceipt_evidence') is not null as evidence_table,
      to_regclass('public.shipreceipt_receipts') is not null as receipts_table,
      has_schema_privilege(current_user, 'public', 'CREATE') as schema_create,
      has_table_privilege(current_user, 'public.shipreceipt_evidence', 'SELECT') as evidence_select,
      has_table_privilege(current_user, 'public.shipreceipt_evidence', 'INSERT') as evidence_insert,
      has_table_privilege(current_user, 'public.shipreceipt_receipts', 'SELECT') as receipt_select,
      has_table_privilege(current_user, 'public.shipreceipt_receipts', 'INSERT') as receipt_insert,
      has_table_privilege(current_user, 'public.shipreceipt_receipts', 'UPDATE') as receipt_update
  `;

  const ready =
    state?.evidence_table &&
    state?.receipts_table &&
    !state?.schema_create &&
    state?.evidence_select &&
    state?.evidence_insert &&
    state?.receipt_select &&
    state?.receipt_insert &&
    state?.receipt_update;

  if (!ready) {
    throw new Error(`ShipReceipt database permissions are not ready: ${JSON.stringify(state)}`);
  }

  console.log(
    JSON.stringify(
      {
        role: state.role,
        database: state.database,
        tables: ["shipreceipt_evidence", "shipreceipt_receipts"],
        schemaCreate: state.schema_create,
        applicationPrivileges: "verified",
      },
      null,
      2,
    ),
  );
} finally {
  await sql.end();
}
