# HTTP API Specification

This application may use Server Actions for selected same-app mutations, but core domain operations must remain service-layer functions so they can be exposed through Route Handlers when required.

## Response format

### Success
```json
{
  "data": {}
}
```

Optional:
```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 100,
    "hasNextPage": true
  }
}
```

### Error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields.",
    "fieldErrors": {
      "amount": ["Amount must be greater than zero."]
    }
  }
}
```

No stack traces in production responses.

## Authentication

Suggested paths depend on selected auth library:

- `/api/auth/*`

Application endpoints must obtain identity from the trusted server session.

## Dashboard

### GET `/api/dashboard/summary`
Query:
- `from`
- `to`

Returns:
- opening/period summary as defined
- income
- expenses
- net cash flow
- account balances
- category breakdown
- recent transactions
- budget snapshot
- upcoming bills

Large sections can be separate endpoints if latency requires.

## Accounts

### GET `/api/accounts`
Filters:
- archived

### POST `/api/accounts`
Body:
```json
{
  "name": "HDFC Bank",
  "type": "bank",
  "openingBalance": "10000.00",
  "currency": "INR"
}
```

Server parses decimal string to minor units.

### GET `/api/accounts/:id`

### PATCH `/api/accounts/:id`

### DELETE `/api/accounts/:id`
Expected behaviour:
- archive when historical ledger entries exist
- actual delete only when safely unused, if implemented

## Categories

### GET `/api/categories?type=expense`

### POST `/api/categories`

### PATCH `/api/categories/:id`

### DELETE `/api/categories/:id`
Prefer archive if referenced.

## Transactions

### GET `/api/transactions`

Query:
- `page`
- `pageSize`
- `type`
- `accountId`
- `categoryId`
- `from`
- `to`
- `q`
- `sort`

Default page size: 25.
Maximum page size: enforce a reasonable cap such as 100.

### POST `/api/transactions`

Income/expense:
```json
{
  "type": "expense",
  "amount": "850.00",
  "accountId": "...",
  "categoryId": "...",
  "occurredAt": "2026-08-24T13:00:00.000Z",
  "merchant": "Restaurant",
  "notes": "",
  "tags": ["dinner"]
}
```

Transfer:
```json
{
  "type": "transfer",
  "amount": "5000.00",
  "accountId": "...",
  "destinationAccountId": "...",
  "occurredAt": "2026-08-24T13:00:00.000Z"
}
```

### GET `/api/transactions/:id`

### PATCH `/api/transactions/:id`

### DELETE `/api/transactions/:id`

Any transfer mutation must revalidate both account ownerships.

## Budgets

- `GET /api/budgets`
- `POST /api/budgets`
- `GET /api/budgets/:id`
- `PATCH /api/budgets/:id`
- `DELETE /api/budgets/:id`

## Recurring

- `GET /api/recurring`
- `POST /api/recurring`
- `GET /api/recurring/:id`
- `PATCH /api/recurring/:id`
- `POST /api/recurring/:id/pause`
- `POST /api/recurring/:id/resume`
- `DELETE /api/recurring/:id`

Internal recurrence runner:
- authenticate using platform scheduler secret or protected internal mechanism
- never expose an unauthenticated job endpoint

## Bills

- `GET /api/bills`
- `POST /api/bills`
- `GET /api/bills/:id`
- `PATCH /api/bills/:id`
- `POST /api/bills/:id/mark-paid`
- `POST /api/bills/:id/skip`
- `DELETE /api/bills/:id`

When mark-paid creates an expense transaction, use a safe atomic/idempotent workflow.

## Goals

- `GET /api/goals`
- `POST /api/goals`
- `GET /api/goals/:id`
- `PATCH /api/goals/:id`
- `POST /api/goals/:id/contributions`
- `DELETE /api/goals/:id`

## Analytics

- `GET /api/analytics/cash-flow`
- `GET /api/analytics/categories`
- `GET /api/analytics/accounts`
- `GET /api/analytics/spending-trend`

All require bounded date ranges.

## Reports

### GET `/api/reports/transactions.csv`

Apply user-selected filters.

Headers must prevent spreadsheet formula injection:
values beginning with `=`, `+`, `-` or `@` in textual cells should be escaped/neutralized appropriately.

Apply rate limits and practical date/export-size limits.

## Settings

- `GET /api/settings`
- `PATCH /api/settings/profile`
- `PATCH /api/settings/preferences`
- `POST /api/settings/change-password`

## HTTP semantics

- 200 success
- 201 created
- 204 deletion without response body where appropriate
- 400 malformed/validation
- 401 unauthenticated
- 403 authenticated but prohibited when semantically appropriate
- 404 missing/not-owned resource when avoiding resource enumeration
- 409 conflict/idempotency/duplicate conflict
- 429 rate limited
- 500 unexpected server error

## Route-handler checklist

Every private route:
1. authenticate
2. validate input
3. validate resource IDs
4. scope query to user
5. call service
6. return DTO
7. log safe failure metadata
