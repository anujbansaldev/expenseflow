# Phase 3 Prompt — Accounts and Categories

Implement accounts and categories end-to-end.

## Accounts

- list
- create
- edit
- archive/restore
- account detail shell
- opening balance
- account type
- optional institution/last4/notes

Current balance must use ledger-compatible logic even before all ledger UI is complete.

## Categories

- seed user-owned default categories
- list by income/expense
- create custom
- edit
- archive
- support optional parent/subcategory structure if it can be implemented without destabilizing MVP

## Server rules

- every query uses authenticated user scope
- validate ObjectIds
- validate input with Zod
- account/category names length-limited
- used categories/accounts must not be destructively removed
- archived items unavailable for new transactions

## Tests

Mandatory cross-user access attempts.

Create service/repository tests for ownership.

Build responsive pages with loading/error/empty states.

Run quality checks.
