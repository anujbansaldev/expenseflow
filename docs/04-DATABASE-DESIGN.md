# MongoDB Data Model

## Global conventions

All private documents contain:

- `userId: ObjectId`
- `createdAt: Date`
- `updatedAt: Date`

Money:
- `amountMinor: integer`
- `currency: string` (`INR` initially)

Do not persist user-entered currency as a JavaScript floating-point amount.

## User

```ts
{
  _id: ObjectId,
  name: string,
  email: string,              // normalized lowercase, unique
  emailVerifiedAt?: Date,
  passwordHash?: string,      // only for credentials auth
  imageUrl?: string,
  status: "active" | "disabled",
  lastLoginAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

Indexes:
- unique `{ email: 1 }`

## UserSettings

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  baseCurrency: "INR",
  timezone: string,           // IANA e.g. Asia/Kolkata
  locale: string,
  dateFormat: string,
  theme: "system" | "light" | "dark",
  weekStartsOn: 0 | 1,
  createdAt: Date,
  updatedAt: Date
}
```

Index:
- unique `{ userId: 1 }`

## Account

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  name: string,
  type: "cash" | "bank" | "wallet" | "credit_card" | "savings" | "other",
  currency: string,
  openingBalanceMinor: number,
  institution?: string,
  last4?: string,
  notes?: string,
  isArchived: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

Indexes:
- `{ userId: 1, isArchived: 1, name: 1 }`
- `{ userId: 1, createdAt: -1 }`

Current balance is derived:
`opening + income - expense +/- transfers`

If a balance cache is later introduced, ledger remains source of truth.

## Category

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  name: string,
  type: "income" | "expense",
  parentId?: ObjectId,
  icon?: string,
  colorToken?: string,
  isSystemDefault: boolean,
  isArchived: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

Indexes:
- `{ userId: 1, type: 1, isArchived: 1 }`
- optional case-normalized uniqueness per user/type

## Transaction

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  type: "income" | "expense" | "transfer",

  amountMinor: number,
  currency: string,

  accountId: ObjectId,

  // transfer only
  destinationAccountId?: ObjectId,

  // income/expense only
  categoryId?: ObjectId,

  occurredAt: Date,

  merchant?: string,
  description?: string,
  notes?: string,
  tags: string[],

  source: "manual" | "recurring" | "import" | "system",
  recurringRuleId?: ObjectId,
  recurringOccurrenceKey?: string,

  createdAt: Date,
  updatedAt: Date
}
```

Rules:
- `amountMinor > 0`
- transfer destination required only for transfer
- transfer destination != source
- category required for income/expense
- expense category must be expense type
- income category must be income type
- referenced account/category documents must belong to same user
- all participating accounts must have same currency in MVP transfer flow unless multi-currency transfer is explicitly designed

Indexes:
- `{ userId: 1, occurredAt: -1, _id: -1 }`
- `{ userId: 1, accountId: 1, occurredAt: -1 }`
- `{ userId: 1, categoryId: 1, occurredAt: -1 }`
- `{ userId: 1, type: 1, occurredAt: -1 }`
- `{ userId: 1, merchant: 1 }` where useful
- unique sparse `{ userId: 1, recurringOccurrenceKey: 1 }`

For large search requirements, evaluate Atlas Search rather than expensive unbounded regex.

## Budget

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  name: string,
  scope: "overall" | "category",
  categoryId?: ObjectId,
  amountMinor: number,
  currency: string,
  period: "monthly" | "weekly" | "yearly" | "custom",
  customStart?: Date,
  customEnd?: Date,
  warningThresholdPercent: number, // e.g. 80
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## RecurringRule

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  type: "income" | "expense",
  amountMinor: number,
  currency: string,
  accountId: ObjectId,
  categoryId: ObjectId,
  merchant?: string,
  description?: string,
  notes?: string,
  schedule: {
    frequency: "daily" | "weekly" | "monthly" | "yearly",
    interval: number,
    dayOfWeek?: number,
    dayOfMonth?: number,
    monthOfYear?: number
  },
  startsAt: Date,
  endsAt?: Date,
  nextRunAt: Date,
  lastRunAt?: Date,
  status: "active" | "paused" | "completed",
  createdAt: Date,
  updatedAt: Date
}
```

## Bill

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  name: string,
  expectedAmountMinor?: number,
  currency: string,
  dueAt: Date,
  accountId?: ObjectId,
  categoryId?: ObjectId,
  status: "upcoming" | "paid" | "overdue" | "skipped",
  paidTransactionId?: ObjectId,
  reminderDaysBefore: number[],
  notes?: string,
  createdAt: Date,
  updatedAt: Date
}
```

## Goal

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  name: string,
  targetAmountMinor: number,
  currentAmountMinor: number,
  currency: string,
  targetDate?: Date,
  status: "active" | "completed" | "archived",
  notes?: string,
  createdAt: Date,
  updatedAt: Date
}
```

## GoalContribution

Prefer a separate immutable contribution collection if goal history is required:

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  goalId: ObjectId,
  amountMinor: number,
  occurredAt: Date,
  note?: string,
  createdAt: Date
}
```

## Notification

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  type: string,
  title: string,
  body: string,
  readAt?: Date,
  data?: Record<string, string>,
  createdAt: Date
}
```

## AuditEvent

```ts
{
  _id: ObjectId,
  userId?: ObjectId,
  action: string,
  entityType?: string,
  entityId?: ObjectId,
  outcome: "success" | "failure",
  ipHash?: string,
  userAgentSummary?: string,
  metadata?: Record<string, unknown>,
  createdAt: Date
}
```

Do not put sensitive secret values or unbounded financial notes into audit metadata.

## PasswordResetToken / VerificationToken

Store:
- user/email reference
- hashed token
- expiry
- consumed timestamp

Raw token exists only in outgoing link and transient request processing.

## Referential deletion rules

### Account
If transactions exist:
- archive account
- do not hard delete by default

### Category
If transactions exist:
- archive category
- do not destroy historical category references

### User
Account deletion requires a defined privacy/data-retention workflow. Do not casually cascade from ordinary UI actions.
