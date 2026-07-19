"use client";

import Link from "next/link";
import { useState } from "react";
import type { Evidence } from "@/lib/evidence/schema";
import {
  checkDisplayName,
  checkObservation,
  checkTarget,
  formatRelativeAge,
  formatSnapshotTimestamp,
  INTEGRITY_PRESENTATION,
  PROJECT_REPORTED_EXPLANATION,
  RECEIPT_SCOPE_DISCLAIMER,
  SELF_ISSUED_EXPLANATION,
  SELF_ISSUED_LABEL,
  STATUS_PRESENTATION,
  type IntegrityState,
  type OnchainStatus,
} from "@/lib/presentation/receipt";

export interface ReceiptReportData {
  evidence: Evidence;
  evidenceRoot: `0x${string}`;
  storedEvidenceRoot: `0x${string}`;
  transactionHash: `0x${string}`;
  contractAddress: `0x${string}`;
  issuer: string;
  projectId: string;
  verifiedAt: bigint;
  status: OnchainStatus;
  passed: number;
  total: number;
  integrity: IntegrityState;
  latestReceiptId: bigint;
}

function CopyValue({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1_500);
    } catch {
      setCopied(false);
    }
  }
  return <div className="copy-value">
    <code>{value}</code>
    <button type="button" className="copy-button" onClick={copy} aria-label={`Copy ${label}`}>{copied ? "Copied" : "Copy"}</button>
    <span className="sr-only" aria-live="polite">{copied ? `${label} copied` : ""}</span>
  </div>;
}

function sentence(value: string): string {
  return /[.!?]$/.test(value) ? value : `${value}.`;
}

