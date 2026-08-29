# Testing Strategy

## Test pyramid

### Unit
Fast tests for:
- money parser/formatter
- date interval helpers
- budget calculations
- transfer effects
- recurrence schedule calculation
- Zod schemas
- CSV injection neutralization

### Integration
Use isolated test database for:
- repositories
- services
- user scoping
- account/category ownership
- transfer correctness
- recurring idempotency
- linked bill payment

Never point automated tests at production database.

### E2E
Playwright critical flows:
1. register/sign in
2. create first account
3. add income
4. add expense
5. create second account
6. transfer
7. filter transactions
8. create budget
9. logout
10. confirm protected routes reject anonymous access

## Mandatory authorization tests

Create User A and User B.

Verify A cannot:
- read B account
- edit B account
- delete/archive B account
- read B transaction
- edit/delete B transaction
- use B category in A transaction
- transfer to/from B account
- read B analytics by crafted IDs

These tests are release blockers.

## Financial correctness tests

Example:
- Account opening = ₹10,000
- Income = ₹5,000
- Expense = ₹1,250
- Outgoing transfer = ₹2,000
- Incoming transfer = ₹500

Expected:
₹12,250

Transfers must not affect total cash-flow income/expense.

## Money edge cases

- 0
- 0.01
- 1.10
- large permitted amount
- negative
- too many decimals
- exponential string
- whitespace
- non-numeric
- integer overflow/policy limit

## Recurring tests

- first occurrence
- retry same occurrence
- next occurrence
- pause
- resume
- end date
- month with fewer days
- timezone boundary

## UI/accessibility testing

- keyboard use
- focus management
- labels/errors
- mobile viewport
- empty states
- loading states
- chart fallback/summary

Automated accessibility tooling can complement, not replace, manual keyboard checks.

## Commands

The exact scripts should be implemented in `package.json`, preferably:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm build
```

## CI gate

Pull requests should fail when:
- lint fails
- typecheck fails
- critical tests fail
- production build fails
