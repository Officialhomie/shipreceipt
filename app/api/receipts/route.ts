import { NextResponse } from "next/server";
import { z } from "zod";
import { getEvidenceRepository } from "@/lib/persistence/repository";

const metadataSchema = z.object({ receiptId: z.string().regex(/^\d+$/), evidenceId: z.string().uuid(), transactionHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/), contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/) });

export async function POST(request: Request) {
  try {
    const metadata = metadataSchema.parse(await request.json());
    await getEvidenceRepository().saveReceiptMetadata(metadata as typeof metadata & { transactionHash: `0x${string}`; contractAddress: `0x${string}` });
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("receipt_metadata_failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Receipt metadata could not be saved" }, { status: 400 });
  }
}

