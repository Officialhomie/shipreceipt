import {
  CURRENT_EVIDENCE_SCHEMA_VERSION,
  VERIFIER_VERSION,
  type Evidence,
  type VerificationCheck,
} from "@/lib/evidence/schema";
import type { VerificationInput } from "@/lib/schemas/verification";
import {
  GitHubRateLimitError,
  resolveGitHubRepository,
  type GitHubRepository,
} from "@/lib/github/client";
import { calculateStatus } from "./status";
import { resolveEndpoint } from "./url-safety";
import { runHttpCheck } from "./http-check";
import { runContractCheck } from "@/lib/monad/check";

async function runRepositoryCheck(url: string): Promise<{
  check: VerificationCheck;
  repository: GitHubRepository | null;
}> {
  const startedAt = new Date().toISOString();
  const started = performance.now();
  try {
    const repository = await resolveGitHubRepository(url);
    return {
      repository,
      check: {
        id: "repository",
        type: "repository",
        status: "passed",
        startedAt,
        completedAt: new Date().toISOString(),
        durationMs: Math.round(performance.now() - started),
        summary: "Public repository and full commit SHA resolved",
        details: {
          target: repository.repositoryUrl,
          observationSource: "independent",
          ...repository,
        },
      },
    };
  } catch (error) {
    return {
      repository: null,
      check: {
        id: "repository",
        type: "repository",
        status: "failed",
        startedAt,
        completedAt: new Date().toISOString(),
        durationMs: Math.round(performance.now() - started),
        summary: `Repository check failed: ${error instanceof Error ? error.message : "unknown error"}`,
        details: {
          target: url,
          repositoryUrl: url,
          observationSource: "independent",
          failureKind:
            error instanceof GitHubRateLimitError ? "upstream_rate_limit" : "repository",
        },
      },
    };
  }
}

export async function verifyBuild(input: VerificationInput): Promise<Evidence> {
  const checkedAt = new Date().toISOString();
  const checks: VerificationCheck[] = [];
  const repositoryResult = await runRepositoryCheck(input.repositoryUrl);
  checks.push(repositoryResult.check);
  checks.push(await runHttpCheck("deployment", input.deploymentUrl, "Deployment"));

  const healthUrl = resolveEndpoint(input.deploymentUrl, input.healthEndpoint);
  if (healthUrl) checks.push(await runHttpCheck("health", healthUrl, "Health endpoint"));
  const readinessUrl = resolveEndpoint(input.deploymentUrl, input.readinessEndpoint);
  if (readinessUrl) checks.push(await runHttpCheck("readiness", readinessUrl, "Readiness endpoint"));
  if (input.contractAddress) checks.push(await runContractCheck(input.contractAddress));

  const passed = checks.filter((check) => check.status === "passed").length;
  const status = calculateStatus(checks);
  const repository = repositoryResult.repository;
  return {
    version: CURRENT_EVIDENCE_SCHEMA_VERSION,
    schemaVersion: CURRENT_EVIDENCE_SCHEMA_VERSION,
    verifierVersion: VERIFIER_VERSION,
    project: {
      name: input.projectName,
      repository: repository?.repositoryUrl || input.repositoryUrl,
      owner: repository?.owner || null,
      repo: repository?.repo || null,
      commit: repository?.commitSha || null,
      commitTimestamp: repository?.commitTimestamp || null,
    },
    deployment: { url: new URL(input.deploymentUrl).toString(), checkedAt },
    network: {
      name: "Monad Testnet",
      chainId: 10143,
      contractAddress: input.contractAddress || null,
    },
    checks,
    summary: {
      passed,
      failed: checks.length - passed,
      total: checks.length,
      status,
    },
  };
}
