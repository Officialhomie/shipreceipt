import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { evidenceSchema, type Evidence } from "@/lib/evidence/schema";
import { ReceiptReport, type ReceiptReportData } from "@/components/receipt-report";
import { RECEIPT_ERROR_PRESENTATION } from "@/lib/presentation/receipt";

const evidence: Evidence = {
  version: "2",
  schemaVersion: "2",
  verifierVersion: "0.2.0",
  project: {
    name: "ShipReceipt",
    repository: "https://github.com/example/shipreceipt",
    owner: "example",
    repo: "shipreceipt",
    commit: "a".repeat(40),
    commitTimestamp: "2026-07-18T10:00:00.000Z",
  },
  deployment: {
    url: "https://shipreceipt.example/",
    checkedAt: "2026-07-18T10:01:00.000Z",
  },
  network: { name: "Monad Testnet", chainId: 10143, contractAddress: null },
  checks: [
    {
      id: "repository",
      type: "repository",
      status: "passed",
      startedAt: "2026-07-18T10:00:00.000Z",
      completedAt: "2026-07-18T10:00:00.100Z",
      durationMs: 100,
      summary: "Repository resolved",
      details: { observationSource: "independent" },
    },
    {
      id: "health",
      type: "http",
      status: "failed",
      startedAt: "2026-07-18T10:00:00.000Z",
      completedAt: "2026-07-18T10:00:00.100Z",
      durationMs: 100,
      summary: "Health endpoint returned HTTP 503",
      details: { observationSource: "project-reported" },
    },
  ],
  summary: { passed: 1, failed: 1, total: 2, status: "partial" },
};

function html(overrides: Partial<ReceiptReportData> = {}) {
  const data: ReceiptReportData = {
    evidence,
    evidenceRoot: `0x${"1".repeat(64)}`,
    storedEvidenceRoot: `0x${"1".repeat(64)}`,
    transactionHash: `0x${"2".repeat(64)}`,
    contractAddress: "0xAa2F6E23E54125C3B6414BD722db54cC0Ef252E3",
    issuer: "0x84752F9589eA3698bb879b3C4112C110ecb9fA65",
    projectId: `0x${"3".repeat(64)}`,
    verifiedAt: BigInt(1),
    status: 1,
    passed: 1,
    total: 2,
    integrity: "valid",
    latestReceiptId: BigInt(2),
    ...overrides,
  };
  return renderToStaticMarkup(<ReceiptReport receiptId="1" data={data} explorer="https://testnet.monadvision.com" />);
}

describe("public receipt presentation", () => {
  it("shows status meaning, check categories, freshness, issuer, and scope", () => {
    const output = html();
    expect(output).toContain("Partial");
    expect(output).toContain("one or more configured checks failed");
    expect(output).toContain("Independently observed");
    expect(output).toContain("Project-reported");
    expect(output).toContain("Self-issued build verification");
    expect(output).toContain("Commit selected for verification");
    expect(output).toContain("Snapshot recorded on");
    expect(output).toContain("not a security audit");
    expect(output).toContain("View Receipt #2");
  });

  it("makes an evidence mismatch visually explicit", () => {
    expect(html({ integrity: "invalid" })).toContain("Evidence integrity: Invalid");
  });

  it("keeps legacy Receipt #1 evidence renderable", () => {
    const legacy = structuredClone(evidence) as Record<string, unknown>;
    legacy.version = "1";
    delete legacy.schemaVersion;
    delete legacy.verifierVersion;
    const output = html({ evidence: evidenceSchema.parse(legacy) });
    expect(output).toContain("Evidence schema v1");
    expect(output).toContain("legacy v1 verifier");
  });

  it("provides a distinct evidence-unavailable state", () => {
    expect(RECEIPT_ERROR_PRESENTATION["evidence-unavailable"]).toEqual({
      label: "Evidence unavailable",
      description: "The stored evidence for this receipt could not be found.",
    });
  });

  it.each([
    [0, "Failed", "minimum verification checks"],
    [2, "Verified", "All configured checks passed"],
    [3, "Revoked", "no longer considered active"],
  ] as const)("explains status %s", (status, label, description) => {
    const output = html({ status });
    expect(output).toContain(label);
    expect(output).toContain(description);
  });
});
