import Link from "next/link";
import { VerifyForm } from "@/components/verify-form";

export default function VerifyPage() {
  return <main><nav className="nav shell"><Link className="brand" href="/"><span className="brand-mark" aria-hidden="true" />ShipReceipt</Link><span className="nav-note">New check · Monad Testnet</span></nav><header className="page-header shell"><span className="eyebrow">Check a build</span><h1>What should ShipReceipt check?</h1><p>Enter the real project links below. ShipReceipt will record what responds, what fails, and when each check happened.</p></header><section className="shell"><VerifyForm /></section></main>;
}
