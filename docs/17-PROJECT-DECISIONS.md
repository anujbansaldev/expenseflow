# Architecture Decision Record — Initial Decisions

## ADR-001 — Next.js full-stack instead of separate MERN services

**Decision:** Next.js App Router frontend and server endpoints in one codebase.

**Reason:** Lower operational complexity, shared TypeScript contracts, faster product iteration.

**Future trigger to extract API:** native mobile/public API scale, independent backend scaling, or team ownership justifies separation.

## ADR-002 — MongoDB + Mongoose

**Decision:** MongoDB persistence with Mongoose models.

**Reason:** clear schemas/indexes/hooks/type integration and suitable document model.

Do not mix multiple ORMs/ODMs.

## ADR-003 — Integer minor-unit money

**Decision:** all currency amount fields persisted as integer minor units.

**Reason:** avoids floating-point financial errors.

## ADR-004 — Ledger as source of truth

**Decision:** account totals and analytics derive from ledger. Caches are optional and rebuildable.

**Reason:** prevents hidden state divergence.

## ADR-005 — User-scoped MVP

**Decision:** resources are directly owned by users in initial release.

**Reason:** simpler and safer MVP.

**Consequence:** adding shared workspaces later requires a deliberate migration.

## ADR-006 — Service/repository boundaries

**Decision:** domain logic separate from route/UI and persistence queries.

**Reason:** testability and ability to expose the same logic via alternate transports later.
