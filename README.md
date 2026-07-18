# ShipReceipt

> AI can claim it shipped. ShipReceipt proves it.

ShipReceipt verifies a public GitHub repository, runs real checks against a live
deployment, creates canonical evidence, and anchors its `keccak256` root in a
receipt registry on Monad.

## Status

This repository is a fresh hackathon build. Local implementation and tests are
in progress. No hosted URL, contract address, or deployment transaction is
claimed until each is independently verified.

## Local setup

1. Use Node.js 20.19 or newer (Node 22 or 24 LTS is recommended).
2. Copy `.env.example` to `.env.local` and set only the values you need.
3. Run `npm install` and `npm run dev`.

Never commit `.env.local` or a deployer private key. The application does not
need the deployer key at runtime.

## Validation

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run verify
```

Contract validation uses Foundry:

```bash
cd contracts
forge fmt --check
forge build
forge test -vvv
```

Detailed architecture, deployment, security, demonstration, and limitations
will be documented as the corresponding implementation lands.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
