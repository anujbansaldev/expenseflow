# Phase 1 Prompt — Foundation

Implement Phase 1 of ExpenseFlow.

First read `AGENTS.md`, architecture docs and acceptance criteria.

## Deliver

1. Initialize or normalize a Next.js App Router TypeScript application.
2. Enable strict TypeScript.
3. Configure Tailwind and reusable UI primitives.
4. Configure pnpm scripts:
   - dev
   - lint
   - typecheck
   - test
   - test:integration
   - test:e2e
   - build
5. Add MongoDB/Mongoose connection utility with safe connection reuse.
6. Validate required environment configuration server-side.
7. Add base public/authenticated layout structure.
8. Add consistent application error primitives.
9. Add money utility:
   - parse decimal string to integer minor units
   - format minor units
   - unit tests
10. Add date/timezone utility foundation.
11. Add test framework and Playwright configuration.
12. Copy/adapt `.env.example`.
13. Ensure secrets are gitignored.
14. Add README setup instructions if repository README is incomplete.

## UI

Create only the application shell and placeholder routes needed to validate navigation. Do not prematurely build full modules.

## Security

- no DB code in client bundle
- no env secret exposed
- fail clearly when mandatory server env is missing

## Verify

Run lint, typecheck, unit tests and production build.

Fix failures introduced by this phase.

Do not begin authentication until Phase 1 is green.
