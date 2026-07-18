import { NextResponse } from "next/server";
import { z } from "zod";
import { getEvidenceRepository } from "@/lib/persistence/repository";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const parsedId = z.string().uuid().parse(id);
    const record = await getEvidenceRepository().getEvidence(parsedId);
    if (!record) return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
    return NextResponse.json(record);
  } catch {
    return NextResponse.json({ error: "Evidence unavailable" }, { status: 400 });
  }
}
