import {
  createPublicClient,
  getAddress,
  http,
  keccak256,
  parseEventLogs,
  toBytes,
} from "viem";
import type { EvidenceRecord, ReceiptMetadata } from "@/lib/persistence/repository";
import { monadTestnet } from "@/lib/config/monad";
import { registryAbi } from "./registry";

export class ReceiptValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReceiptValidationError";
  }
}

export async function validateReceiptMetadata(
  metadata: ReceiptMetadata,
  record: EvidenceRecord,
): Promise<void> {
  const configuredAddress = process.env.NEXT_PUBLIC_SHIPRECEIPT_CONTRACT_ADDRESS;
  if (!configuredAddress) {
    throw new ReceiptValidationError("Receipt registry is not configured");
  }
  if (getAddress(metadata.contractAddress) !== getAddress(configuredAddress)) {
    throw new ReceiptValidationError("Receipt contract does not match the configured registry");
  }

  const commit = record.evidence.project.commit;
  if (!commit) throw new ReceiptValidationError("Evidence has no selected commit");

  const rpcUrl =
    process.env.MONAD_RPC_URL ||
    process.env.NEXT_PUBLIC_MONAD_RPC_URL ||
    "https://testnet-rpc.monad.xyz";
  const client = createPublicClient({ chain: monadTestnet, transport: http(rpcUrl) });
  const receiptId = BigInt(metadata.receiptId);
  const [stored, transaction] = await Promise.all([
    client.readContract({
      address: metadata.contractAddress,
      abi: registryAbi,
      functionName: "getReceipt",
      args: [receiptId],
    }),
    client.getTransactionReceipt({ hash: metadata.transactionHash }),
  ]);

  const expectedStatus =
    record.evidence.summary.status === "verified"
      ? 2
      : record.evidence.summary.status === "partial"
        ? 1
        : 0;
  const expectedProjectId = keccak256(toBytes(record.evidence.project.repository));
  const expectedCommitHash = keccak256(toBytes(commit));
  const expectedDeploymentHash = keccak256(toBytes(record.evidence.deployment.url));

  if (
    stored.projectId.toLowerCase() !== expectedProjectId.toLowerCase() ||
    stored.commitHash.toLowerCase() !== expectedCommitHash.toLowerCase() ||
    stored.deploymentHash.toLowerCase() !== expectedDeploymentHash.toLowerCase() ||
    stored.evidenceRoot.toLowerCase() !== record.evidenceRoot.toLowerCase() ||
    Number(stored.passedChecks) !== record.evidence.summary.passed ||
    Number(stored.totalChecks) !== record.evidence.summary.total ||
    Number(stored.status) !== expectedStatus
  ) {
    throw new ReceiptValidationError("Onchain receipt does not match the supplied evidence");
  }

  if (
    transaction.status !== "success" ||
    !transaction.to ||
    getAddress(transaction.to) !== getAddress(metadata.contractAddress)
  ) {
    throw new ReceiptValidationError("Receipt transaction was not a successful registry call");
  }

  const events = parseEventLogs({
    abi: registryAbi,
    eventName: "ReceiptIssued",
    logs: transaction.logs,
  });
  const event = events.find((entry) => entry.args.receiptId === receiptId);
  if (
    !event ||
    event.args.projectId.toLowerCase() !== expectedProjectId.toLowerCase() ||
    event.args.commitHash.toLowerCase() !== expectedCommitHash.toLowerCase() ||
    Number(event.args.status) !== expectedStatus ||
    event.args.evidenceRoot.toLowerCase() !== record.evidenceRoot.toLowerCase()
  ) {
    throw new ReceiptValidationError("ReceiptIssued event does not match the supplied evidence");
  }
}
