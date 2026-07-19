# Spark hackathon submission

## Project name

ShipReceipt

## Short description

ShipReceipt checks whether an AI-assisted software build actually works and
records a tamper-evident completion receipt on Monad.

## Problem

AI coding agents can generate software and confident completion reports
quickly, but developers, clients, and judges still have to manually check
whether the repository, deployment, endpoints, and contracts actually work.
Those reports can also be edited or deleted later.

## Solution

ShipReceipt performs real checks against a public repository, selected commit,
live deployment, configured endpoints, and optional Monad contract. It records
exactly what passed or failed, stores versioned evidence, hashes it, and anchors
the result on Monad. Anyone can open the public receipt and confirm that the
available evidence still matches the onchain record.

## Why Monad

ShipReceipt performs the technical checks offchain. Monad preserves the
receipt's evidence root, result, issuer, timestamp, and check totals so neither
the developer nor ShipReceipt can quietly rewrite the recorded evidence later.

## Production URL

https://shipreceipt.vercel.app

## GitHub URL

https://github.com/Officialhomie/shipreceipt

## Network

Monad Testnet — chain ID `10143`

## Contract address

[`0xAa2F6E23E54125C3B6414BD722db54cC0Ef252E3`](https://testnet.monadvision.com/address/0xAa2F6E23E54125C3B6414BD722db54cC0Ef252E3)

## Contract deployment transaction

[`0x58f96b1df3102fa63980ded1c91af8f74a6bdf810af1099756557cb438a0c2cc`](https://testnet.monadvision.com/tx/0x58f96b1df3102fa63980ded1c91af8f74a6bdf810af1099756557cb438a0c2cc)

## Verified receipt

- Result: `Verified` — 4/4 configured checks passed
- Public receipt: https://shipreceipt.vercel.app/receipt/1
- Transaction: [`0x88e653a89942d8b64b1f76b569aea86ac6f4951084c5a8def46e6b06ceed4bb1`](https://testnet.monadvision.com/tx/0x88e653a89942d8b64b1f76b569aea86ac6f4951084c5a8def46e6b06ceed4bb1)

## Partial receipt — recommended demo

- Result: `Partial` — 4/5 configured checks passed
- Real failed check: readiness endpoint returned HTTP `404`
- Public receipt: https://shipreceipt.vercel.app/receipt/2
- Transaction: [`0xa77b628f8f0af4247d92ade693b6af5077b399ffa5da8183ab9f0d098190c914`](https://testnet.monadvision.com/tx/0xa77b628f8f0af4247d92ade693b6af5077b399ffa5da8183ab9f0d098190c914)
- Evidence schema/verifier: `2` / `0.2.0`
- Evidence integrity: stored, recomputed, and Monad roots match

## Demo video

`VIDEO_URL_TO_ADD_AFTER_PUBLICATION`

The final script is approximately 2 minutes 22 seconds and is available in
`docs/demo-script.md`.

## Social post

`SOCIAL_POST_URL_TO_ADD_AFTER_PUBLICATION`

The ready-to-publish copy is available in `docs/social-post.md`.

## Verified release status

- Application tests: 47 passed across 8 suites
- Solidity tests: 12 passed
- TypeScript: passed
- ESLint: passed without warnings
- Production build: passed
- Receipt #1 evidence integrity: Valid
- Receipt #2 evidence integrity: Valid
- Durable Neon persistence: confirmed
- Monad Testnet registry bytecode: confirmed non-empty

## Honest scope

ShipReceipt verifies selected technical checks at a recorded time. Receipts are
self-issued, health and readiness endpoints are project-reported, and the
selected GitHub commit is not proof that it produced the live deployment.
ShipReceipt is not a security audit, independent certification, or guarantee of
future availability.
