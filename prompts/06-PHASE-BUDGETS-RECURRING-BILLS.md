# Phase 6 Prompt — Budgets, Recurring Transactions and Bills

## Budgets

Implement:
- overall/category budgets
- monthly period first
- create/edit/delete/deactivate
- progress
- warning threshold
- exceeded state

Only expense transactions count.

Transfers do not count.

## Recurring

Implement:
- recurring income/expense rule
- daily/weekly/monthly/yearly intervals
- start/end
- nextRunAt
- pause/resume
- occurrence history link

Create protected recurrence-processing service/job.

### Critical requirement

Occurrence generation is idempotent.

A scheduler retry for the same rule/date must not create a duplicate transaction.

Use a unique occurrence key/index and safe update logic.

## Bills

Implement:
- upcoming
- paid
- overdue
- skipped
- create/edit
- mark paid
- link/create expense without double counting

## Tests

- budget expense-only calculation
- recurring retry
- pause
- end date
- bill mark paid once
- ownership attacks

Run full relevant checks.
