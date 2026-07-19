# Spark submission draft

## Project name

ShipReceipt

## Short description

ShipReceipt is a build-verification tool for AI-assisted software delivery. It
records what actually passed or failed in a tamper-evident, self-issued receipt
on Monad.

## Problem

AI coding tools can produce applications and confident completion reports
quickly, but developers still have to manually verify whether the repository,
deployment, endpoints, and contracts actually work. Those reports can also be
edited or deleted after the fact.

## Solution

ShipReceipt performs live technical checks against a public repository,
deployed application, configured endpoints, and optional Monad contract. It
packages every pass and failure into versioned canonical evidence, hashes that
evidence, and records its selected commit, result, timestamp, issuer, and
evidence root through a smart contract on Monad. Anyone can inspect the public
receipt and verify that the visible evidence still matches the onchain record.
Receipts explicitly identify themselves as self-issued build verifications,
not independent audits or security certifications.

## Live URL

https://shipreceipt.vercel.app

## GitHub URL

https://github.com/Officialhomie/shipreceipt

## Monad network

Monad Testnet — chain ID `10143`

## Contract address

[`0xAa2F6E23E54125C3B6414BD722db54cC0Ef252E3`](https://testnet.monadvision.com/address/0xAa2F6E23E54125C3B6414BD722db54cC0Ef252E3)

## Contract deployment transaction

[`0x58f96b1df3102fa63980ded1c91af8f74a6bdf810af1099756557cb438a0c2cc`](https://testnet.monadvision.com/tx/0x58f96b1df3102fa63980ded1c91af8f74a6bdf810af1099756557cb438a0c2cc)

## Example receipt

- Receipt ID: `1`
- Transaction: [`0x88e653a89942d8b64b1f76b569aea86ac6f4951084c5a8def46e6b06ceed4bb1`](https://testnet.monadvision.com/tx/0x88e653a89942d8b64b1f76b569aea86ac6f4951084c5a8def46e6b06ceed4bb1)
- Public receipt URL: https://shipreceipt.vercel.app/receipt/1

## Deliberate-failure receipt

- Receipt ID: `2`
- Result: `Partial` — 4/5 passed; the real readiness request returned HTTP `404`
- Evidence schema/verifier: `2` / `0.2.0`
- Evidence root: `0x2c51a3cf0ffb6eb5e8d457c5d9ab5c390ff5a957269fa67bf860a66123ee1cf6`
- Transaction: [`0xa77b628f8f0af4247d92ade693b6af5077b399ffa5da8183ab9f0d098190c914`](https://testnet.monadvision.com/tx/0xa77b628f8f0af4247d92ade693b6af5077b399ffa5da8183ab9f0d098190c914)
- Public receipt URL: https://shipreceipt.vercel.app/receipt/2

## Demo video

Not yet published. The entrant must add the final public video URL (maximum
three minutes) before submitting.

## Social post

Not yet published. The entrant must add the final public post URL if entering
the Most Viral Solution prize.

## Demo summary

The demo resolves a real public repository and full commit SHA, checks a live
deployment and health endpoint, preserves a deliberately failing readiness
check as a failure, produces a `Partial` result, records the evidence root on
Monad Testnet, and recomputes the root on the public receipt page.
The recorded example is Receipt `2`: four checks passed and the readiness
request returned a real HTTP `404`.

## Current honest status

Local implementation, application tests, contract tests, lint, type-check,
production build, and live network smoke tests pass. The public repository is
live. The isolated Neon production database is migrated and has passed a real
API persistence/integrity round trip. The dedicated Vercel project is linked.
The Monad Testnet registry deployment is confirmed and its address has non-empty
bytecode. The Vercel Preview and Production routes pass hosted smoke tests. A
real 4/4 Verified evidence record is durable in Neon, and receipt `1` is
confirmed on Monad and available through the public receipt route.
The deliberate failure evidence is durable in Neon, Receipt `2` is confirmed on
Monad, and its stored, independently recomputed, and onchain roots match.
