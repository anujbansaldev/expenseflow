# Validation and Error Handling

## Validation layers

1. UI usability validation
2. Server Zod validation — authoritative
3. Mongoose schema constraints — persistence safety
4. Database indexes — uniqueness/integrity support

Never rely only on browser validation.

## Recommended input limits

Adjust only with documented reason.

- name: 1–100
- account name: 1–80
- category name: 1–60
- merchant: 0–120
- description: 0–240
- notes: 0–2000
- tag: 1–40
- tags: max 20
- email: standard practical max
- password: use selected auth policy; also enforce maximum to avoid hashing abuse

## Amount parsing

API should receive decimal amount as string.

Create shared function:
- validate regex/decimal form
- max two decimals for INR
- convert to integer minor unit
- reject unsafe/out-of-range values

Do not call `parseFloat(amount) * 100`.

## ObjectId

Use a reusable Zod/refinement.

Invalid ID:
- return 400 for malformed route/query input
- not-owned valid ID generally maps to 404

## Date validation

Reject impossible dates.

Analytics:
- validate from < to
- cap maximum requested period if expensive
- normalize according to timezone policy

## Pagination

- page >= 1
- pageSize >= 1
- pageSize <= configured maximum

## Sorting

Allowlist fields:
- occurredAt
- amount
- createdAt

Do not accept arbitrary MongoDB sort fields.

## Search

Trim.
Cap length.
Do not convert uncontrolled search into arbitrary regex.
Escape regex metacharacters if regex is used.

## Error taxonomy

Domain errors:
- `VALIDATION_ERROR`
- `UNAUTHENTICATED`
- `FORBIDDEN`
- `NOT_FOUND`
- `CONFLICT`
- `RATE_LIMITED`
- `ACCOUNT_ARCHIVED`
- `CATEGORY_ARCHIVED`
- `CURRENCY_MISMATCH`
- `INVALID_TRANSFER`
- `DEPENDENCY_EXISTS`
- `INTERNAL_ERROR`

## Error boundaries

Use:
- page-level error boundaries where suitable
- `not-found` behaviour for resource pages
- safe toast/form errors for mutations

## Logging unexpected errors

Log:
- correlation/request ID
- operation
- safe user reference
- error class/message
- stack server-side where permitted

Return generic safe response:
`Something went wrong. Please try again.`

Do not leak Mongoose/MongoDB internals.
