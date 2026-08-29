# Future Roadmap

Implement only after the core ledger is stable.

## Imports

CSV/Excel bank statement import:
- mapping wizard
- preview
- duplicate detection
- import batch
- rollback strategy
- category assignment

## Receipts

- private attachment storage
- thumbnails
- transaction attachment
- OCR extraction
- manual verification before saving extracted values

## AI

Possible:
- category suggestion
- merchant normalization
- natural-language analytics query
- spending summary

Rules:
- never silently rewrite financial records
- show suggestions for confirmation
- explain data sent to external AI providers
- protect financial privacy
- implement opt-in where appropriate

## WhatsApp entry

Example:
`Spent 850 on dinner`

Backend:
- verify webhook signature
- map verified sender to user
- parse amount/category
- confirm ambiguous entries
- idempotency on provider message ID

## Shared workspace

Introduce:
- Workspace
- Membership
- roles
- invitations
- resource `workspaceId`
- authorization policy engine

Do not retrofit casually after many direct `userId` assumptions; plan migration.

## Multi-currency

Requires explicit model for:
- account currency
- transaction currency
- transfer FX rate
- base reporting currency
- historical FX rate
- gain/loss semantics if required

Do not simply convert using today's rate for historical reports.

## Business mode

Potential:
- vendors
- reimbursable expenses
- GST fields
- cost centres
- employee expenses
- approvals
- policy limits

This becomes a separate product domain and must be scoped carefully.
