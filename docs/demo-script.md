# ShipReceipt final demo script — approximately 2 minutes 22 seconds

Receipt #2 is the main story because it preserves a real failure. Keep the
browser zoom readable, avoid terminal or setup footage, and do not show secrets.

## 0:00–0:15 — Personal problem

Show the homepage.

> I build software with AI coding agents, and I kept seeing the same problem:
> the agent says the task is complete, but the deployment or one of its
> dependencies still is not working.

## 0:15–0:28 — Product

Point to the headline and the real-receipt link.

> I built ShipReceipt to check the actual project before accepting that
> completion claim.

## 0:28–0:55 — Verification form

Open **Check a Build**. Use the prepared ShipReceipt values:

- public GitHub repository;
- live Production deployment;
- `/api/health`;
- `/api/readiness-deliberately-missing`; and
- the Monad registry address.

> I provide the public repository, live deployment, health and readiness
> endpoints, and the Monad contract.

## 0:55–1:20 — Real checks

Submit and show the progress copy and readable check list.

> ShipReceipt resolves the repository and selected commit, visits the live
> deployment, checks the endpoints, and confirms the contract bytecode. These
> are real project checks; no AI model decides the result.

## 1:20–1:35 — Honest result

Show the `Partial` result and failed readiness line.

> Four checks passed, but the readiness endpoint returned HTTP 404. ShipReceipt
> preserves that failure instead of turning it into a fake success screen.

## 1:35–1:55 — Evidence and Monad

Show the evidence-root disclosure and recording explanation. If recording a new
receipt would consume demo time, use the already confirmed Receipt #2.

> The detailed evidence stays offchain. Its root, result, issuer, timestamp,
> and check totals are recorded on Monad so the report cannot be quietly
> rewritten later.

## 1:55–2:15 — Public Receipt #2

Open [Receipt #2](https://shipreceipt.vercel.app/receipt/2). Show:

- `Partial Build Receipt` and 4/5 checks;
- the readiness HTTP `404`;
- independently observed and project-reported labels;
- `Evidence integrity: Valid`;
- snapshot time and issuer; and
- the Monad transaction link.

> Anyone can open the public receipt without connecting a wallet, inspect what
> passed or failed, and confirm that the stored evidence still matches the
> onchain root.

## 2:15–2:22 — Close

Return to the homepage headline.

> AI can claim it shipped. ShipReceipt proves what actually worked.

## Recording checklist

- Rehearse once and keep the finished video between 90 and 165 seconds.
- Preload the form values or paste them quickly.
- Keep Receipt #2 open in a second tab.
- Hide bookmarks, notifications, wallet balances, and unrelated tabs.
- Never show `.env.local`, terminal history, private keys, database strings, or
  provider tokens.
- Add the published video URL to `docs/submission.md`.
