import { createPublicClient, http, isAddress } from "viem";
import type { VerificationCheck } from "@/lib/evidence/schema";
import { monadTestnet } from "@/lib/config/monad";

export async function runContractCheck(address: string): Promise<VerificationCheck> {
  const startedAt = new Date().toISOString();
  const started = performance.now();
  try {
    if (!isAddress(address)) throw new Error("Contract address is invalid");
    const rpcUrl =
      process.env.MONAD_RPC_URL ||
      process.env.NEXT_PUBLIC_MONAD_RPC_URL ||
      "https://testnet-rpc.monad.xyz";
    if (!rpcUrl) throw new Error("Monad RPC URL is not configured");
    const client = createPublicClient({ chain: monadTestnet, transport: http(rpcUrl) });
    const chainId = await client.getChainId();
    if (chainId !== monadTestnet.id) {
      throw new Error(`RPC chain ID ${chainId} does not match expected ${monadTestnet.id}`);
    }
    const [bytecode, blockNumber] = await Promise.all([
      client.getBytecode({ address: address as `0x${string}` }),
      client.getBlockNumber(),
    ]);
    const exists = Boolean(bytecode && bytecode !== "0x");
    return {
      id: "contract",
      type: "contract",
      status: exists ? "passed" : "failed",
      startedAt,
      completedAt: new Date().toISOString(),
      durationMs: Math.round(performance.now() - started),
      summary: exists ? "Contract bytecode exists on Monad Testnet" : "No contract bytecode exists at this address",
      details: {
        target: address,
        address,
        chainId,
        expectedChainId: monadTestnet.id,
        blockNumber: blockNumber.toString(),
        bytecodeExists: exists,
        observationSource: "independent",
      },
    };
  } catch (error) {
    return {
      id: "contract",
      type: "contract",
      status: "failed",
      startedAt,
      completedAt: new Date().toISOString(),
      durationMs: Math.round(performance.now() - started),
      summary: `Contract check failed: ${error instanceof Error ? error.message : "unknown error"}`,
      details: {
        target: address,
        address,
        expectedChainId: monadTestnet.id,
        observationSource: "independent",
        failureKind: isAddress(address) ? "rpc" : "validation",
      },
    };
  }
}