export function ReceiptReport({ receiptId, data, explorer }: { receiptId: string; data: ReceiptReportData; explorer: string }) {
  const status = STATUS_PRESENTATION[data.status];
  const integrity = INTEGRITY_PRESENTATION[data.integrity];
  const checkedAt = data.evidence.deployment.checkedAt;
  const failedChecks = data.evidence.checks.filter((check) => check.status === "failed");
  const failed = data.total - data.passed;
  const schemaVersion = "schemaVersion" in data.evidence ? data.evidence.schemaVersion : data.evidence.version;
  const verifierVersion = "verifierVersion" in data.evidence ? data.evidence.verifierVersion : "legacy v1 verifier";
  const failureDetail = data.status !== 3 && failedChecks.length > 0
    ? sentence(failedChecks[0].summary)
    : null;

  return <article className="receipt-report">
    <section className="panel receipt-summary" aria-labelledby="receipt-result-heading">
      <div className="receipt-result-row">
        <div>
          <span className={`status status-${status.label.toLowerCase()}`}><span aria-hidden="true">{status.icon}</span> {status.label}</span>
          <h2 id="receipt-result-heading">{status.label} Build Receipt</h2>
          <p className="receipt-project-name">{data.evidence.project.name}</p>
        </div>
        <div className="receipt-number">Receipt #{receiptId}</div>
      </div>
      <p className="receipt-count-summary"><strong>{data.passed} of {data.total}</strong> configured checks passed.</p>
      <p className="result-description">{status.headline}</p>
      <p className="outcome-detail">{status.description}</p>
      {failureDetail && <p className="failure-detail">{failureDetail}</p>}
      <div className="metric-row" aria-label="Verification check totals">
        <div className="metric"><strong>{data.passed}</strong><span>Passed</span></div>
        <div className="metric"><strong>{failed}</strong><span>Failed</span></div>
        <div className="metric"><strong>{data.total}</strong><span>Total checks</span></div>
      </div>
      <p className="receipt-type-line"><strong>Receipt type:</strong> {SELF_ISSUED_LABEL}</p>
    </section>

    <section className="panel" aria-labelledby="checks-heading">
      <div className="section-heading"><span className="section-index">01</span><div><h2 id="checks-heading">What worked and what failed</h2><p>Each line shows the target ShipReceipt observed at the recorded time.</p></div></div>
      <div className="check-list">
        {data.evidence.checks.map((check) => {
          const observation = checkObservation(check);
          const target = checkTarget(check);
          return <div className="check" key={check.id}>
            <span className={`check-icon ${check.status}`} aria-hidden="true">{check.status === "passed" ? "✓" : "!"}</span>
            <div>
              <div className="check-title"><b>{checkDisplayName(check)} — {check.status === "passed" ? "Passed" : "Failed"}</b><span className={`source-label ${observation.kind}`}>{observation.label}</span></div>
              <p>{check.summary}</p>
              {target && <code className="check-target">{target}</code>}
            </div>
            <time>{check.durationMs}ms</time>
          </div>;
        })}
      </div>
      {data.evidence.checks.some((check) => checkObservation(check).kind === "project-reported") && <p className="secondary-note">{PROJECT_REPORTED_EXPLANATION}</p>}
    </section>

    <section className="panel" aria-labelledby="integrity-heading">
      <div className="section-heading compact"><span className="section-index">02</span><div><h2 id="integrity-heading">Can this evidence be trusted not to have changed?</h2></div></div>
      <div className={`integrity-card integrity-${data.integrity}`}>
        <span className="integrity-icon" aria-hidden="true">{data.integrity === "valid" ? "✓" : "×"}</span>
        <div><strong>{integrity.label}</strong><p>{integrity.description}</p></div>
      </div>
    </section>

    <section className="panel" aria-labelledby="project-heading">
      <div className="section-heading compact"><span className="section-index">03</span><div><h2 id="project-heading">Project and deployment</h2><p>The real public targets selected for this check.</p></div></div>
      <dl className="facts">
        <div><dt>GitHub repository</dt><dd><a href={data.evidence.project.repository} target="_blank" rel="noreferrer">{data.evidence.project.repository}</a></dd></div>
        <div><dt>Commit selected for verification</dt><dd>{data.evidence.project.commit ? <a href={`${data.evidence.project.repository}/commit/${data.evidence.project.commit}`} target="_blank" rel="noreferrer"><code>{data.evidence.project.commit}</code></a> : "Unavailable"}</dd></div>
        <div><dt>Live deployment checked</dt><dd><a href={data.evidence.deployment.url} target="_blank" rel="noreferrer">{data.evidence.deployment.url}</a></dd></div>
      </dl>
      <p className="secondary-note">The selected commit is not proof that it produced the deployed application.</p>
    </section>

    <section className="panel receipt-grid" aria-labelledby="snapshot-heading">
      <div>
        <div className="section-heading compact"><span className="section-index">04</span><div><h2 id="snapshot-heading">When was this checked?</h2><p>{formatRelativeAge(checkedAt)}</p></div></div>
        <p className="snapshot-time">{formatSnapshotTimestamp(checkedAt)}.</p>
        <p className="secondary-note">Current availability may be different from this recorded snapshot.</p>
      </div>
      <aside className="issuer-card">
        <span className="field-label">Receipt type</span>
        <h3>{SELF_ISSUED_LABEL}</h3>
        <p>{SELF_ISSUED_EXPLANATION}</p>
        <span className="field-label">Issuer</span>
        <CopyValue value={data.issuer} label="issuer address" />
      </aside>
    </section>

    <section className="panel" aria-labelledby="monad-heading">
      <div className="section-heading"><span className="section-index">05</span><div><h2 id="monad-heading">Why is this receipt on Monad?</h2><p>ShipReceipt performs the technical checks offchain. Monad stores the result, issuer, timestamp, check totals, and evidence root.</p></div></div>
      <p>If the developer—or ShipReceipt itself—changes the stored evidence later, the recomputed root will no longer match this public record. The blockchain does not decide whether the software is correct; it preserves the integrity of the recorded result.</p>
      <div className="link-row"><a className="button secondary" href={`${explorer}/tx/${data.transactionHash}`} target="_blank" rel="noreferrer">View transaction ↗</a><a className="text-link" href={`${explorer}/address/${data.contractAddress}`} target="_blank" rel="noreferrer">View registry contract ↗</a></div>
    </section>

    <details className="panel technical-details">
      <summary>Advanced evidence and hashes</summary>
      <div className="technical-stack">
        <div><span className="field-label">Onchain evidence root</span><CopyValue value={data.evidenceRoot} label="onchain evidence root" /></div>
        <div><span className="field-label">Stored evidence root</span><CopyValue value={data.storedEvidenceRoot} label="stored evidence root" /></div>
        <div><span className="field-label">Project identifier</span><CopyValue value={data.projectId} label="project identifier" /></div>
        <div><span className="field-label">Transaction hash</span><CopyValue value={data.transactionHash} label="transaction hash" /></div>
        <div className="version-row"><span>Evidence schema v{schemaVersion}</span><span>Verifier {verifierVersion}</span></div>
      </div>
    </details>

    {data.latestReceiptId > BigInt(receiptId) && <div className="notice latest-notice">A newer receipt exists for this project. <Link href={`/receipt/${data.latestReceiptId}`}>View Receipt #{data.latestReceiptId.toString()} →</Link></div>}
    <p className="scope-disclaimer">{RECEIPT_SCOPE_DISCLAIMER}</p>
  </article>;
}
