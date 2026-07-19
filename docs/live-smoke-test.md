# Local live smoke test — 18 July 2026

Targets:

- Repository: `https://github.com/openai/openai-node`
- Deployment: `https://example.com`
- Health: `/`
- Deliberately failing readiness: `/readiness-deliberately-missing`

Observed results:

- Local homepage: HTTP `200`, ShipReceipt brand present.
- Application health: HTTP `200`, `{ status: "ok" }`.
- Repository resolution: passed; public repository and full commit SHA resolved.
- Deployment: passed, HTTP `200`.
- Health: passed, HTTP `200`.
- Readiness: failed, HTTP `404`.
- Deterministic result: `Partial`, 3 passed / 1 failed / 4 total.
- Evidence root was produced with `keccak256`.
- Persistence: `development-memory`, correctly labelled non-durable.

This test proves live failure preservation and local network behavior. It is not
evidence of Monad registry deployment, a real receipt transaction, durable
production storage, or hosted application availability.

## Durable Neon round trip — 18 July 2026

- Neon project: `crimson-lake-06624566` (`shipreceipt-production`)
- Database: `shipreceipt`
- Migration: `001_initial.sql` applied successfully
- Runtime role: `shipreceipt_runtime`
- Schema creation privilege: denied
- Application table privileges: verified
- API evidence ID: `f91a1a53-6c67-4d28-8896-20518b4a9114`
- Result: `Verified`
- Persistence: `durable`
- Stored evidence root:
  `0xa3d91e45e024253fe785a6051b6ecdb138e73eb9f35970d2914663b6c3b40063`
- Independently recomputed root: exact match

This record verifies real hosted Postgres persistence through ShipReceipt's
`POST /api/verify` and `GET /api/evidence/[id]` routes. It is intentionally
retained because the application has no deletion workflow and is clearly named
as an infrastructure persistence check.

## Hosted release smoke test — 19 July 2026

- Production URL: `https://shipreceipt.vercel.app`
- Explicit Preview URL:
  `https://shipreceipt-7rnxcyiez-onetruehomies-projects.vercel.app`
- Homepage: HTTP `200`
- Health: HTTP `200`, service `shipreceipt`, version `1`
- Repository check: passed
- Deployment check: passed
- Health check: passed
- Monad contract bytecode check: passed
- Deterministic result: `Verified`, 4 passed / 0 failed / 4 total
- Durable evidence ID: `62cc1c76-b44b-45ce-a9ed-12f6e3e17295`
- Evidence root:
  `0x21ba11847a94f510c04d5aa2f803e4840b33d5ae1f9955474c99b91e31a1f01d`
- Independently recomputed root: exact match
- Project registration transaction:
  `0x3ed40e3c8ac88fbcf39100f74a82e3728db71dfd4c6aeb6e5b2d527a0e54f4cd`
- Receipt ID: `1`
- Receipt transaction:
  `0x88e653a89942d8b64b1f76b569aea86ac6f4951084c5a8def46e6b06ceed4bb1`
- Public receipt route: `https://shipreceipt.vercel.app/receipt/1`
- Onchain readback: issuer, project, commit, deployment, evidence root, `4/4`
  counts, timestamp, and Verified status all matched the hosted evidence.
- Receipt metadata API and public receipt route: HTTP `200`

The Preview required Vercel's authenticated protection bypass; its homepage,
health route, and Neon-backed receipt API all returned HTTP `200` after access.
