# Phase 10 Prompt — Deployment Readiness

Prepare ExpenseFlow for staging/production without embedding environment-specific secrets.

## Deliver/review

- `.env.example`
- deployment README
- production build
- CI quality gate
- MongoDB environment strategy
- index strategy
- scheduled recurrence configuration
- job authentication
- health endpoint
- logging/error reporting integration points
- security headers
- production cookie settings
- backup/restore runbook
- release checklist

## CI

At minimum:
- frozen install
- lint
- typecheck
- test
- build

Add integration/E2E where environment supports them.

## Production check

Ensure:
- no development-only bypass
- no hardcoded localhost callback
- no wildcard insecure CORS
- no public cron secret
- no committed secrets
- no `console.log` dumping sensitive objects
- no production DB in test scripts

Provide exact deployment steps for the selected host.

Do not claim production-ready until the acceptance checklist is reviewed.
