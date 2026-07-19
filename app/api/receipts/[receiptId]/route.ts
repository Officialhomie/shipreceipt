import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getEvidenceRepository } from "@/lib/persistence/repository";

export async function GET(_request: Request, context: { params: Promise<{ receiptId: string }> }) {
  try {
    const { receiptId } = await context.params;
    if (!/^\d+$/.test(receiptId)) {
      return NextResponse.json(
        { error: "Receipt ID is invalid", code: "INVALID_RECEIPT_ID" },
        { status: 400 },
      );
    }
    const metadata = await getEvidenceRepository().getReceiptMetadata(receiptId);
    if (!metadata) {
      return NextResponse.json(
        { error: "Receipt metadata not found", code: "RECEIPT_NOT_FOUND" },
        { status: 404 },
      );
    }
    const evidence = await getEvidenceRepository().getEvidence(metadata.evidenceId);
    if (!evidence) {
      return NextResponse.json(
        { error: "Stored evidence for this receipt is unavailable", code: "EVIDENCE_NOT_FOUND" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { metadata, evidence },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Stored evidence uses an unsupported schema", code: "EVIDENCE_SCHEMA_UNSUPPORTED" },
        { status: 422 },
      );
    }
    console.error("receipt_read_failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      { error: "Receipt store is temporarily unavailable", code: "RECEIPT_STORE_UNAVAILABLE" },
      { status: 503 },
    );
  }
}
