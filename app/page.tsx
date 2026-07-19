import Link from "next/link";

const workflow = [
  ["01", "Check the real build", "Resolve the public repository and selected commit, then observe the live deployment, configured endpoints, and optional Monad contract."],
  ["02", "Record what happened", "Keep every pass and failure visible in versioned canonical evidence. No model decides the verdict."],
  ["03", "Anchor the snapshot", "Record the evidence root, result, issuer, and timestamp on Monad so the report cannot be quietly rewritten later."],
];

export default function Home() {
  return <main>
    <nav className="nav shell">
      <Link className="brand" href="/"><span className="brand-mark" aria-hidden="true" />ShipReceipt</Link>
      <span className="nav-note">Build verification for AI-assisted delivery</span>
    </nav>

    <section className="hero shell">
      <div>
        <span className="eyebrow">Evidence, not completion theater</span>
        <h1>AI can claim it shipped.<br /><em>ShipReceipt proves what actually worked.</em></h1>
        <p className="hero-copy">Check a real repository, deployment, endpoints, and Monad contract. Record exactly what passed or failed in a tamper-evident receipt.</p>
        <div className="actions">
          <Link className="button" href="/verify">Check This Build <span aria-hidden="true">→</span></Link>
          <Link className="button secondary" href="/receipt/1">View Receipt #1</Link>
        </div>
        <p className="hero-footnote">Selected technical checks at a recorded time—not a security certification or claim that every feature works.</p>
      </div>

      <aside className="proof-card" aria-label="Receipt 1 summary">
        <div className="proof-card-top"><span className="eyebrow">Live example</span><span className="receipt-chip">#1</span></div>
        <h2>ShipReceipt</h2>
        <div className="proof-row"><span>Repository</span><b>Observed</b></div>
        <div className="proof-row"><span>Deployment</span><b>HTTP 200</b></div>
        <div className="proof-row"><span>Health</span><b>HTTP 200</b></div>
        <div className="proof-row"><span>Monad contract</span><b>Bytecode found</b></div>
        <div className="receipt-verdict"><span aria-hidden="true">✓</span><div><b>Verified</b><small>All 4 configured checks passed</small></div></div>
        <Link className="text-link" href="/receipt/1">Inspect the public evidence →</Link>
      </aside>
    </section>

    <section className="workflow shell" aria-labelledby="workflow-heading">
      <div className="section-heading"><span className="section-index">How</span><div><h2 id="workflow-heading">From agent claim to inspectable receipt</h2><p>A narrow, practical check for the moment an AI coding agent says “done.”</p></div></div>
      <div className="workflow-grid">{workflow.map(([number, title, copy]) => <article className="workflow-step" key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
    </section>

    <section className="monad-section shell" aria-labelledby="why-monad-heading">
      <div><span className="eyebrow">Why Monad</span><h2 id="why-monad-heading">A public integrity anchor for an offchain report.</h2></div>
      <div><p>ShipReceipt performs the technical checks offchain. Monad stores the receipt&apos;s evidence root, result, issuer, and timestamp so the record cannot be quietly rewritten later by the developer or ShipReceipt.</p><p>A database record is controlled by one service. The Monad receipt gives builders, clients, collaborators, and judges a shared public integrity anchor.</p></div>
    </section>

    <section className="boundaries shell" aria-labelledby="boundaries-heading">
      <div><span className="section-index">Scope</span><h2 id="boundaries-heading">Precise proof, honest boundaries.</h2></div>
      <ul><li>Receipts are self-issued, not independent audits.</li><li>A selected commit is not proof that the deployment contains that commit.</li><li>Health and readiness endpoints are project-reported.</li><li>Every receipt is a historical snapshot, not a future-uptime guarantee.</li></ul>
    </section>

    <footer className="footer shell"><span>ShipReceipt · Monad Testnet 10143</span><div><a href="https://github.com/Officialhomie/shipreceipt" target="_blank" rel="noreferrer">GitHub ↗</a><a href="https://testnet.monadvision.com/address/0xAa2F6E23E54125C3B6414BD722db54cC0Ef252E3" target="_blank" rel="noreferrer">Registry ↗</a></div></footer>
  </main>;
}
