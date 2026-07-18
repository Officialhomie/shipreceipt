import { keccak256, toBytes } from "viem";
import { evidenceSchema, type Evidence } from "./schema";

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, sortValue(entry)]),
    );
  }
  return value;
}

export function canonicalizeEvidence(input: unknown): string {
  const evidence = evidenceSchema.parse(input);
  return JSON.stringify(sortValue(evidence));
}

export function hashEvidence(input: Evidence): `0x${string}` {
  return keccak256(toBytes(canonicalizeEvidence(input)));
}

