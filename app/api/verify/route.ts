import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { verificationInputSchema } from "@/lib/schemas/verification";
import { verifyBuild } from "@/lib/verification/engine";
import { getEvidenceRepository } from "@/lib/persistence/repository";
import { assertRateLimit } from "@/lib/verification/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const contentLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > 16_384) {
      return NextResponse.json({ error: "Request body is too large" }, { status: 413 });
    }
    assertRateLimit(request.headers.get("x-forwarded-for")?.split(",")[0] || "local");
    const input = verificationInputSchema.parse(await request.json());
    const evidence = await verifyBuild(input);
    const record = await getEvidenceRepository().saveEvidence(evidence);
    return NextResponse.json({
      verificationId: record.id,
      evidenceId: record.id,
      persistence: record.location.startsWith("postgres:") ? "durable" : "development-memory",
      status: evidence.summary.status,
      evidence,
      evidenceRoot: record.evidenceRoot,
      passedChecks: evidence.summary.passed,
      failedChecks: evidence.summary.failed,
      totalChecks: evidence.summary.total,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid verification request", issues: error.issues }, { status: 400 });
    }
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return NextResponse.json({ error: "Too many verification requests" }, { status: 429 });
    }
    console.error("verification_failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Verification could not be completed" }, { status: 500 });
  }
}

