import type { VerificationCheck, VerificationStatus } from "@/lib/evidence/schema";

export const SELF_ISSUED_LABEL = "Self-issued build verification";
export const SELF_ISSUED_EXPLANATION =
  "This receipt was issued by the project owner or connected wallet. It is a tamper-evident record of selected checks, not an independent security audit.";
export const RECEIPT_SCOPE_DISCLAIMER =
  "ShipReceipt verifies selected technical checks at a recorded time. It is not a security audit, independent certification, or guarantee of future availability.";
export const PROJECT_REPORTED_EXPLANATION =
  "Project-reported endpoints are controlled by the application being checked. ShipReceipt records their response but does not independently guarantee that the endpoint reflects every internal dependency.";

export const STATUS_PRESENTATION = {
  0: {
    label: "Failed",
    icon: "×",
    description: "The build could not satisfy the minimum verification checks.",
  },
  1: {
    label: "Partial",
    icon: "!",
    description: "The build is reachable, but one or more configured checks failed.",
  },
  2: {
    label: "Verified",
    icon: "✓",
    description: "All configured checks passed at the recorded time.",
  },
  3: {
    label: "Revoked",
    icon: "–",
    description:
      "This receipt remains part of the public history but is no longer considered active by its issuer.",
  },
} as const;

export type OnchainStatus = keyof typeof STATUS_PRESENTATION;
export type IntegrityState = "valid" | "invalid";

export function evidenceStatusCode(status: VerificationStatus): 0 | 1 | 2 {
  if (status === "verified") return 2;
  if (status === "partial") return 1;
  return 0;
}

export function checkObservation(check: Pick<VerificationCheck, "id">): {
  label: "Independently observed" | "Project-reported";
  kind: "independent" | "project-reported";
} {
  return check.id === "health" || check.id === "readiness"
    ? { label: "Project-reported", kind: "project-reported" }
    : { label: "Independently observed", kind: "independent" };
}

export function formatRelativeAge(input: string | Date, now = new Date()): string {
  const timestamp = new Date(input).getTime();
  if (!Number.isFinite(timestamp)) return "Recorded time unavailable";
  const seconds = Math.max(0, Math.floor((now.getTime() - timestamp) / 1000));
  if (seconds < 60) return "Checked less than a minute ago";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Checked ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Checked ${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `Checked ${days} day${days === 1 ? "" : "s"} ago`;
}

export function formatSnapshotTimestamp(input: string | Date): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "Snapshot time unavailable";
  return `Snapshot recorded on ${new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(date)}`;
}

export const INTEGRITY_PRESENTATION = {
  valid: {
    label: "Evidence integrity: Valid",
    description: "The stored evidence matches the evidence root recorded on Monad.",
  },
  invalid: {
    label: "Evidence integrity: Invalid",
    description: "The available evidence does not match the evidence root recorded on Monad.",
  },
} as const;

export type ReceiptLoadErrorKind =
  | "evidence-unavailable"
  | "database"
  | "rpc"
  | "schema"
  | "unknown";

export const RECEIPT_ERROR_PRESENTATION: Record<
  ReceiptLoadErrorKind,
  { label: string; description: string }
> = {
  "evidence-unavailable": {
    label: "Evidence unavailable",
    description: "The stored evidence for this receipt could not be found.",
  },
  database: {
    label: "Evidence unavailable",
    description: "The evidence store is temporarily unavailable. The onchain receipt is unchanged.",
  },
  rpc: {
    label: "Monad read unavailable",
    description: "The receipt could not be read from Monad right now. Evidence was not marked invalid.",
  },
  schema: {
    label: "Evidence unavailable",
    description: "The stored evidence does not match a supported ShipReceipt schema.",
  },
  unknown: {
    label: "Receipt unavailable",
    description: "The receipt could not be loaded. Try again in a moment.",
  },
};
