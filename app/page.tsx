import Link from "next/link";

const steps = [
  ["01", "Enter the project", "Provide a public GitHub repository, live deployment, optional health endpoints, and optional Monad contract."],
  ["02", "Run real checks", "ShipReceipt resolves the repository and commit, visits the deployment, checks the endpoints, and confirms contract bytecode where configured."],
  ["03", "Record the result", "The result is saved as evidence and can be recorded in a public receipt on Monad."],
];

const benefits = [
  ["For developers", "Show clients, collaborators, and judges what was actually working when the project was delivered."],
  ["For clients", "See more than a “completed” message. Review the exact checks that passed or failed."],
  ["For AI-agent workflows", "Add an independent completion step after an agent says the work is finished."],
  ["For hackathon judges", "Open one receipt and quickly inspect the repository, deployment, contract, checks, and evidence integrity."],
];

export default function Home() {
  return <main>
    <nav className="nav shell">
      <Link className="brand" href="/"><span className="brand-mark" aria-hidden="true" />ShipReceipt</Link>
      <span className="nav-note">Check a build before accepting “complete”</span>
    </nav>

    <section className="hero shell">
      <div>
        <span className="eyebrow">Build checks for AI-assisted software</span>
        <h1>AI can say your build is finished.<br /><em>ShipReceipt proves what actually worked.</em></h1>
        <p className="hero-copy">Check a real GitHub repository, live deployment, health endpoints, and Monad contract. ShipReceipt records exactly what passed or failed in a tamper-evident public receipt.</p>
        <div className="actions">
          <Link className="button" href="/verify">Check a Build <span aria-hidden="true">→</span></Link>
          <Link className="button secondary" href="/receipt/2">View a Real Receipt</Link>
        </div>
        <p className="credibility-line"><span aria-hidden="true">●</span> Live on Monad Testnet <span>·</span> Real checks <span>·</span> No AI-generated verdicts</p>
      </div>

      <aside className="proof-card partial-example" aria-label="Partial Receipt 2 summary">
        <div className="proof-card-top"><span className="eyebrow">Real failure preserved</span><span className="receipt-chip">#2</span></div>
        <h2>Partial Build Receipt</h2>
        <div className="proof-row"><span>Repository</span><b>Passed</b></div>
        <div className="proof-row"><span>Deployment</span><b>Passed</b></div>
        <div className="proof-row"><span>Health endpoint</span><b>Passed</b></div>
        <div className="proof-row failed-row"><span>Readiness endpoint</span><b>HTTP 404</b></div>
        <div className="proof-row"><span>Monad contract</span><b>Passed</b></div>
        <div className="receipt-verdict partial-verdict"><span aria-hidden="true">!</span><div><b>Partial</b><small>4 of 5 configured checks passed</small></div></div>
        <Link className="text-link" href="/receipt/2">See exactly what failed →</Link>
      </aside>
    </section>

    <section className="problem-solution shell" aria-labelledby="problem-heading">
      <article>
        <span className="section-index">The problem</span>
        <h2 id="problem-heading">“Task complete” is still a claim.</h2>
        <p>AI coding tools can generate software quickly. But “task complete” does not always mean:</p>
        <ul><li>the deployment is live,</li><li>the database is ready,</li><li>the health endpoint works,</li><li>or the contract was actually deployed.</li></ul>
        <p>Developers, clients, and judges still have to check those claims manually.</p>
      </article>
      <article>
        <span className="section-index">The solution</span>
        <h2>Check the real project.</h2>
        <p>ShipReceipt performs those checks against the real build and records:</p>
        <ul><li>what was checked,</li><li>what passed or failed,</li><li>when the check happened,</li><li>and who issued the receipt.</li></ul>
        <p>The detailed evidence stays offchain. Its integrity is anchored on Monad so later changes become visible.</p>
      </article>
    </section>

    <section className="workflow shell" aria-labelledby="workflow-heading">
      <div className="section-heading"><span className="section-index">How it works</span><div><h2 id="workflow-heading">Three steps from claim to receipt</h2><p>A practical completion check, without replacing your CI/CD or security review.</p></div></div>
      <div className="workflow-grid">{steps.map(([number, title, copy]) => <article className="workflow-step" key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
    </section>

    <section className="benefits shell" aria-labelledby="benefits-heading">
      <div className="section-heading"><span className="section-index">Who it helps</span><div><h2 id="benefits-heading">A clearer handoff for everyone</h2><p>One readable record of what was working—and what was not.</p></div></div>
      <div className="benefit-grid">{benefits.map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div>
    </section>

    <section className="monad-section shell" aria-labelledby="why-monad-heading">
      <div><span className="eyebrow">Why Monad</span><h2 id="why-monad-heading">Why record the receipt on Monad?</h2></div>
      <div><p>ShipReceipt performs the technical checks offchain.</p><p>Monad stores the receipt&apos;s result, issuer, timestamp, check totals, and evidence root. That means the developer—or ShipReceipt itself—cannot quietly edit the evidence later without creating a visible mismatch.</p><p><strong>The blockchain does not decide whether the software is correct.</strong> It preserves the integrity of the recorded result.</p></div>
    </section>

    <section className="boundaries shell" aria-labelledby="boundaries-heading">
      <div><span className="section-index">Honest scope</span><h2 id="boundaries-heading">Useful proof, clear limits.</h2></div>
      <ul><li>Receipts are self-issued, not independent audits.</li><li>A selected commit is not proof that it produced the deployment.</li><li>Health and readiness endpoints are project-reported.</li><li>Every receipt is a historical snapshot, not a future-uptime guarantee.</li></ul>
    </section>

    <footer className="footer shell"><span>ShipReceipt · Monad Testnet 10143</span><div><a href="https://github.com/Officialhomie/shipreceipt" target="_blank" rel="noreferrer">GitHub ↗</a><a href="https://testnet.monadvision.com/address/0xAa2F6E23E54125C3B6414BD722db54cC0Ef252E3" target="_blank" rel="noreferrer">Registry ↗</a></div></footer>
  </main>;
}
