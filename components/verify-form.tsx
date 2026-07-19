"use client";

import { useState } from "react";
import type { Evidence } from "@/lib/evidence/schema";
import {
  checkObservation,
  evidenceStatusCode,
  PROJECT_REPORTED_EXPLANATION,
  RECEIPT_SCOPE_DISCLAIMER,
  STATUS_PRESENTATION,
} from "@/lib/presentation/receipt";
import { RecordReceipt } from "./record-receipt";

interface VerificationResponse {
  evidenceId: string;
  persistence: "durable" | "development-memory";
  status: Evidence["summary"]["status"];
  evidence: Evidence;
  evidenceRoot: `0x${string}`;
  passedChecks: number;
  failedChecks: number;
  totalChecks: number;
}

export function VerifyForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<VerificationResponse | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, chainId: 10143 }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Verification failed");
      setResult(body as VerificationResponse);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  const status = result ? STATUS_PRESENTATION[evidenceStatusCode(result.status)] : null;

  return <>
    <form className="panel" onSubmit={submit} aria-describedby={error ? "verification-error" : undefined}>
      <div className="form-grid">
        <div className="field full"><label htmlFor="projectName">Project name</label><input id="projectName" name="projectName" placeholder="ShipReceipt" required minLength={2} maxLength={80} /></div>
        <div className="field full"><label htmlFor="repositoryUrl">Public GitHub repository</label><input id="repositoryUrl" name="repositoryUrl" type="url" placeholder="https://github.com/owner/repository" pattern="https://github\.com/[^/]+/[^/]+/?" required aria-describedby="repository-hint" /><span className="hint" id="repository-hint">ShipReceipt selects the latest commit on the default branch for this verification. It does not claim the deployment was built from that commit.</span></div>
        <div className="field full"><label htmlFor="deploymentUrl">Deployment URL</label><input id="deploymentUrl" name="deploymentUrl" type="url" placeholder="https://your-app.vercel.app" required /></div>
        <div className="field"><label htmlFor="healthEndpoint">Health endpoint <small>optional · project-reported</small></label><input id="healthEndpoint" name="healthEndpoint" placeholder="/api/health" aria-describedby="endpoint-hint" /></div>
        <div className="field"><label htmlFor="readinessEndpoint">Readiness endpoint <small>optional · project-reported</small></label><input id="readinessEndpoint" name="readinessEndpoint" placeholder="/api/ready" aria-describedby="endpoint-hint" /></div>
        <span className="hint field full" id="endpoint-hint">These endpoints are controlled by the project. ShipReceipt records the observed HTTP response.</span>
        <div className="field full"><label htmlFor="contractAddress">Monad contract to inspect <small>optional</small></label><input id="contractAddress" name="contractAddress" placeholder="0x…" pattern="0x[a-fA-F0-9]{40}" aria-describedby="contract-hint" /><span className="hint" id="contract-hint">Independently checks chain ID and non-empty bytecode on Monad Testnet.</span></div>
        <div className="field"><label htmlFor="network">Network</label><select id="network" value="10143" disabled aria-label="Verification network"><option value="10143">Monad Testnet · 10143</option></select></div>
      </div>
      {error && <div className="error-box" id="verification-error" role="alert">{error}</div>}
      <div className="form-footer"><span className="hint">Results preserve both passes and failures.</span><button className="button" disabled={loading} type="submit">{loading ? "Checking the build…" : "Check This Build"}</button></div>
      {loading && <div className="notice progress" aria-live="polite"><span className="spinner" aria-hidden="true" />Resolving the repository and observing the configured targets…</div>}
    </form>

    {result && status && <section className="panel verification-result" aria-live="polite">
      <div className="result-head"><div><span className="eyebrow">Verification result</span><h2>{result.evidence.project.name}</h2><p className="result-description">{status.description}</p></div><span className={`status status-${status.label.toLowerCase()}`}><span aria-hidden="true">{status.icon}</span> {status.label}</span></div>
      <div className="metric-row"><div className="metric"><strong>{result.passedChecks}</strong><span>Passed</span></div><div className="metric"><strong>{result.failedChecks}</strong><span>Failed</span></div><div className="metric"><strong>{result.totalChecks}</strong><span>Total</span></div></div>
      {result.persistence !== "durable" && <div className="notice">Local development is using volatile evidence storage. Configure <code>DATABASE_URL</code> before deployment.</div>}
      <div className="check-list">{result.evidence.checks.map((check) => { const observation = checkObservation(check); return <div className="check" key={check.id}><span className={`check-icon ${check.status}`} aria-hidden="true">{check.status === "passed" ? "✓" : "!"}</span><div><div className="check-title"><b>{check.id[0].toUpperCase() + check.id.slice(1)}</b><span className={`source-label ${observation.kind}`}>{observation.label}</span></div><p>{check.summary}</p></div><time>{check.durationMs}ms</time></div>; })}</div>
      {result.evidence.checks.some((check) => checkObservation(check).kind === "project-reported") && <p className="secondary-note">{PROJECT_REPORTED_EXPLANATION}</p>}
      <div className="evidence-root"><span className="field-label">Canonical evidence root</span><code>{result.evidenceRoot}</code></div>
      <p className="scope-disclaimer compact-disclaimer">{RECEIPT_SCOPE_DISCLAIMER}</p>
      <RecordReceipt result={result} />
    </section>}
  </>;
}
