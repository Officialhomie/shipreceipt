import { describe, expect, it } from "vitest";
import { calculateStatus } from "@/lib/verification/status";
import { verificationInputSchema } from "@/lib/schemas/verification";

describe("verification status", () => {
  it("returns verified only when every check passes", () => {
    expect(calculateStatus([{ id: "repository", status: "passed" }, { id: "deployment", status: "passed" }])).toBe("verified");
  });
  it("returns partial when meaningful checks are mixed", () => {
    expect(calculateStatus([{ id: "repository", status: "passed" }, { id: "readiness", status: "failed" }])).toBe("partial");
  });
  it("returns failed when repository resolution fails", () => {
    expect(calculateStatus([{ id: "repository", status: "failed" }, { id: "deployment", status: "passed" }])).toBe("failed");
  });
});

describe("verification request schema", () => {
  const valid = {
    projectName: "ShipReceipt",
    repositoryUrl: "https://github.com/example/shipreceipt",
    deploymentUrl: "https://example.com",
    chainId: 10143 as const,
  };
  it("accepts the minimal valid request", () => expect(verificationInputSchema.parse(valid)).toMatchObject(valid));
  it("rejects the wrong chain", () => expect(() => verificationInputSchema.parse({ ...valid, chainId: 1 })).toThrow());
  it("rejects an invalid contract address", () => expect(() => verificationInputSchema.parse({ ...valid, contractAddress: "0x1234" })).toThrow());
});
