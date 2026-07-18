import { NextResponse } from "next/server";
import { z } from "zod";
import { getEvidenceRepository } from "@/lib/persistence/repository";

export async function GET(_request: Request, context: { params: Promise<{ receiptId: string }> }) {
  try {
    const { receiptId } = await context.params;
    z.string().regex(/^\d+$/).parse(receiptId);
    const metadata = await getEvidenceRepository().getReceiptMetadata(receiptId);
    if (!metadata) return NextResponse.json({ error: "Receipt metadata not found" }, { status: 404 });
    const evidence = await getEvidenceRepository().getEvidence(metadata.evidenceId);
    return NextResponse.json({ metadata, evidence });
  } catch {
    return NextResponse.json({ error: "Receipt metadata unavailable" }, { status: 400 });
  }
}

