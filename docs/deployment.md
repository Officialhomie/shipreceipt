# Deployment record

Last updated: 19 July 2026

This file records only non-secret deployment identifiers and verified public
configuration. Credentials, connection strings, and private keys must never be
added here.

## Monad Testnet

- Chain ID: `10143`
- Currency: `MON`
- RPC: `https://testnet-rpc.monad.xyz`
- Explorer: `https://testnet.monadvision.com`
- Deployment wallet: `0x84752F9589eA3698bb879b3C4112C110ecb9fA65`
- Funding transaction: `0xf54edccd454cc1ec817c74cae67c49776eebeb08c4cddc0e5e6a6e9d515b46b2`
- Registry address: `0xAa2F6E23E54125C3B6414BD722db54cC0Ef252E3`
- Deployment transaction: `0x58f96b1df3102fa63980ded1c91af8f74a6bdf810af1099756557cb438a0c2cc`
- Deployment block: `46335410`
- Deployment status: successful
- Runtime bytecode: verified non-empty (`3,196` bytes)
- Initial `nextReceiptId`: `1`

The RPC returned chain ID `10143`, served current blocks, confirmed both the
funding and deployment transactions, and reported the wallet balance. The Monad
Foundation endpoint `https://rpc-testnet.monadinfra.com` intermittently failed
DNS resolution from the deployment machine and is not the current runtime RPC.

## Neon

- Organization: `org-purple-fire-12204884`
- Project: `shipreceipt-production`
- Project ID: `crimson-lake-06624566`
- Region: `aws-us-east-1`
- Primary branch: `main`
- Branch ID: `br-tiny-salad-ava0e9a7`
- Database: `shipreceipt`
- Migration role: `shipreceipt_owner`
- Application role: `shipreceipt_runtime`
- Applied migration: `db/migrations/001_initial.sql`

The runtime role passed `npm run db:check`: it can select/insert evidence,
select/insert/update receipt metadata, and cannot create objects in the public
schema. A real API write/read round trip produced evidence ID
`f91a1a53-6c67-4d28-8896-20518b4a9114`; its stored and independently
recomputed evidence roots matched.

## Vercel

- Scope: `onetruehomies-projects`
- Project: `shipreceipt`
- Project ID: `prj_re7G2ooaOaiAbCbSCQiZWDH8XAy5`
- Framework: Next.js
- Node.js: `24.x`
- Git repository: `https://github.com/Officialhomie/shipreceipt`
- Production URL: `https://shipreceipt.vercel.app`
- Validated Preview URL:
  `https://shipreceipt-ka7hifyi2-onetruehomies-projects.vercel.app`
- Preview deployment ID: `dpl_6f5Sk9enKLvLXSLzeZJh2DoUuyAd`
- Preview source commit: `bd30267`

The Production environment contains the Neon runtime connection, Monad RPC,
chain ID, explorer URL, registry address, anticipated application URL, and
verification safety limits. It intentionally does not contain a deployer key or
`MIGRATION_DATABASE_URL`.

## Live verification and receipt

- Evidence ID: `62cc1c76-b44b-45ce-a9ed-12f6e3e17295`
- Evidence result: `Verified` (`4/4` checks)
- Evidence root:
  `0x21ba11847a94f510c04d5aa2f803e4840b33d5ae1f9955474c99b91e31a1f01d`
- Independent root recomputation: matched
- Project registration transaction:
  `0x3ed40e3c8ac88fbcf39100f74a82e3728db71dfd4c6aeb6e5b2d527a0e54f4cd`
- Receipt ID: `1`
- Receipt transaction:
  `0x88e653a89942d8b64b1f76b569aea86ac6f4951084c5a8def46e6b06ceed4bb1`
- Public receipt URL: `https://shipreceipt.vercel.app/receipt/1`

The receipt was read back from the registry and matched the issuer, project,
commit hash, deployment hash, evidence root, `4/4` check counts, timestamp, and
Verified status. The hosted metadata API and public receipt route returned HTTP
`200`. The explicit Preview also returned HTTP `200` for its homepage, health
route, and Neon-backed receipt API after Vercel protection bypass.

## Partial receipt audit — 19 July 2026

- Evidence ID: `66eabd12-8dd3-4ebb-80cb-b00cf2b3c5a4`
- Evidence schema: `2`
- Verifier version: `0.2.0`
- Result: `Partial` (`4/5` checks)
- Deliberate readiness observation: HTTP `404`
- Evidence root: `0x2c51a3cf0ffb6eb5e8d457c5d9ab5c390ff5a957269fa67bf860a66123ee1cf6`
- Receipt ID: `2`
- Receipt transaction: `0xa77b628f8f0af4247d92ade693b6af5077b399ffa5da8183ab9f0d098190c914`
- Issuer: `0x84752F9589eA3698bb879b3C4112C110ecb9fA65`
- Public receipt URL: `https://shipreceipt.vercel.app/receipt/2`

The missing readiness path was requested over the network and returned a real
failure; it was not hardcoded. The evidence was fetched back from Neon and its
canonical root was independently recomputed. The Neon, recomputed, and Monad
roots match exactly. Direct contract readback returned Partial status `1`,
`4/5` counts, and the expected issuer.
