# Financial Business Rules

## Currency

MVP base currency: INR.

Architecture retains `currency` on financial documents.

Persist amount in minor units.

Input:
`"1234.56"` -> `123456`

Reject:
- negative amount input
- zero for financial entries
- invalid decimal scale
- exponent notation if parser does not explicitly support it
- commas in raw API amount unless parser intentionally normalizes UI display input

## Income

Effect on account:
`+ amount`

Included in:
- income totals
- net cash flow

Not included in expense totals.

## Expense

Effect on account:
`- amount`

Included in:
- expense totals
- budget usage if category/period qualifies

## Transfer

Source:
`- amount`

Destination:
`+ amount`

Net worth/account aggregate:
no net change

Cash-flow analytics:
must not count as income or expense

Source and destination must differ.

## Account balance

For an account:

`openingBalance + qualifying income - qualifying expense + incoming transfers - outgoing transfers`

Archived accounts remain in historical reports when selected/required.

## Editing transaction

Recalculate all affected:
- account balances/aggregates
- dashboard period
- category analytics
- budgets
- bill linkage if relevant

If summaries are calculated on-demand, correctness comes naturally from ledger.

## Deleting transaction

Delete only after:
- ownership validation
- linked-domain validation

If a transaction marks a bill paid, define whether deleting it reopens the bill. Recommended: linked bill becomes `upcoming` or `overdue` based on current due date, with clear user confirmation.

## Categories

Expense transaction cannot use income category.

Income transaction cannot use expense category.

Archived category:
- remains visible on historical transaction
- cannot be selected for a new transaction by default

## Account archival

Archived account:
- historical transactions remain
- cannot be selected for new transactions
- can be restored

## Budget calculation

Only expense transactions count.

Transfers do not count.

Budget timezone boundary must use user's configured timezone.

For category budget:
- include matching category
- subcategory inclusion must be explicitly defined; recommended: include descendants if hierarchical category model is enabled

## Recurrence

Occurrence generation must be idempotent.

Unique occurrence identity example:
`<ruleId>:<scheduledISODate>`

On scheduler retry, duplicate occurrence must not be created.

When a rule is edited:
- future occurrences use new values
- existing generated transactions are not silently rewritten

## Bills

A bill is a reminder/obligation record.

Mark Paid may:
1. link an existing transaction, or
2. create an expense transaction

Do not double-count.

Overdue is derived or updated when due date passes and status is still upcoming.

## Goals

Contributions must be positive.

Removing a contribution reduces current total.

Do not permit current amount to become negative.

Goal reaching/exceeding target can mark complete but should not discard additional contribution history.

## Date range

Analytics intervals:
- `from` inclusive
- `to` exclusive is recommended internally

Document UI conversion clearly.

## Timezone

User reporting periods use configured IANA timezone.

Persist transaction timestamp UTC.

## Credit cards

MVP can treat credit cards as accounts with balance semantics defined clearly.

Do not pretend to provide accounting-grade statement reconciliation unless implemented.

## Data correction

Users can edit records, but critical mutation history may be retained in audit metadata without storing unnecessary sensitive text.
