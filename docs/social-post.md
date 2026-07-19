# ShipReceipt social post draft

AI coding agents can build software quickly.

But “task complete” does not always mean the deployment, database, endpoints,
and contracts are actually working.

I experienced this repeatedly while building with AI agents, so I built
ShipReceipt for the Spark hackathon.

ShipReceipt checks a real GitHub repository, selected commit, live deployment,
endpoints, and Monad contract.

It records exactly what passed or failed, creates versioned evidence, and
anchors the receipt on Monad so the report cannot be quietly rewritten later.

One of my live receipts shows 4 of 5 checks passing because the readiness
endpoint returned HTTP 404.

ShipReceipt preserved the failure instead of showing a fake success screen.

AI can claim it shipped.
ShipReceipt proves what actually worked.

Live app: https://shipreceipt.vercel.app

Partial receipt: https://shipreceipt.vercel.app/receipt/2

#Monad #BuildOnMonad #SparkHackathon #BuildInPublic #AIAgents

---

Do not publish this file automatically. After publishing, add the public post
URL to `docs/submission.md`.
