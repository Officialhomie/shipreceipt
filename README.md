# ShipReceipt

> AI can claim it shipped. ShipReceipt proves what actually worked.

ShipReceipt is a build-verification tool for AI-assisted software delivery. It
observes a live deployment and selected technical targets, resolves a real
public GitHub commit, and records a tamper-evident, self-issued receipt on
Monad.

Public repository: https://github.com/Officialhomie/shipreceipt

- [Live application](https://shipreceipt.vercel.app)
- [Verified Receipt #1](https://shipreceipt.vercel.app/receipt/1)
- [Partial Receipt #2](https://shipreceipt.vercel.app/receipt/2)
- [Monad registry](https://testnet.monadvision.com/address/0xAa2F6E23E54125C3B6414BD722db54cC0Ef252E3)
- [Registry deployment transaction](https://testnet.monadvision.com/tx/0x58f96b1df3102fa63980ded1c91af8f74a6bdf810af1099756557cb438a0c2cc)
- [Receipt #1 transaction](https://testnet.monadvision.com/tx/0x88e653a89942d8b64b1f76b569aea86ac6f4951084c5a8def46e6b06ceed4bb1)

Demo flow: open Receipt #1 without a wallet, inspect the checks and integrity
result, then run a new verification with one deliberately missing endpoint to
see ShipReceipt preserve a real failure as `Partial`.

## Problem

AI coding tools can generate software and confident completion reports quickly,
but a report is not proof that the repository exists, the deployment responds,
its health and readiness endpoints work, or a claimed contract has bytecode.
The report can also be edited or deleted later.

## Solution

ShipReceipt performs deterministic checks from the server, packages the results
into versioned canonical JSON, hashes the evidence with `keccak256`, and lets the
repository owner record the root and result through a receipt registry on Monad.
The public receipt page re-hashes the stored evidence and compares it with the
onchain root before showing `Evidence integrity: Valid`.

ShipReceipt deliberately says “repository commit selected for this
verification.” It does not claim that the deployed bytes came from that commit
without a separately verifiable deployment-to-commit signal.

## Why Monad

The evidence JSON remains offchain because it can contain bounded HTTP response
details. Monad stores the small, durable proof: issuer, project ID, selected
commit hash, deployment hash, evidence root, check counts, status, and timestamp.
That makes later evidence modification detectable without placing response data
or secrets onchain.

- Network: Monad Testnet
- Chain ID: `10143`
- Currency: `MON`
- Registry address: [`0xAa2F6E23E54125C3B6414BD722db54cC0Ef252E3`](https://testnet.monadvision.com/address/0xAa2F6E23E54125C3B6414BD722db54cC0Ef252E3)
- Deployment transaction: [`0x58f96b1d…38a0c2cc`](https://testnet.monadvision.com/tx/0x58f96b1df3102fa63980ded1c91af8f74a6bdf810af1099756557cb438a0c2cc)

## Architecture

```text
Browser form
  -> POST /api/verify
     -> public GitHub API
     -> SSRF-safe HTTP checker
     -> optional Monad bytecode check
     -> canonical evidence + keccak256 root
     -> durable Postgres evidence repository
  -> wallet simulates and submits registry transaction
  -> confirmed ReceiptIssued event + contract read
  -> /receipt/[receiptId] re-hashes evidence and compares roots
```

The code separates UI, request schemas, verification checks, GitHub resolution,
evidence, Monad access, and persistence under `app/`, `components/`, and `lib/`.
The Solidity workspace is isolated under `contracts/`.

## Supported checks

- Public GitHub repository existence, non-empty state, default branch, full
  40-character commit SHA, and commit timestamp.
- Deployment reachability with status, redirect bounds, duration, selected
  headers, and a bounded body preview.
- Optional health and readiness endpoints. A readiness `503` or other non-2xx
  response remains a failure.
- Optional Monad contract address validation, RPC chain-ID validation, current
  block number, and bytecode existence.
- Deterministic result mapping: all passed is `Verified`; mixed results are
  `Partial`; no passing checks or failed repository resolution is `Failed`.

No AI model determines the verification result.

## Trust model

Receipts are **self-issued build verifications**. The connected project-owner
wallet is the public issuer; ShipReceipt is not an independent auditor or
certification authority. Repository, deployment, and contract observations are
performed by ShipReceipt. Health and readiness endpoints are project-reported:
ShipReceipt independently records their HTTP response but cannot guarantee that
an endpoint reflects every internal dependency.

Every result is a historical snapshot. `Verified` means all configured checks
passed at that recorded time; `Partial` means the build was reachable but one
or more configured checks failed; `Failed` means the minimum verification
checks were not satisfied; and `Revoked` preserves the receipt in history while
marking it inactive at the issuer's request.

## Evidence model

New evidence uses schema version `2`, with explicit `schemaVersion` and semantic
`verifierVersion` fields. Legacy version `1` evidence remains readable and
hash-compatible. All evidence is validated with Zod. Object keys are
recursively sorted before JSON serialization, then the UTF-8 bytes are hashed
with `keccak256`. Timestamps are captured once as evidence and therefore are
intentional inputs to the hash. Environment variables, arbitrary GitHub API
responses, and unbounded target bodies are never included.

In production, `DATABASE_URL` is mandatory. An explicit migration creates two
namespaced Postgres tables for evidence and receipt metadata; the restricted
application role cannot create or alter schema objects. Local development can
use an explicitly labelled in-memory adapter; the API reports
`persistence: development-memory` and the UI warns that it is not durable.

## Smart contract

`ShipReceiptRegistry.sol` provides one non-upgradeable registry with no admin
backdoor. It prevents duplicate project ownership, restricts issue/revoke calls
to the project owner, validates check counts and status invariants, preserves
historical receipts, and keeps revoked receipts readable.

The statuses are compatible across TypeScript and Solidity:

```text
0 Failed   — zero checks passed
1 Partial  — at least one passed and at least one failed
2 Verified — all checks passed
3 Revoked  — owner revoked an existing receipt
```

## Security guardrails

- Verification requests accept only HTTP(S); production targets require HTTPS.
- Embedded credentials, localhost, loopback, private/link-local IP ranges,
  cloud metadata targets, and private IPv6 are rejected.
- DNS is resolved and preflight-checked before every request and redirect target.
- Verification targets must use standard HTTP/HTTPS ports.
- Redirect count, timeout, request body, and response size are bounded.
- User-controlled headers and application secrets are never forwarded.
- GitHub tokens, database credentials, RPC credentials, and deployer keys remain
  server-side.
- Contract calls are simulated before wallet submission. Success requires a
  confirmed transaction, decoded `ReceiptIssued` event, and matching contract
  read.
- Receipt metadata is accepted only when the configured registry, successful
  transaction, emitted event, onchain fields, and durable evidence all match;
  saved metadata is immutable.

The worker performs application-layer DNS preflight validation, but the Node
fetch connection is not pinned to the validated IP. A malicious domain could
attempt DNS rebinding between resolution and connection. Production deployments
should therefore keep the verifier in a network-isolated worker with outbound
firewall rules that deny private, link-local, and metadata ranges. This is a
documented residual risk, not a claim of complete SSRF elimination.

## Local setup

Requirements: Node.js 20.19+ (Node 24 is selected in `.nvmrc`), npm, and Foundry.

```bash
nvm use
npm install
cp .env.example .env.local
npm run dev
```

For real public receipts, configure `DATABASE_URL`. Onchain recording also
requires `NEXT_PUBLIC_SHIPRECEIPT_CONTRACT_ADDRESS` after registry deployment.
The application runtime never needs `DEPLOYER_PRIVATE_KEY`.

Apply and audit the database with separate owner and runtime connection strings:

```bash
MIGRATION_DATABASE_URL="..." npm run db:migrate
DATABASE_URL="..." npm run db:check
```

`MIGRATION_DATABASE_URL` is migration-only and must not be configured in the
hosted application. See `docs/deployment.md` for the live infrastructure record.

## Environment variables

See `.env.example`. Important boundaries:

- `NEXT_PUBLIC_*` values are intentionally browser-visible.
- `MONAD_RPC_URL`, `GITHUB_TOKEN`, and `DATABASE_URL` are server-only.
- The Foundry deployment script uses an encrypted keystore signer supplied on
  the command line. The application and Vercel never receive a private key.

## Validation

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run verify
```

Contract validation:

```bash
cd contracts
forge fmt --check
forge build
forge test -vvv
```

Current local results on 19 July 2026:

- Application unit tests: 44 passed across 8 suites.
- Contract tests: 12 passed.
- TypeScript: passed in strict mode.
- ESLint: passed.
- Next.js production build: passed with Webpack.
- Live smoke test: homepage `200`, health `200`, public GitHub resolution
  passed, `https://example.com` deployment and health checks passed, deliberate
  missing readiness path returned `404`, and final result remained `Partial`
  with 3/4 checks passed.
- Neon runtime round trip: a `Verified` evidence record was inserted and fetched
  through the real API, then independently re-hashed to the same evidence root.
- Database permission audit: the runtime role can perform only the application
  table operations it needs and has no `CREATE` privilege on the public schema.
- Hosted release: the Vercel homepage and health route returned `200`; all four
  live verification checks passed; durable evidence re-hashed to the same root;
  and Monad receipt `1` was confirmed and served from the public receipt route.
- Deliberate-failure proof: a real readiness request returned `404`, producing
  a durable `Partial` result with 4/5 checks passed. Receipt `2` was confirmed on
  Monad and its Neon, recomputed, and onchain evidence roots match.

The Webpack build flag avoids a Next.js 16.2.10 Turbopack server-bundling issue
observed with the current dependency graph.

## Contract deployment

Fund a dedicated encrypted Foundry account with testnet MON. Keep its password
in a user-only local file and do not place either secret in command history.

```bash
cd contracts
forge script script/Deploy.s.sol:DeployShipReceipt \
  --rpc-url "$MONAD_RPC_URL" \
  --account shipreceipt-deployer \
  --password-file ../.env.deploy.password \
  --broadcast
```

After broadcasting:

1. Wait for a successful transaction receipt.
2. Run `cast code <address> --rpc-url "$MONAD_RPC_URL"` and require non-empty
   bytecode.
3. Record the address, transaction hash, and explorer links below and in
   `docs/submission.md`.
4. Set `NEXT_PUBLIC_SHIPRECEIPT_CONTRACT_ADDRESS` for the web deployment.

## Application deployment

1. Create a public GitHub repository and push `main` without any `.env` files.
2. Import it into Vercel.
3. Configure the public Monad values, server RPC, `DATABASE_URL`, and optional
   `GITHUB_TOKEN` from `.env.example`.
4. Deploy, run `npm run verify`, then repeat the live smoke test against the
   hosted URL.
5. Issue a real receipt and verify `/receipt/[receiptId]` shows valid integrity.

## Demo

The three-minute walkthrough is in `docs/demo-script.md`; submission copy is in
`docs/submission.md`.

## Implemented, tested, deployed

Implemented and locally tested: verification engine, SSRF controls, canonical
evidence hashing, Postgres adapter, registry contract, wallet transaction flow,
public receipt integrity view, responsive UI, documentation, and submission
draft.

Provisioned: an isolated Neon project with migrated schema and restricted
runtime role, a confirmed Monad Testnet registry with verified bytecode, plus a
dedicated Vercel project linked to the public GitHub repository.

Deployed: a validated Vercel Preview and the stable Production application at
[`shipreceipt.vercel.app`](https://shipreceipt.vercel.app), with real Monad
receipts [`1`](https://shipreceipt.vercel.app/receipt/1) and
[`2`](https://shipreceipt.vercel.app/receipt/2). No deployment
identifiers are fabricated in this README.

## Known limitations

- No deployment-provider attestation currently proves that the live deployment
  was built from the selected commit.
- Application-layer DNS checks are not socket/IP-pinned; production should add
  worker-level egress isolation against DNS rebinding.
- Public GitHub API use without a token has a lower rate limit.
- The basic in-process rate limiter should be replaced by a distributed limiter
  for higher production traffic.
- Contract receipt revocation is implemented but the hackathon UI does not yet
  expose a revoke button.
- Vercel Preview URLs are protected by Vercel authentication; the Production
  receipt route is public.

## Hackathon compliance

ShipReceipt is a fresh solo project. It does not copy code from other projects,
does not use hardcoded verification results, keeps failures visible, uses one
focused contract, and is designed for a demonstration under three minutes.
