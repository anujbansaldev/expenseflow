# ExpenseFlow — Next.js + MongoDB Development Build Kit

This package is the implementation blueprint for a production-oriented expense tracking application.

**Working product name:** ExpenseFlow  
**Primary stack:** Next.js App Router + TypeScript + MongoDB + Mongoose  
**Target:** Responsive web application / installable PWA-ready architecture  
**Development workflow:** Google Antigravity agent-driven implementation

> ExpenseFlow is a working name. Rename it before launch if required.

## What is included

- Product requirements and functional scope
- Technical architecture
- MongoDB data model
- API contract
- Authentication and authorization requirements
- Security rules
- UI/UX design system and page map
- Financial business rules
- Validation and error handling rules
- Testing strategy
- Deployment and operational guidance
- Acceptance criteria
- Implementation roadmap
- Antigravity master prompt
- Phase-by-phase Antigravity prompts
- Code review and bug-fix prompts
- Environment variable template
- Seed-data specification
- Recommended source tree

## Recommended implementation strategy

Do **not** ask the coding agent to build the whole platform in a single uncontrolled pass.

Use:

1. `00-START-HERE.md`
2. `AGENTS.md`
3. `prompts/00-ANTIGRAVITY-MASTER-PROMPT.md`
4. Run the prompts in `prompts/01` through `prompts/10` sequentially.
5. At the end of each phase, run tests, linting and type checking before moving forward.
6. Use `prompts/99-CODE-REVIEW-PROMPT.md` before production deployment.

## Core engineering decisions

- Next.js App Router is used for frontend and backend.
- TypeScript strict mode is mandatory.
- MongoDB is the source database.
- Mongoose is used for schema modelling and indexes.
- Monetary values are stored as **integer minor units**, never floating-point currency.
  - INR: `₹1,234.56` → `123456` paise.
- All private data is always scoped to the authenticated user.
- Server-side authorization is mandatory even when the UI hides an action.
- Zod validates untrusted input at every server boundary.
- Transfers are atomic and must never create inconsistent account balances.
- Ledger transactions are the source of truth.
- Destructive operations must be protected and auditable.
- Secrets must never be committed or exposed to browser bundles.
- Accessibility and responsive behaviour are acceptance requirements, not optional polish.

## MVP modules

1. Authentication
2. Dashboard
3. Accounts
4. Categories
5. Transactions
6. Transfers
7. Budgets
8. Recurring transactions
9. Bills/reminders
10. Savings goals
11. Analytics
12. Reports/export
13. Calendar
14. Settings
15. Audit/security foundations

## Future modules

- CSV/Excel import
- Receipt upload and OCR
- AI categorisation
- WhatsApp entry
- Shared/family workspaces
- Multi-currency
- GST/business expense mode
- Bank integrations
- Mobile application/API extraction

See `docs/16-FUTURE-ROADMAP.md`.
