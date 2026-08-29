# Feature Scope and Priority

## P0 — Required for first usable release

| Module | Scope |
|---|---|
| Auth | Register, login, logout, forgot/reset password |
| Onboarding | Currency, timezone, first account, default categories |
| Accounts | Create/edit/archive/list/detail |
| Categories | Defaults and custom categories |
| Transactions | Income, expense, transfer |
| Transaction list | Search, filters, pagination |
| Dashboard | Summary, trends, categories, recent transactions |
| Settings | Profile, locale/timezone/currency |
| Security | User scoping, validation, rate limit, safe errors |
| Testing | Critical auth/authorization/transaction tests |

## P1 — Full product release

- Budgets
- Recurring transactions
- Bills
- Savings goals
- Calendar
- CSV export
- Audit log
- Notifications centre
- Dark/light theme
- PWA metadata/readiness

## P2 — Enhancement

- Excel export/import
- Receipt attachments
- Receipt OCR
- AI category suggestions
- Custom dashboards
- Shared family workspace
- Multi-currency conversion
- Email and push reminders

## P3 — Commercial SaaS expansion

- Organization/workspace model
- Roles and permissions
- Subscription plans
- Admin portal
- Usage limits
- Team approvals
- Business expense policies
- Bank feed providers
- Public API/webhooks
- Mobile apps

## Scope-control rule

Do not implement P2/P3 while P0 has incomplete security, financial correctness or tests.
