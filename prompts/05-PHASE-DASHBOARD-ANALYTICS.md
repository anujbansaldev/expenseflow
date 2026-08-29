# Phase 5 Prompt — Dashboard and Analytics

Implement production-quality dashboard and analytics from real ledger data.

## Dashboard

- date range selector
- total tracked account balance
- income
- expenses
- net cash flow
- cash-flow trend
- expense category breakdown
- account balance summary
- recent transactions
- budget/upcoming-bill placeholders only if those modules are not yet implemented

## Analytics

- cash flow
- category spending
- account activity
- spending trend

Use MongoDB aggregation efficiently.

## Rules

- transfer excluded from income/expense
- timezone-correct reporting bounds
- no fake chart data
- no loading all transactions into browser for aggregation
- bounded date-range queries
- all data scoped to authenticated user

## UX

- empty states
- accessible chart labels/summary
- responsive charts
- skeletons with stable layout
- date range visible

## Tests

Use deterministic ledger fixture and verify aggregate values.

Run performance review of query/index usage where possible.

Run quality checks.
