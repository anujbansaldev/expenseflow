# Phase 4 Prompt — Transaction Ledger

This is a critical phase. Implement carefully.

## Deliver

- Transaction model/indexes
- income
- expense
- transfer
- create/edit/delete
- transaction detail
- server-driven transaction list
- pagination
- search
- date/type/account/category filters
- sorting allowlist
- account balance calculations
- recent transaction reusable query
- quick-add UX

## Money

Persist only integer minor units.

API/form amount uses a decimal string and shared safe parser.

## Ownership

Validate:
- source account
- destination account
- category

All must belong to the authenticated user.

## Transfers

- positive amount
- different source/destination
- same currency in MVP
- excluded from income/expense cash-flow totals
- atomic where multi-document state is updated
- editing/deleting remains consistent

## Search safety

No uncontrolled Mongo operators.
No arbitrary regex patterns.
Cap query length.

## Tests — release blocker

User A cannot reference any User B account/category/transaction.

Financial fixture:
- opening balances
- income
- expense
- transfer
- expected account balances
- transfer excluded from cash-flow totals

Test edit and delete effects.

Run lint/typecheck/tests/build and fix issues.
