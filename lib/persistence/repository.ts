import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { evidenceSchema, type Evidence } from "@/lib/evidence/schema";
import { hashEvidence } from "@/lib/evidence/canonical";

export interface EvidenceRecord {
  id: string;
  evidence: Evidence;
  evidenceRoot: `0x${string}`;
  location: string;
}

export interface ReceiptMetadata {
  receiptId: string;
  evidenceId: string;
  transactionHash: `0x${string}`;
  contractAddress: `0x${string}`;
}

export interface EvidenceRepository {
  saveEvidence(evidence: Evidence): Promise<EvidenceRecord>;
  getEvidence(id: string): Promise<EvidenceRecord | null>;
  saveReceiptMetadata(metadata: ReceiptMetadata): Promise<void>;
  getReceiptMetadata(receiptId: string): Promise<ReceiptMetadata | null>;
}

const memoryEvidence = new Map<string, EvidenceRecord>();
const memoryReceipts = new Map<string, ReceiptMetadata>();

class DevelopmentMemoryRepository implements EvidenceRepository {
  async saveEvidence(evidence: Evidence): Promise<EvidenceRecord> {
    const id = randomUUID();
    const record: EvidenceRecord = {
      id,
      evidence: evidenceSchema.parse(evidence),
      evidenceRoot: hashEvidence(evidence),
      location: `memory://${id}`,
    };
    memoryEvidence.set(id, record);
    return record;
  }
  async getEvidence(id: string) { return memoryEvidence.get(id) || null; }
  async saveReceiptMetadata(metadata: ReceiptMetadata) { memoryReceipts.set(metadata.receiptId, metadata); }
  async getReceiptMetadata(receiptId: string) { return memoryReceipts.get(receiptId) || null; }
}

class PostgresEvidenceRepository implements EvidenceRepository {
  private sql;
  private initialized: Promise<void> | null = null;

  constructor(connectionString: string) {
    this.sql = postgres(connectionString, { max: 3, idle_timeout: 20 });
  }

  private ensureSchema(): Promise<void> {
    if (!this.initialized) {
      this.initialized = (async () => {
        const [state] = await this.sql`
          select
            to_regclass('public.shipreceipt_evidence') is not null as evidence_table,
            to_regclass('public.shipreceipt_receipts') is not null as receipts_table
        `;
        if (!state?.evidence_table || !state?.receipts_table) {
          throw new Error("ShipReceipt database migrations have not been applied");
        }
      })();
    }
    return this.initialized;
  }

  async saveEvidence(evidence: Evidence): Promise<EvidenceRecord> {
    await this.ensureSchema();
    const id = randomUUID();
    const parsed = evidenceSchema.parse(evidence);
    const evidenceRoot = hashEvidence(parsed);
    await this.sql`insert into shipreceipt_evidence (id, evidence, evidence_root)
      values (${id}, ${this.sql.json(JSON.parse(JSON.stringify(parsed)))}, ${evidenceRoot})`;
    return { id, evidence: parsed, evidenceRoot, location: `postgres://${id}` };
  }

  async getEvidence(id: string): Promise<EvidenceRecord | null> {
    await this.ensureSchema();
    const rows = await this.sql`select id, evidence, evidence_root from shipreceipt_evidence where id = ${id}`;
    const row = rows[0];
    if (!row) return null;
    return {
      id: String(row.id),
      evidence: evidenceSchema.parse(row.evidence),
      evidenceRoot: String(row.evidence_root) as `0x${string}`,
      location: `postgres://${id}`,
    };
  }

  async saveReceiptMetadata(metadata: ReceiptMetadata): Promise<void> {
    await this.ensureSchema();
    await this.sql`insert into shipreceipt_receipts
      (receipt_id, evidence_id, transaction_hash, contract_address)
      values (${metadata.receiptId}, ${metadata.evidenceId}, ${metadata.transactionHash}, ${metadata.contractAddress})
      on conflict (receipt_id) do update set
        evidence_id = excluded.evidence_id,
        transaction_hash = excluded.transaction_hash,
        contract_address = excluded.contract_address`;
  }

  async getReceiptMetadata(receiptId: string): Promise<ReceiptMetadata | null> {
    await this.ensureSchema();
    const rows = await this.sql`select receipt_id, evidence_id, transaction_hash, contract_address
      from shipreceipt_receipts where receipt_id = ${receiptId}`;
    const row = rows[0];
    if (!row) return null;
    return {
      receiptId: String(row.receipt_id),
      evidenceId: String(row.evidence_id),
      transactionHash: String(row.transaction_hash) as `0x${string}`,
      contractAddress: String(row.contract_address) as `0x${string}`,
    };
  }
}

let repository: EvidenceRepository | null = null;

export function getEvidenceRepository(): EvidenceRepository {
  if (repository) return repository;
  if (process.env.DATABASE_URL) {
    repository = new PostgresEvidenceRepository(process.env.DATABASE_URL);
  } else if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required for durable evidence in production");
  } else {
    repository = new DevelopmentMemoryRepository();
  }
  return repository;
}
