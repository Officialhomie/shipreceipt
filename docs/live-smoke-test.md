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
