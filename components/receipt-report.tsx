"use client";

import Link from "next/link";
import { useState } from "react";
import type { Evidence } from "@/lib/evidence/schema";
import {
  checkObservation,
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
  return (
    <div className="copy-value">
      <code>{value}</code>
      <button type="button" className="copy-button" onClick={copy} aria-label={`Copy ${label}`}>
        {copied ? "Copied" : "Copy"}
      </button>
      <span className="sr-only" aria-live="polite">{copied ? `${label} copied` : ""}</span>
    </div>
  );
}

export function ReceiptReport({
  receiptId,
  data,
  explorer,
}: {
  receiptId: string;
  data: ReceiptReportData;
  explorer: string;
}) {
  const status = STATUS_PRESENTATION[data.status];
  const integrity = INTEGRITY_PRESENTATION[data.integrity];
  const checkedAt = data.evidence.deployment.checkedAt;
  const failed = data.total - data.passed;
  const schemaVersion = "schemaVersion" in data.evidence
    ? data.evidence.schemaVersion
    : data.evidence.version;
  const verifierVersion = "verifierVersion" in data.evidence
    ? data.evidence.verifierVersion
    : "legacy v1 verifier";

  return (
    <article className="receipt-report">
      <section className="panel receipt-summary" aria-labelledby="receipt-result-heading">
        <div className="receipt-result-row">
          <div>
            <span className={`status status-${status.label.toLowerCase()}`}>
              <span aria-hidden="true">{status.icon}</span> {status.label}
            </span>
            <h2 id="receipt-result-heading">{data.evidence.project.name}</h2>
            <p className="result-description">{status.description}</p>
          </div>
          <div className="receipt-number">Receipt #{receiptId}</div>
        </div>

        <div className="metric-row" aria-label="Verification check totals">
          <div className="metric"><strong>{data.passed}</strong><span>Passed</span></div>
          <div className="metric"><strong>{failed}</strong><span>Failed</span></div>
          <div className="metric"><strong>{data.total}</strong><span>Total checks</span></div>
        </div>

        <div className={`integrity-card integrity-${data.integrity}`}>
          <span className="integrity-icon" aria-hidden="true">{data.integrity === "valid" ? "✓" : "×"}</span>
          <div><strong>{integrity.label}</strong><p>{integrity.description}</p></div>
        </div>
      </section>

      <section className="panel" aria-labelledby="checks-heading">
        <div className="section-heading"><span className="section-index">01</span><div><h2 id="checks-heading">What was checked</h2><p>Each result records the actual response observed at verification time.</p></div></div>
        <div className="check-list">
          {data.evidence.checks.map((check) => {
            const observation = checkObservation(check);
            return <div className="check" key={check.id}>
              <span className={`check-icon ${check.status}`} aria-hidden="true">{check.status === "passed" ? "✓" : "!"}</span>
              <div><div className="check-title"><b>{check.id[0].toUpperCase() + check.id.slice(1)}</b><span className={`source-label ${observation.kind}`}>{observation.label}</span></div><p>{check.summary}</p></div>
              <time>{check.durationMs}ms</time>
            </div>;
          })}
        </div>
        {data.evidence.checks.some((check) => checkObservation(check).kind === "project-reported") && <p className="secondary-note">{PROJECT_REPORTED_EXPLANATION}</p>}
      </section>

      <section className="panel receipt-grid" aria-labelledby="snapshot-heading">
        <div>
          <div className="section-heading compact"><span className="section-index">02</span><div><h2 id="snapshot-heading">Build snapshot</h2><p>{formatRelativeAge(checkedAt)}</p></div></div>
          <dl className="facts">
            <div><dt>Repository</dt><dd><a href={data.evidence.project.repository} target="_blank" rel="noreferrer">{data.evidence.project.repository}</a></dd></div>
            <div><dt>Commit selected for verification</dt><dd>{data.evidence.project.commit ? <a href={`${data.evidence.project.repository}/commit/${data.evidence.project.commit}`} target="_blank" rel="noreferrer"><code>{data.evidence.project.commit}</code></a> : "Unavailable"}</dd></div>
            <div><dt>Deployment checked</dt><dd><a href={data.evidence.deployment.url} target="_blank" rel="noreferrer">{data.evidence.deployment.url}</a></dd></div>
            <div><dt>Recorded snapshot</dt><dd>{formatSnapshotTimestamp(checkedAt)}</dd></div>
          </dl>
          <p className="secondary-note">Current availability may differ from this recorded result. The selected commit is not proof that the deployment was built from that commit.</p>
        </div>
        <aside className="issuer-card">
          <span className="eyebrow">Receipt type</span>
          <h3>{SELF_ISSUED_LABEL}</h3>
          <p>{SELF_ISSUED_EXPLANATION}</p>
          <span className="field-label">Issuer</span>
          <CopyValue value={data.issuer} label="issuer address" />
        </aside>
      </section>

      <section className="panel" aria-labelledby="monad-heading">
        <div className="section-heading"><span className="section-index">03</span><div><h2 id="monad-heading">What Monad contributes</h2><p>ShipReceipt performs the technical checks offchain. Monad stores the receipt&apos;s evidence root, result, issuer, and timestamp so the record cannot be quietly rewritten later by the developer or ShipReceipt.</p></div></div>
        <p>A database record is controlled by one service. The Monad receipt gives builders, clients, collaborators, and judges a shared public integrity anchor.</p>
        <div className="link-row"><a className="button secondary" href={`${explorer}/tx/${data.transactionHash}`} target="_blank" rel="noreferrer">View transaction ↗</a><a className="text-link" href={`${explorer}/address/${data.contractAddress}`} target="_blank" rel="noreferrer">View registry contract ↗</a></div>
      </section>

      <details className="panel technical-details">
        <summary>Technical evidence and hashes</summary>
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
    </article>
  );
}
