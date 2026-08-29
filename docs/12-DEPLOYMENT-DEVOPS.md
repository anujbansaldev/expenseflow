# Deployment and DevOps

## Environments

Maintain separate:
- development
- staging
- production

Use separate MongoDB databases/credentials.

## Recommended deployment

Option A:
- Next.js on Vercel
- MongoDB Atlas
- managed email provider
- managed object storage later

Option B:
- Next.js Node deployment on VPS/container
- Nginx reverse proxy
- MongoDB Atlas
- process/container supervision

Do not self-host MongoDB casually without backup, monitoring and security competence.

## Environment variables

See `templates/.env.example`.

Production secrets must be configured in deployment secret storage.

## Build pipeline

Minimum CI:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run integration/e2e according to CI infrastructure.

## Database indexes

Mongoose auto-indexing in production should be intentionally configured.

Maintain an index deployment/check strategy rather than relying on surprise runtime index builds for large collections.

## Backups

Production:
- enable Atlas backup appropriate to deployment
- define retention
- document restore test
- periodically test restore, not just backup creation

## Scheduled recurring work

Use a supported scheduler:
- Vercel Cron where plan/cadence is appropriate
- platform cron
- external scheduler hitting an authenticated internal job endpoint
- dedicated worker later

Scheduler job must:
- authenticate
- be idempotent
- process bounded batches
- tolerate retries
- log outcome
- prevent duplicate recurring entries

## Health

Provide a safe health endpoint that does not leak secrets.

Consider:
- application status
- optional DB connectivity check with controlled timeout

## Release checklist

- production env configured
- HTTPS
- secure cookie behaviour verified
- CSP/security headers verified
- MongoDB network access and least privilege
- email URLs use production origin
- auth callbacks use production origin
- rate limiter configured
- analytics/export limits configured
- error reporting configured
- backups enabled
- tests/build pass
- mobile smoke test
- authorization smoke test
