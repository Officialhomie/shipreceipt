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

## Current honest status

Local implementation, application tests, contract tests, lint, type-check,
production build, and live network smoke tests pass. The public repository is
live. The isolated Neon production database is migrated and has passed a real
API persistence/integrity round trip. The dedicated Vercel project is linked.
The Monad Testnet registry deployment is confirmed and its address has non-empty
bytecode. The Vercel Preview and Production routes pass hosted smoke tests. A
real 4/4 Verified evidence record is durable in Neon, and receipt `1` is
confirmed on Monad and available through the public receipt route.
