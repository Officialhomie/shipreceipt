import { z } from "zod";

export const checkStatusSchema = z.enum(["passed", "failed"]);
export const overallStatusSchema = z.enum(["failed", "partial", "verified"]);

export const verificationCheckSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["repository", "http", "contract"]),
  status: checkStatusSchema,
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime(),
  durationMs: z.number().int().nonnegative(),
  summary: z.string().min(1).max(500),
  details: z.record(z.string(), z.unknown()),
});

const evidenceBodySchema = z.object({
  project: z.object({
    name: z.string().min(1),
    repository: z.string().url(),
    owner: z.string().nullable(),
    repo: z.string().nullable(),
    commit: z.string().regex(/^[a-f0-9]{40}$/).nullable(),
    commitTimestamp: z.string().datetime().nullable(),
  }),
  deployment: z.object({
    url: z.string().url(),
    checkedAt: z.string().datetime(),
  }),
  network: z.object({
    name: z.literal("Monad Testnet"),
    chainId: z.literal(10143),
    contractAddress: z.string().nullable(),
  }),
  checks: z.array(verificationCheckSchema).min(1),
  summary: z.object({
    passed: z.number().int().nonnegative(),
    failed: z.number().int().nonnegative(),
    total: z.number().int().positive(),
    status: overallStatusSchema,
  }),
});

export const evidenceV1Schema = evidenceBodySchema.extend({
  version: z.literal("1"),
});

export const evidenceV2Schema = evidenceBodySchema.extend({
  version: z.literal("2"),
  schemaVersion: z.literal("2"),
  verifierVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
});

export const evidenceSchema = z.discriminatedUnion("version", [
  evidenceV1Schema,
  evidenceV2Schema,
]);

export const CURRENT_EVIDENCE_SCHEMA_VERSION = "2" as const;
export const VERIFIER_VERSION = "0.2.0" as const;

export type VerificationCheck = z.infer<typeof verificationCheckSchema>;
export type Evidence = z.infer<typeof evidenceSchema>;
export type VerificationStatus = z.infer<typeof overallStatusSchema>;
