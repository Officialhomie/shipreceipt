"use client";

import { useState } from "react";
import type { Evidence } from "@/lib/evidence/schema";
import { RecordReceipt } from "./record-receipt";

interface VerificationResponse { evidenceId:string; persistence:"durable"|"development-memory"; status:Evidence["summary"]["status"]; evidence:Evidence; evidenceRoot:`0x${string}`; passedChecks:number; failedChecks:number; totalChecks:number; }

export function VerifyForm() {
  const [loading,setLoading]=useState(false); const [error,setError]=useState(""); const [result,setResult]=useState<VerificationResponse|null>(null);
  async function submit(event:React.FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setError(""); setResult(null); const payload=Object.fromEntries(new FormData(event.currentTarget).entries()); try { const response=await fetch("/api/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...payload,chainId:10143})}); const body=await response.json(); if(!response.ok) throw new Error(body.error||"Verification failed"); setResult(body as VerificationResponse); } catch(cause){setError(cause instanceof Error?cause.message:"Verification failed");} finally{setLoading(false);} }
  return <>
    <form className="panel" onSubmit={submit}><div className="form-grid">
      <div className="field full"><label htmlFor="projectName">Project name</label><input id="projectName" name="projectName" placeholder="ShipReceipt" required minLength={2} maxLength={80}/></div>
      <div className="field full"><label htmlFor="repositoryUrl">Public GitHub repository</label><input id="repositoryUrl" name="repositoryUrl" type="url" placeholder="https://github.com/owner/repository" pattern="https://github\.com/[^/]+/[^/]+/?" required/><span className="hint">The default branch and its latest full commit SHA will be resolved.</span></div>
      <div className="field full"><label htmlFor="deploymentUrl">Deployment URL</label><input id="deploymentUrl" name="deploymentUrl" type="url" placeholder="https://your-app.vercel.app" required/></div>
      <div className="field"><label htmlFor="healthEndpoint">Health endpoint <small>optional</small></label><input id="healthEndpoint" name="healthEndpoint" placeholder="/api/health"/></div>
      <div className="field"><label htmlFor="readinessEndpoint">Readiness endpoint <small>optional</small></label><input id="readinessEndpoint" name="readinessEndpoint" placeholder="/api/ready"/></div>
      <div className="field full"><label htmlFor="contractAddress">Deployed contract to inspect <small>optional</small></label><input id="contractAddress" name="contractAddress" placeholder="0x…" pattern="0x[a-fA-F0-9]{40}"/><span className="hint">This checks for contract bytecode on Monad Testnet.</span></div>
      <div className="field"><label htmlFor="network">Network</label><select id="network" value="10143" disabled><option value="10143">Monad Testnet · 10143</option></select></div>
    </div>{error&&<div className="error-box" role="alert">{error}</div>}<div className="form-footer"><span className="hint">Checks are deterministic and run against the supplied targets.</span><button className="button" disabled={loading} type="submit">{loading?"Verifying…":"Run verification"}</button></div>{loading&&<div className="notice progress" aria-live="polite"><span className="spinner"/>Resolving the repository and running live network checks…</div>}</form>
    {result&&<section className="panel" aria-live="polite"><div className="result-head"><div><span className="eyebrow">Verification result</span><h2 style={{fontFamily:"Georgia, serif",fontSize:34,margin:"12px 0 0"}}>{result.evidence.project.name}</h2></div><span className={`status ${result.status}`}>{result.status}</span></div><div className="metric-row"><div className="metric"><strong>{result.passedChecks}</strong><span>Passed</span></div><div className="metric"><strong>{result.failedChecks}</strong><span>Failed</span></div><div className="metric"><strong>{result.totalChecks}</strong><span>Total</span></div></div>{result.persistence!=="durable"&&<div className="notice">Local development is using volatile evidence storage. Configure <code>DATABASE_URL</code> before deployment.</div>}<div className="check-list">{result.evidence.checks.map(check=><div className="check" key={check.id}><span className={`check-icon ${check.status}`}>{check.status==="passed"?"✓":"!"}</span><div><b>{check.id[0].toUpperCase()+check.id.slice(1)}</b><p>{check.summary}</p></div><time>{check.durationMs}ms</time></div>)}</div><p style={{fontSize:13,color:"var(--muted)",marginBottom:7}}>Canonical evidence root</p><div className="hash">{result.evidenceRoot}</div><RecordReceipt result={result}/></section>}
  </>;
}

