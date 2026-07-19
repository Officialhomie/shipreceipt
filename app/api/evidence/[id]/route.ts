import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { getEvidenceRepository } from "@/lib/persistence/repository";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const parsedId = z.string().uuid().safeParse(id);
    if (!parsedId.success) {
      return NextResponse.json(
        { error: "Evidence ID is invalid", code: "INVALID_EVIDENCE_ID" },
        { status: 400 },
      );
    }
    const record = await getEvidenceRepository().getEvidence(parsedId.data);
    if (!record) {
      return NextResponse.json(
        { error: "Evidence not found", code: "EVIDENCE_NOT_FOUND" },
        { status: 404 },
      );
    }
    return NextResponse.json(record, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Stored evidence uses an unsupported schema", code: "EVIDENCE_SCHEMA_UNSUPPORTED" },
        { status: 422 },
      );
    }
    console.error("evidence_read_failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      { error: "Evidence store is temporarily unavailable", code: "EVIDENCE_STORE_UNAVAILABLE" },
      { status: 503 },
    );
  }
}
