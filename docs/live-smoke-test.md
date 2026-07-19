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
