# Pages and Route Map

## Public

- `/`
  - marketing/landing page optional for commercial release
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/verify-email`

## Authenticated

Use one canonical authenticated route convention. Recommended:

- `/dashboard`
- `/transactions`
- `/transactions/new`
- `/transactions/[id]`
- `/accounts`
- `/accounts/[id]`
- `/categories`
- `/budgets`
- `/recurring`
- `/bills`
- `/goals`
- `/analytics`
- `/reports`
- `/calendar`
- `/settings`
- `/settings/profile`
- `/settings/security`

Do not duplicate `/dashboard/dashboard`.

## Page responsibilities

### Dashboard
- summary
- trend
- categories
- budget
- recent transactions
- bills

### Transactions
- server-driven filter/search
- table/list
- create/edit/delete
- CSV export shortcut

### Account detail
- account metadata
- current balance
- account cash flow
- filtered transaction list

### Analytics
Tabs or sections:
- Cash Flow
- Spending
- Categories
- Accounts
- Trends

### Reports
- date range
- filters
- export
- printable summary later

## Route protection

Authenticated layout protects all private pages.

Still enforce authorization at every data operation; layout protection alone is not enough.

## Not found

Owned resource routes must return safe not-found behaviour for missing/not-owned IDs.
