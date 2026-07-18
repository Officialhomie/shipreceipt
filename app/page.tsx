import Link from "next/link";

const features = [
  ["Live checks", "Reachability, health and readiness run server-side."],
  ["Commit binding", "Resolve an exact 40-character public GitHub commit."],
  ["Evidence hashing", "Canonical JSON produces a deterministic keccak256 root."],
  ["Monad receipt", "Write the root, result and counts to an immutable registry."],
  ["Public proof", "Recompute evidence and compare it with the onchain record."],
];

export default function Home() {
  return <main>
    <nav className="nav shell"><Link className="brand" href="/"><span className="brand-mark" aria-hidden="true" />ShipReceipt</Link><span className="nav-note">Independent build verification · Monad Testnet</span></nav>
    <section className="hero shell">
      <div><span className="eyebrow">Tamper-evident build proof</span><h1>AI can say it shipped.<br /><em>Prove it.</em></h1><p className="hero-copy">Verify a live deployment, bind the evidence to a real GitHub commit, and create a public build receipt anchored on Monad.</p><div className="actions"><Link className="button" href="/verify">Verify a build <span aria-hidden="true">→</span></Link><span className="nav-note">Real checks. No generated verdicts.</span></div></div>
      <aside className="proof-card" aria-label="Example verification receipt"><span className="eyebrow">Receipt preview</span><h2>Build verification</h2><div className="proof-row"><span>Repository</span><b>commit bound</b></div><div className="proof-row"><span>Deployment</span><b>reachable</b></div><div className="proof-row"><span>Evidence</span><b>keccak256</b></div><div className="proof-row"><span>Network</span><b>Monad Testnet</b></div><div className="stamp">EVIDENCE<br />INTEGRITY<br />VALID</div></aside>
    </section>
    <section className="features shell">{features.map(([title, copy]) => <article className="feature" key={title}><b>{title}</b><p>{copy}</p></article>)}</section>
  </main>;
}
