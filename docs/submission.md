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

`TODO: add public GitHub repository URL`

## Monad network

Monad Testnet — chain ID `10143`

## Contract address

`TODO: add address after deployment and bytecode confirmation`

## Contract deployment transaction

`TODO: add confirmed transaction and explorer URL`

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
production build, and a live network smoke test pass. Public repository,
contract deployment, Vercel deployment, durable production database, and the
first real receipt transaction remain pending authenticated account and wallet
actions.

