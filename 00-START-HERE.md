# Start Here

## 1. Goal

Build a secure, maintainable and responsive expense tracker where every registered user can privately track income, expenses, account transfers, budgets, bills, recurring transactions and savings goals, with useful analytics and reports.

## 2. Architecture choice

Use **Next.js App Router + TypeScript + MongoDB** rather than a separate React + Express application for the first production version.

Why:

- One repository and deployment unit
- Server Components and server-side rendering where useful
- Route Handlers for HTTP APIs
- Shared TypeScript types and validation
- Simpler authentication/session integration
- Less duplicated infrastructure
- Can still extract an independent API later if native mobile apps or external integrations justify it

Do not tightly couple UI components to MongoDB. Keep layers:

`UI -> Route/Server Action -> Service -> Repository -> Mongoose -> MongoDB`

## 3. Development order

Follow the phase prompts in order:

1. Foundation
2. Authentication
3. Accounts and categories
4. Transactions and transfers
5. Dashboard and analytics
6. Budgets, recurring items and bills
7. Goals, calendar and reports
8. Settings, security and audit
9. Quality, accessibility and performance
10. Deployment readiness

## 4. Before starting

Prepare:

- Node.js current LTS compatible with the selected Next.js release
- pnpm
- MongoDB Atlas development cluster or local MongoDB replica set
- SMTP provider for verification/password reset
- Optional object storage provider for future receipts
- Git repository

## 5. Important rule for the agent

The agent must inspect the current repository before changing code.

It must **not**:

- overwrite working features without reason
- silently weaken TypeScript
- add `any` to bypass errors
- expose secrets
- trust client-provided user IDs
- perform unscoped MongoDB queries for private resources
- store currency as floating point values
- mark incomplete code with fake TODO implementations and claim completion
- suppress errors without logging/handling them
- disable lint rules just to pass checks

## 6. Definition of done

A phase is complete only when:

- requested functionality is implemented
- TypeScript type check passes
- lint passes
- relevant tests pass
- validation exists
- authorization exists
- loading, empty and error states exist
- mobile layout works
- no secret is exposed
- the agent summarizes changed files and verification performed
