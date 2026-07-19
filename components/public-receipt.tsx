"use client";

import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { monadTestnet } from "@/lib/config/monad";
import { registryAbi } from "@/lib/monad/registry";
import { hashEvidence } from "@/lib/evidence/canonical";
import { evidenceSchema } from "@/lib/evidence/schema";
import {
  RECEIPT_ERROR_PRESENTATION,
  type ReceiptLoadErrorKind,
} from "@/lib/presentation/receipt";
import { ReceiptReport, type ReceiptReportData } from "./receipt-report";

interface ReceiptApiBody {
  error?: string;
  code?: string;
  metadata?: {
    transactionHash: `0x${string}`;
    contractAddress: `0x${string}`;
  };
  evidence?: {
    evidence: unknown;
    evidenceRoot: `0x${string}`;
  };
}

function apiErrorKind(status: number, code?: string): ReceiptLoadErrorKind {
  if (status === 404 || code === "EVIDENCE_NOT_FOUND" || code === "RECEIPT_NOT_FOUND") {
    return "evidence-unavailable";
  }
  if (status === 422 || code === "EVIDENCE_SCHEMA_UNSUPPORTED") return "schema";
  if (status === 503 || code?.includes("STORE")) return "database";
  return "unknown";
}

export function PublicReceipt({ receiptId }: { receiptId: string }) {
  const [data, setData] = useState<ReceiptReportData | null>(null);
  const [error, setError] = useState<ReceiptLoadErrorKind | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let body: ReceiptApiBody;
      try {
        const response = await fetch(`/api/receipts/${receiptId}`, { cache: "no-store" });
        body = (await response.json()) as ReceiptApiBody;
        if (!response.ok || !body.evidence || !body.metadata) {
          if (!cancelled) setError(apiErrorKind(response.status, body.code));
          return;
        }
      } catch {
        if (!cancelled) setError("database");
        return;
      }

      const parsed = evidenceSchema.safeParse(body.evidence.evidence);
      if (!parsed.success) {
        if (!cancelled) setError("schema");
        return;
      }

      const evidence = parsed.data;
      const contractAddress = body.metadata.contractAddress;
      const client = createPublicClient({
        chain: monadTestnet,
        transport: http(
          process.env.NEXT_PUBLIC_MONAD_RPC_URL || "https://testnet-rpc.monad.xyz",
        ),
      });

      try {
        const receipt = await client.readContract({
          address: contractAddress,
          abi: registryAbi,
          functionName: "getReceipt",
          args: [BigInt(receiptId)],
        });
        const latestReceiptId = await client.readContract({
          address: contractAddress,
          abi: registryAbi,
          functionName: "latestReceiptIds",
          args: [receipt.projectId],
        });
        const computed = hashEvidence(evidence);
        const integrity =
          computed.toLowerCase() === receipt.evidenceRoot.toLowerCase() &&
          computed.toLowerCase() === body.evidence.evidenceRoot.toLowerCase()
            ? "valid"
            : "invalid";
        if (!cancelled) {
          document.title = `ShipReceipt #${receiptId} — ${["Failed", "Partial", "Verified", "Revoked"][receipt.status]} Build Receipt`;
          setData({
            evidence,
            evidenceRoot: receipt.evidenceRoot,
            storedEvidenceRoot: body.evidence.evidenceRoot,
            transactionHash: body.metadata.transactionHash,
            contractAddress,
            issuer: receipt.issuer,
            projectId: receipt.projectId,
            verifiedAt: receipt.verifiedAt,
            status: receipt.status as 0 | 1 | 2 | 3,
            passed: receipt.passedChecks,
            total: receipt.totalChecks,
            integrity,
            latestReceiptId,
          });
        }
      } catch {
        if (!cancelled) setError("rpc");
      }
    })();
    return () => { cancelled = true; };
  }, [receiptId]);

  if (error) {
    const presentation = RECEIPT_ERROR_PRESENTATION[error];
    return <div className="panel receipt-error" role="alert"><strong>{presentation.label}</strong><p>{presentation.description}</p></div>;
  }
  if (!data) return <div className="panel progress" aria-live="polite"><span className="spinner" />Reading stored evidence and the Monad receipt…</div>;

  return <ReceiptReport receiptId={receiptId} data={data} explorer={process.env.NEXT_PUBLIC_MONAD_EXPLORER_URL || "https://testnet.monadvision.com"} />;
}
