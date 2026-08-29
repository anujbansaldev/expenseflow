# Phase 7 Prompt — Goals, Calendar and Reports

## Goals

- create/edit/archive
- target amount
- optional target date
- contributions
- contribution history
- progress
- prevent negative contribution/current total

## Calendar

Show:
- transaction activity
- bills
- recurring due items

Use timezone-aware date grouping.

Do not fetch unbounded history.

## Reports

Implement:
- date range
- transaction type/account/category filters
- income/expense summary
- category/account breakdown
- CSV export

CSV:
- authenticated user only
- same filters as UI
- neutralize spreadsheet formula injection in text cells
- safe filename
- appropriate response headers
- rate/size limits

## Tests

- goal contribution maths
- calendar date boundaries
- export filters
- export cross-user isolation
- formula injection cases

Run quality checks.
