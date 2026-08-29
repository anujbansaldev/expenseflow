# Acceptance Criteria

## Global

- No private page usable without authentication.
- No User A request can access User B data.
- No currency is persisted as floating-point decimal input.
- Invalid input produces safe validation errors.
- All primary flows work on mobile and desktop.
- Production build succeeds.
- TypeScript strict checks succeed.
- Lint succeeds.
- Critical tests succeed.

## Accounts

- User can create an account with opening balance.
- Current balance reflects ledger correctly.
- Used account is archived rather than destructive deletion by default.
- Archived account cannot be selected for new entry.

## Categories

- Defaults exist after onboarding.
- User can create custom category.
- Income/expense type mismatch is rejected server-side.
- Used categories remain available historically after archive.

## Transactions

- Expense lowers relevant account balance.
- Income increases relevant account balance.
- Transfer lowers source and increases destination.
- Transfer does not increase income/expense analytics.
- Editing/deleting changes all relevant results.
- Filters work server-side.
- Pagination has an enforced maximum page size.

## Dashboard

- Period totals exactly match ledger fixture.
- Empty user sees no fake values.
- Chart handles zero-data state.
- Date range respects settings timezone.

## Budget

- Only qualifying expenses count.
- Transfer is excluded.
- Warning/exceeded state has textual indicator.

## Recurring

- Due occurrence is generated.
- Retry cannot create duplicate.
- Paused rule creates nothing.
- Existing generated transaction is not silently modified when future rule changes.

## Bills

- Upcoming/paid/overdue/skipped supported.
- Mark-paid cannot double-count.
- Linked transaction deletion has defined behaviour.

## Goals

- Contribution changes progress.
- Negative contribution rejected.
- Contribution history remains consistent.

## Reports

- CSV contains only authenticated user's records.
- Filters are applied.
- Potential spreadsheet formulas in text fields are neutralized.

## Security

- reset token expires and is single-use
- login rate limiting exists
- secrets are server-only
- stack traces are not sent in production
- protected resource IDs are ownership-scoped
