import Link from "next/link";
import { VerifyForm } from "@/components/verify-form";

export default function VerifyPage() {
  return <main><nav className="nav shell"><Link className="brand" href="/"><span className="brand-mark" aria-hidden="true" />ShipReceipt</Link><span className="nav-note">New verification · Monad Testnet</span></nav><header className="page-header shell"><span className="eyebrow">Build verification</span><h1>Check what actually shipped</h1><p>ShipReceipt resolves a public repository and selected commit, observes the configured live targets, and prepares canonical evidence for a self-issued onchain receipt.</p></header><section className="shell"><VerifyForm /></section></main>;
}
