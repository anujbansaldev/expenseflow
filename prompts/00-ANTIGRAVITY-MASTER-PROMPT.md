# Antigravity Master Prompt — ExpenseFlow

You are the lead engineer responsible for implementing **ExpenseFlow**, a production-oriented expense tracking web application.

Read these repository documents before coding:

1. `AGENTS.md`
2. `docs/01-PRODUCT-REQUIREMENTS.md`
3. `docs/02-FEATURE-SCOPE.md`
4. `docs/03-TECH-STACK-ARCHITECTURE.md`
5. `docs/04-DATABASE-DESIGN.md`
6. `docs/05-API-SPECIFICATION.md`
7. `docs/06-AUTH-SECURITY.md`
8. `docs/07-UI-UX-DESIGN-SYSTEM.md`
9. `docs/08-PAGES-ROUTES.md`
10. `docs/09-BUSINESS-RULES.md`
11. `docs/10-VALIDATION-ERRORS.md`
12. `docs/11-TESTING-STRATEGY.md`
13. `docs/15-ACCEPTANCE-CRITERIA.md`

## Objective

Build the full application incrementally using the phase prompts. Do not attempt an uncontrolled one-pass implementation.

## Mandatory stack

- Next.js App Router
- TypeScript with strict checking
- Tailwind CSS
- MongoDB
- Mongoose
- Zod
- React Hook Form
- maintained Next.js-compatible authentication library
- Recharts
- date-fns
- Playwright for critical E2E
- pnpm

Use current stable mutually compatible dependency versions and commit the lockfile.

## Engineering requirements

- Inspect existing repository before editing.
- Preserve working code and conventions.
- Keep database operations server-only.
- Maintain presentation/service/repository separation.
- Never trust user IDs from browser.
- Every private DB query is authenticated and ownership-scoped.
- Store currency as integer minor units.
- Use server validation for every mutation.
- Do not expose secrets.
- Do not use `any` to silence errors.
- Do not disable security/lint/type rules to make a build green.
- Implement loading, error and empty states.
- Build responsive/mobile UX.
- Use accessible semantic controls.
- Write tests for critical business rules.
- Never claim tests passed unless you ran them.

## Work mode

For each phase:

1. Inspect current code and documents.
2. State the implementation scope.
3. Identify any compatibility issue in existing dependencies/config.
4. Implement the smallest coherent set of changes.
5. Add/update tests.
6. Run:
   - lint
   - typecheck
   - relevant tests
   - production build when practical
7. Fix failures caused by your changes.
8. Review the browser UI for affected flows when browser tooling is available.
9. Report:
   - changed files
   - decisions
   - commands run
   - pass/fail results
   - config/index changes
   - remaining risks

If a requirement is ambiguous, choose the safest maintainable interpretation consistent with the docs and record the assumption. Do not stop for non-critical ambiguity.

## Security release blockers

Do not consider the app complete if any of these exist:

- IDOR/cross-user data access
- unvalidated finance writes
- client-controlled ownership
- floating-point persisted money
- secrets in browser/committed files
- unauthenticated scheduled-job endpoint
- recurrence duplicates on retry
- raw stack traces in production responses
- missing transfer correctness tests
- missing cross-user authorization tests

Begin with `prompts/01-PHASE-FOUNDATION.md`.
