# Spark submission draft

## Project name

ShipReceipt

## Short description

ShipReceipt verifies a live software deployment, binds the evidence to a GitHub
commit, and records a tamper-evident build receipt on Monad.

## Problem

AI coding tools can produce applications and confident completion reports
quickly, but developers still have to manually verify whether the repository,
deployment, endpoints, and contracts actually work. Those reports can also be
edited or deleted after the fact.

## Solution

ShipReceipt performs live verification checks against a public repository and
deployed application, packages the results into canonical evidence, hashes that
evidence, and records its selected commit, result, timestamp, and evidence root
through a smart contract on Monad. Anyone can inspect the public receipt and
verify that the visible evidence still matches the onchain record.

## Live URL

`TODO: add verified Vercel production URL`

## GitHub URL

https://github.com/Officialhomie/shipreceipt

## Monad network

Monad Testnet — chain ID `10143`

## Contract address

[`0xAa2F6E23E54125C3B6414BD722db54cC0Ef252E3`](https://testnet.monadvision.com/address/0xAa2F6E23E54125C3B6414BD722db54cC0Ef252E3)

## Contract deployment transaction

[`0x58f96b1df3102fa63980ded1c91af8f74a6bdf810af1099756557cb438a0c2cc`](https://testnet.monadvision.com/tx/0x58f96b1df3102fa63980ded1c91af8f74a6bdf810af1099756557cb438a0c2cc)

## Example receipt

- Receipt ID: `TODO`
- Transaction: `TODO`
- Public receipt URL: `TODO`

## Demo video

`TODO: add public video URL, maximum 3 minutes`

## Social post

`TODO: add public post URL for the Most Viral Solution prize`

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
bytecode. The Vercel Preview/Production releases and first real receipt remain.
