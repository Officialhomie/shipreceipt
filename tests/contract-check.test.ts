import { beforeEach, describe, expect, it, vi } from "vitest";

const getChainId = vi.fn();
const getBytecode = vi.fn();
const getBlockNumber = vi.fn();

vi.mock("viem", async (importOriginal) => {
  const original = await importOriginal<typeof import("viem")>();
  return {
    ...original,
    createPublicClient: () => ({ getChainId, getBytecode, getBlockNumber }),
    http: vi.fn(),
  };
});

import { runContractCheck } from "@/lib/monad/check";

const address = "0xAa2F6E23E54125C3B6414BD722db54cC0Ef252E3";

beforeEach(() => {
  getChainId.mockReset().mockResolvedValue(10143);
  getBytecode.mockReset();
  getBlockNumber.mockReset().mockResolvedValue(BigInt(123));
});

describe("Monad contract checks", () => {
  it("distinguishes a successful RPC read with no bytecode", async () => {
    getBytecode.mockResolvedValue(undefined);
    const check = await runContractCheck(address);
    expect(check.status).toBe("failed");
    expect(check.summary).toContain("No contract bytecode");
    expect(check.details).not.toHaveProperty("failureKind", "rpc");
  });

  it("classifies an RPC transport failure separately", async () => {
    getChainId.mockRejectedValue(new Error("network unavailable"));
    const check = await runContractCheck(address);
    expect(check.status).toBe("failed");
    expect(check.details).toMatchObject({ failureKind: "rpc" });
  });

  it("rejects an RPC connected to the wrong chain", async () => {
    getChainId.mockResolvedValue(1);
    const check = await runContractCheck(address);
    expect(check.status).toBe("failed");
    expect(check.summary).toContain("does not match expected 10143");
  });
});
