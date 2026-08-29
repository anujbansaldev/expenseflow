# ExpenseFlow Agent Engineering Rules

These instructions apply to all automated coding work in this repository.

## General

Act as a senior full-stack engineer. Preserve existing behaviour unless the task explicitly changes it. Inspect existing code and conventions before implementation.

Prefer small, reviewable changes over uncontrolled rewrites.

## Stack

- Next.js App Router
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui-compatible component approach
- MongoDB
- Mongoose
- Zod
- React Hook Form
- Auth.js or an equivalent secure server-session implementation selected during foundation
- Recharts for data visualisation
- date-fns for date operations
- pnpm

Do not replace the chosen core stack without an explicit architecture decision.

## Architecture

Maintain these responsibilities:

- `app/`: routing, layouts, route handlers
- `components/`: presentational and composed UI
- `features/`: feature-specific forms/components/helpers when useful
- `lib/`: infrastructure and generic utilities
- `models/`: Mongoose models
- `repositories/`: database access
- `services/`: business logic
- `schemas/`: Zod schemas
- `types/`: shared types
- `tests/`: integration/e2e support where applicable

React components must not perform direct database access.

## Security

Every private resource query must be scoped to the authenticated user on the server.

Never accept a client-provided `userId` as authorization.

Validate route params, query params, form data and JSON bodies using Zod.

For object IDs:
- validate format
- query with both `_id` and authenticated `userId`
- return 404 for resources not found or not owned when revealing existence would be undesirable

Passwords:
- never log them
- use a strong adaptive password hash if credentials auth is used
- apply reasonable minimum/maximum length
- password-reset tokens must be random, hashed at rest, single use and expiring

Cookies:
- HTTP-only
- Secure in production
- SameSite appropriate to auth flow

Do not expose server secrets via `NEXT_PUBLIC_*`.

Add rate limiting to sensitive endpoints such as:
- login
- registration
- forgot password
- password reset
- export
- uploads when implemented

Sanitize output and do not use unsafe HTML rendering for user-entered text.

## Money

Never use floating point currency as the persisted financial amount.

Persist:
- `amountMinor` as an integer
- `currency` as ISO 4217 code, initially `INR`

Convert only at display/input boundaries.

All financial calculations must operate on minor units.

## Dates

Store timestamps as UTC `Date`.

For date-only financial events, define clear local-time semantics. Default user timezone is stored in settings and used for reporting boundaries.

Do not rely on browser timezone for server reporting calculations without explicit conversion.

## Transactions

Transaction types:
- income
- expense
- transfer

For transfer:
- source and destination accounts must differ
- both accounts must belong to the user
- amount must be positive
- transfer must be committed atomically with any derived balance-cache updates

Do not allow category ownership leaks.

Ledger data is the source of truth. Any cached summary/balance must be rebuildable.

## Deletion

Prefer soft deletion only where audit/history requirements justify it. Otherwise hard deletion is permitted for normal transactions but must safely recalculate derived data.

Never cascade-delete financial history accidentally when deleting a category/account.

Accounts with transactions should normally be archived instead of deleted.

## API

Use consistent JSON envelopes for Route Handlers where APIs are exposed.

Success:
`{ "data": ..., "meta": ...? }`

Error:
`{ "error": { "code": "...", "message": "...", "fieldErrors": ...? } }`

Do not return stack traces to clients.

## UX

Every async view needs:
- loading state
- empty state
- error state
- retry or recovery path where meaningful

Forms:
- labels
- accessible error messages
- keyboard operation
- disabled/submitting state
- duplicate-submission protection

Do not use colour as the only signal.

## Testing

At minimum:
- business-rule unit tests
- validation tests
- repository/service integration tests for critical finance flows
- e2e tests for auth and transaction lifecycle

Critical transfer and authorization tests are mandatory.

## Completion report

After each task, report:
1. files changed
2. key decisions
3. migrations/indexes/config changes
4. commands executed
5. tests/checks that passed or failed
6. remaining risks

Never claim a command/test ran unless it actually ran.
