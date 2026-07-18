import Link from "next/link";
import { VerifyForm } from "@/components/verify-form";

export default function VerifyPage() {
  return <main><nav className="nav shell"><Link className="brand" href="/"><span className="brand-mark" />ShipReceipt</Link><span className="nav-note">New verification · Monad Testnet</span></nav><header className="page-header shell"><span className="eyebrow">Independent verification</span><h1>Verify a build</h1><p>ShipReceipt resolves the repository and commit, performs real server-side checks, then prepares canonical evidence for an onchain receipt.</p></header><section className="shell"><VerifyForm /></section></main>;
}

