import type {
  VerificationCheck,
  VerificationStatus,
} from "@/lib/evidence/schema";

export function calculateStatus(
  checks: Pick<VerificationCheck, "id" | "status">[],
): VerificationStatus {
  if (checks.length === 0) return "failed";
  const repository = checks.find((check) => check.id === "repository");
  if (repository?.status === "failed") return "failed";

  const passed = checks.filter((check) => check.status === "passed").length;
  if (passed === checks.length) return "verified";
  if (passed === 0) return "failed";
  return "partial";
}

