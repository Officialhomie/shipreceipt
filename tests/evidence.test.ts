import { describe, expect, it } from "vitest";
import { canonicalizeEvidence, hashEvidence } from "@/lib/evidence/canonical";
import { evidenceSchema, type Evidence } from "@/lib/evidence/schema";

function evidence(): Evidence {
  return {
    version: "1",
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
        details: { branch: "main", size: 42 },
      },
    ],
    summary: { passed: 1, failed: 0, total: 1, status: "verified" },
  };
}

describe("canonical evidence", () => {
  it("produces the same hash for equivalent evidence", () => {
    expect(hashEvidence(evidence())).toBe(hashEvidence(structuredClone(evidence())));
  });

  it("changes the hash when evidence changes", () => {
    const changed = evidence();
    changed.project.name = "Another project";
    expect(hashEvidence(changed)).not.toBe(hashEvidence(evidence()));
  });

  it("is independent of object key insertion order", () => {
    const input = evidence();
    input.checks[0].details = { size: 42, branch: "main" };
    expect(canonicalizeEvidence(input)).toBe(canonicalizeEvidence(evidence()));
  });

  it("rejects malformed evidence", () => {
    expect(() => evidenceSchema.parse({ version: "1", checks: [] })).toThrow();
  });
});

