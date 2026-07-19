import { NextResponse } from "next/server";
import { z } from "zod";
import { getEvidenceRepository } from "@/lib/persistence/repository";
import { readBoundedJson, RequestBodyTooLargeError } from "@/lib/http/body";
import {
  ReceiptValidationError,
  validateReceiptMetadata,
} from "@/lib/monad/receipt-validation";
import { assertRateLimit } from "@/lib/verification/rate-limit";

const metadataSchema = z.object({ receiptId: z.string().regex(/^\d+$/), evidenceId: z.string().uuid(), transactionHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/), contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/) });

export async function POST(request: Request) {
  try {
    assertRateLimit(request.headers.get("x-forwarded-for")?.split(",")[0] || "local-receipt");
    const metadata = metadataSchema.parse(await readBoundedJson(request, 4_096)) as z.infer<
      typeof metadataSchema
    > & { transactionHash: `0x${string}`; contractAddress: `0x${string}` };
    const repository = getEvidenceRepository();
    const evidence = await repository.getEvidence(metadata.evidenceId);
    if (!evidence) {
      return NextResponse.json(
        { error: "Receipt evidence was not found", code: "EVIDENCE_NOT_FOUND" },
        { status: 404 },
      );
    }
    await validateReceiptMetadata(metadata, evidence);
    await repository.saveReceiptMetadata(metadata);
    return NextResponse.json({ saved: true });
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return NextResponse.json({ error: error.message }, { status: 413 });
    }
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Receipt metadata request is invalid", code: "INVALID_RECEIPT_METADATA" },
        { status: 400 },
      );
    }
    if (error instanceof ReceiptValidationError) {
      return NextResponse.json(
        { error: error.message, code: "RECEIPT_MISMATCH" },
        { status: 422 },
      );
    }
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return NextResponse.json({ error: "Too many receipt requests" }, { status: 429 });
    }
    console.error("receipt_metadata_failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      { error: "Receipt metadata could not be verified or saved", code: "RECEIPT_SERVICE_UNAVAILABLE" },
      { status: 503 },
    );
  }
}
