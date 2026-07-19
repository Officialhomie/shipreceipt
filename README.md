# ShipReceipt

> AI can claim it shipped. ShipReceipt proves what actually worked.

ShipReceipt checks selected parts of a real software build and records what
passed or failed in a tamper-evident receipt on Monad.

## Live links

- [Live app](https://shipreceipt.vercel.app)
- [Verified example — Receipt #1](https://shipreceipt.vercel.app/receipt/1)
- [Partial example — Receipt #2](https://shipreceipt.vercel.app/receipt/2)
- [Public repository](https://github.com/Officialhomie/shipreceipt)
- [Monad registry](https://testnet.monadvision.com/address/0xAa2F6E23E54125C3B6414BD722db54cC0Ef252E3)

## Thirty-second explanation

AI coding agents move quickly, but a “task complete” message is still a claim.
ShipReceipt checks the public repository, selected commit, live deployment,
configured endpoints, and optional Monad contract. It records every pass and
failure, saves versioned evidence, and can anchor the result on Monad.

Anyone can open the resulting public receipt without connecting a wallet. The
receipt explains what was checked, when it happened, who issued it, and whether
the available evidence still matches the onchain record.

## Real example

[Receipt #2](https://shipreceipt.vercel.app/receipt/2) is the clearest product
demo. Four of five real checks passed. The configured readiness endpoint
returned HTTP `404`, so ShipReceipt recorded `Partial` instead of manufacturing
a success screen.

- Result: `Partial` — 4/5 checks passed
- Failed check: readiness endpoint, HTTP `404`
- Evidence schema: `2`
- Verifier version: `0.2.0`
- [Receipt transaction](https://testnet.monadvision.com/tx/0xa77b628f8f0af4247d92ade693b6af5077b399ffa5da8183ab9f0d098190c914)
- Evidence integrity: independently recomputed root matches Neon and Monad

[Receipt #1](https://shipreceipt.vercel.app/receipt/1) remains the backward-
compatible `Verified` example with 4/4 configured checks passing.

## Problem

AI coding tools can generate software and confident completion reports quickly.
But “complete” does not always mean the deployment is live, the health endpoint
works, dependencies are ready, or the contract was actually deployed.
Developers, clients, technical teams, and hackathon judges still have to verify
those claims manually. The original completion report can also be edited or
deleted later.

## Solution

ShipReceipt performs deterministic checks against the real project. It records:

- the public repository and commit selected for the check;
- the live deployment response;
- optional health and readiness responses;
- optional Monad chain and contract-bytecode observations;
- what passed, what failed, and how long each check took;
- when the snapshot was recorded; and
- the wallet that issued the receipt.

No AI model decides the verdict. Detailed evidence remains offchain; its root
and result can be recorded on Monad so later evidence changes become visible.

## Why Monad

ShipReceipt performs the technical checks offchain. Monad preserves the
receipt's result, issuer, timestamp, check totals, selected hashes, and evidence
root. If the developer—or ShipReceipt itself—changes the available evidence
later, its recomputed root will no longer match the public receipt.

The blockchain does not decide whether the software is correct. It preserves
the integrity of the recorded result.

- Network: Monad Testnet
- Chain ID: `10143`
- Currency: `MON`
- Registry: [`0xAa2F6E23E54125C3B6414BD722db54cC0Ef252E3`](https://testnet.monadvision.com/address/0xAa2F6E23E54125C3B6414BD722db54cC0Ef252E3)
- [Registry deployment transaction](https://testnet.monadvision.com/tx/0x58f96b1df3102fa63980ded1c91af8f74a6bdf810af1099756557cb438a0c2cc)
- [Receipt #1 transaction](https://testnet.monadvision.com/tx/0x88e653a89942d8b64b1f76b569aea86ac6f4951084c5a8def46e6b06ceed4bb1)
- [Receipt #2 transaction](https://testnet.monadvision.com/tx/0xa77b628f8f0af4247d92ade693b6af5077b399ffa5da8183ab9f0d098190c914)

## How it works

1. Resolves a public GitHub repository and selected commit.
2. Checks the live deployment and configured endpoints.
3. Confirms optional Monad contract bytecode.
4. Generates and stores versioned evidence.
5. Records the evidence root and result on Monad after wallet approval.
6. Recomputes the evidence root on the public receipt page.

New evidence uses schema version `2` and verifier `0.2.0`. Legacy version `1`
evidence remains readable and hash-compatible, which keeps Receipt #1 valid.
Object keys are recursively sorted before JSON serialization and the UTF-8
bytes are hashed with `keccak256`.

## Supported checks

- Public GitHub repository existence, non-empty state, default branch, full
  commit SHA, and commit timestamp.
- Live deployment reachability, HTTP status, redirect bounds, duration,
  selected response headers, and a bounded body preview.
- Optional project-reported health and readiness endpoints.
- Optional Monad RPC chain-ID validation, block number, contract address, and
  bytecode existence.
- Deterministic status mapping: all passed is `Verified`; mixed results are
  `Partial`; insufficient minimum checks are `Failed`.

## Trust model

Receipts are **self-issued build verifications**. The connected project-owner
wallet is the public issuer. ShipReceipt is not an independent auditor or
certification authority.

Repository, deployment, and contract checks are independently observed by
ShipReceipt. Health and readiness endpoints are project-reported: ShipReceipt
records their HTTP response but cannot guarantee that an endpoint represents
every internal dependency.

Every receipt is a historical snapshot. A `Verified` receipt means all
configured checks passed at the recorded time. It is not proof of future uptime,
complete functionality, security, or deployment provenance. The selected
GitHub commit is not proven to have produced the deployed application.

## Architecture

```text
Browser form
  -> POST /api/verify
     -> public GitHub API
     -> guarded HTTP checker
     -> optional Monad bytecode check
     -> versioned evidence + keccak256 root
     -> durable Neon Postgres evidence store
  -> wallet simulates and submits registry transaction
  -> confirmed ReceiptIssued event + contract read
  -> /receipt/[receiptId] recomputes and compares evidence roots
```

The application code is separated under `app/`, `components/`, and `lib/`.
The isolated Foundry workspace is under `contracts/`.

## Local setup

Requirements: Node.js 20.19+ (Node 24 is selected in `.nvmrc`), npm, and Foundry.

```bash
nvm use
npm install
cp .env.example .env.local
npm run dev
```

Durable receipts require `DATABASE_URL`. Recording also requires
`NEXT_PUBLIC_SHIPRECEIPT_CONTRACT_ADDRESS`. The application runtime never needs
a deployer private key.

Apply and audit database permissions with separate owner and runtime strings:

```bash
MIGRATION_DATABASE_URL="..." npm run db:migrate
DATABASE_URL="..." npm run db:check
```

See [docs/deployment.md](docs/deployment.md) for the non-secret live
infrastructure record and `.env.example` for the configuration contract.

## Validation

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run verify

cd contracts
forge fmt --check
forge build
forge test -vvv
```

Verified on 19 July 2026:

- Application tests: **47 passed across 8 suites**
- Solidity tests: **12 passed**
- TypeScript: passed
- ESLint: passed without warnings
- Next.js production build: passed with Webpack
- Receipt #1: 4/4 `Verified`, legacy v1 evidence integrity valid
- Receipt #2: 4/5 `Partial`, schema v2/verifier `0.2.0`, evidence integrity valid
- Neon persistence: Receipt #2 evidence retrieved through the Production API
- Monad: chain ID `10143`, registry runtime bytecode non-empty

## Deployment

The stable application is deployed at
[shipreceipt.vercel.app](https://shipreceipt.vercel.app). Vercel stores the Neon
runtime connection, Monad RPC, public network values, registry address, and
verification limits. It intentionally does not store the deployer key or
`MIGRATION_DATABASE_URL`.

The registry was deployed from an encrypted Foundry account. Receipt metadata
is accepted only when the configured registry, successful transaction, emitted
event, onchain receipt fields, and durable evidence all match. Saved receipt
metadata is immutable.

Detailed deployment identifiers and smoke-test evidence are in
[docs/deployment.md](docs/deployment.md) and
[docs/live-smoke-test.md](docs/live-smoke-test.md).

## Security

- Verification accepts only HTTP(S); Production targets require HTTPS.
- Embedded credentials, localhost, loopback, private/link-local addresses,
  cloud metadata targets, private IPv6, and nonstandard ports are rejected.
- DNS is preflight-checked before each request and redirect target.
- Redirects, timeouts, request bodies, response bodies, and previews are bounded.
- Authentication headers, cookies, and application secrets are not forwarded.
- GitHub tokens, database credentials, RPC credentials, and deployer keys remain
  server-side.
- Public APIs validate boundary inputs and return distinct 4xx/5xx states.
- Receipt metadata writes are rate-limited and validated against Monad.

Application-layer DNS checks are not socket/IP-pinned. A larger public service
should isolate verification workers and deny private, link-local, and metadata
ranges at the network-egress layer.

## Known limitations

- A selected commit is not proof that it produced the live deployment.
- Self-issued receipts are not independent audits.
- Health and readiness endpoints are project-reported.
- Receipts are historical snapshots, not future-availability guarantees.
- ShipReceipt is not a security audit or guarantee of complete functionality.
- Public GitHub use without a token has a lower rate limit.
- The current process-local rate limiter should be distributed at larger scale.
- Contract revocation exists, but the hackathon UI does not expose it.

## Hackathon compliance

ShipReceipt is a focused solo Spark hackathon project. It does not hardcode
verification outcomes, keeps real failures visible, uses one purpose-built
Monad contract, and is designed for a demo under three minutes.

- [Final demo script](docs/demo-script.md)
- [Submission copy](docs/submission.md)
- [Final submission checklist](docs/final-submission-checklist.md)
- [Social post draft](docs/social-post.md)
