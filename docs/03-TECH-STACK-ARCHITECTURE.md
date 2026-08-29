# Technical Stack and Architecture

## Selected architecture

Next.js full-stack monolith with clean internal boundaries.

```text
Browser
  |
  v
Next.js App Router
  |-- Server Components
  |-- Client Components
  |-- Route Handlers
  |-- Server-side auth
  |
  v
Services (business rules)
  |
  v
Repositories (persistence queries)
  |
  v
Mongoose
  |
  v
MongoDB Atlas
```

## Recommended technologies

- Next.js — latest stable App Router compatible release
- React — version required by selected Next.js
- TypeScript — strict
- Tailwind CSS
- shadcn/ui-compatible primitives
- MongoDB Atlas
- Mongoose
- Zod
- React Hook Form
- Auth.js or equivalent secure session solution
- Recharts
- date-fns
- Lucide React
- Sonner
- pino-compatible structured logging if server environment supports it
- Vitest for unit/integration tests
- React Testing Library for component behaviour where valuable
- Playwright for E2E

Avoid pinning versions in planning documents. Lock tested versions in `pnpm-lock.yaml`.

## Runtime

MongoDB/Mongoose code must execute in Node.js runtime.

Do not place database-dependent routes on Edge runtime.

## Layer responsibilities

### Presentation
Components render data and collect user intent. They do not decide resource ownership or financial rules.

### Route handlers/server boundary
- authenticate request
- parse untrusted input
- run Zod validation
- call service
- map domain errors to safe HTTP responses

### Services
Own:
- financial rules
- authorization-aware domain operations
- transfer workflow
- recurring occurrence creation
- budget calculations
- destructive-operation decisions

### Repositories
Own:
- Mongoose queries
- pagination
- projection
- aggregation
- user-scoped persistence

Repositories must not contain UI concerns.

## Data fetching

Prefer Server Components for initial dashboard/page reads where practical.

Use client fetching/mutations only for interactive flows.

Do not send large raw MongoDB documents to client components.

Return DTOs containing only fields required by UI.

## State

Use local/form state by default.

Do not introduce Redux unless a proven cross-application state problem exists.

URL query parameters should represent shareable filters:
- page
- date range
- account
- category
- transaction type
- search
- sort

## MongoDB connection

Create a single reusable/cached server connection strategy suitable for development hot reload and production runtimes.

Fail fast when `MONGODB_URI` is missing.

Do not expose connection strings to client code.

## Transactions and atomicity

MongoDB transactions require an appropriate deployment (Atlas/replica set).

Use sessions/transactions for operations that update multiple persistent documents where partial completion would corrupt business state.

Idempotency is required for recurring-occurrence generation.

## Caching

Financial data is correctness-sensitive.

Default:
- authenticated finance pages: dynamic
- do not cache private Route Handler data globally
- invalidate/revalidate only when scoping and consistency are proven

## Observability

Use structured server logs with:
- request/action correlation
- operation name
- user ID only when appropriate and non-sensitive
- error code
- latency

Never log passwords, reset tokens, session secrets or full financial free-text payloads unnecessarily.
