# ShipReceipt demo script — under three minutes

## 0:00–0:25 — Problem

“AI coding agents generate software quickly, but their completion reports are
not proof that the repository, deployment, endpoints, and contracts actually
work. A report can also be changed later.”

## 0:25–0:45 — Product

“ShipReceipt independently performs live checks, binds the result to a real
GitHub commit, hashes canonical evidence, and records a tamper-evident receipt
on Monad.”

Open the verification form. Briefly point out that no GitHub token, private key,
or other secret is entered by the user.

## 0:45–1:25 — Real verification

Use a public repository and deployed app where:

- the main deployment responds;
- the health endpoint responds;
- the deliberately unavailable readiness endpoint fails.

Submit once. Do not edit the result. Show that the repository and commit were
resolved, the passing checks are green, readiness is red, and the deterministic
result is `Partial`.

## 1:25–2:10 — Evidence review

Show the full commit SHA, deployment URL, individual reasons and durations,
3/4 check counts, timestamp, and canonical evidence root. Say:

“ShipReceipt selects this repository commit for the verification. It does not
overclaim that the deployment came from that commit.”

## 2:10–2:40 — Monad transaction

Connect the owner wallet on Monad Testnet. Show exactly what the registry will
store, then select `Record receipt on Monad`. Point out that opening the wallet
is not success: ShipReceipt waits for confirmation, decodes `ReceiptIssued`, and
reads the receipt back.

## 2:40–3:00 — Public proof

On the public receipt page, show the issuer, selected commit, deployment,
contract, transaction link, failed readiness check, and:

`Evidence integrity: Valid`

Close with: “AI can claim it shipped. ShipReceipt proves it.”

## Pre-recording checklist

- Replace all placeholders in `docs/submission.md`.
- Use the final public repository and hosted application.
- Confirm the demo wallet is on chain `10143` and has enough testnet MON.
- Run one rehearsal without recording.
- Keep the browser zoom and wallet popup readable.
- Never show `.env.local`, terminal history, private keys, or provider tokens.

