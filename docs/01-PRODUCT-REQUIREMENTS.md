# Product Requirements Document

## Product

**ExpenseFlow** is a privacy-focused expense and cash-flow tracking web application for individuals.

## Product objective

Give users a clear and reliable picture of:
- what they own across tracked accounts
- how much income they receive
- where money is spent
- whether spending is within budget
- upcoming bills
- recurring cash-flow commitments
- progress toward savings goals
- spending and saving trends over time

## Primary user

An individual who manages personal expenses across cash, bank accounts, wallets and cards.

## Secondary future users

- Families
- Freelancers
- Small businesses
- Teams with approval workflows

These future personas must not complicate the initial implementation.

## Core user journeys

### Registration
1. User opens registration.
2. Supplies name, email and password.
3. Server validates input.
4. Account is created.
5. Verification email is sent where enabled.
6. User verifies and signs in.
7. Default categories are provisioned.
8. Onboarding asks for base currency, timezone and first account.

### Add expense
1. User chooses Add Transaction.
2. Selects Expense.
3. Enters amount, account, category and date.
4. Optionally enters merchant, note and tags.
5. Server validates ownership and business rules.
6. Transaction is saved.
7. Dashboard/account/budget results reflect the new ledger entry.

### Add income
Same lifecycle as expense but transaction type is income and an income category is used.

### Transfer
1. User selects source account.
2. Selects a different destination account.
3. Enters amount/date/note.
4. Server confirms both accounts belong to user.
5. Transfer is committed atomically.
6. It must not count as income or expense in cash-flow analytics.

### Budget
1. User creates an overall or category budget.
2. Selects period.
3. Spending is calculated from qualifying expense transactions.
4. UI shows usage percentage and exceeded state.

### Recurring transaction
1. User defines template and recurrence.
2. Scheduler/process identifies due occurrences idempotently.
3. System creates each occurrence at most once.
4. User can pause/resume recurring rule.

### Bill
User tracks due date, expected amount, account/category and payment status.

### Goal
User sets target amount and optional target date and records contributions or links goal progress to supported account data as defined by implementation.

## MVP functional requirements

### Authentication
- Register
- Login
- Logout
- Forgot/reset password
- Session management
- Email verification capability
- Change password
- Profile

### Dashboard
- Current balance summary
- Income this period
- Expenses this period
- Net cash flow
- Income-vs-expense trend
- Expense category breakdown
- Budget status
- Recent transactions
- Upcoming bills

### Accounts
- Create
- Edit
- Archive
- List
- Account detail
- Opening balance
- Derived current balance

Initial account types:
- cash
- bank
- wallet
- credit_card
- savings
- other

### Categories
- Seed defaults
- User-defined categories
- Income and expense category types
- Archive category
- Optional icon and colour token

### Transactions
- Income
- Expense
- Transfer
- CRUD where business rules permit
- Search
- Filter
- Sort
- Pagination
- Date range
- Tags
- Merchant
- Notes

### Budget
- Overall budget
- Category budget
- Monthly first
- Weekly/yearly/custom can follow if time permits

### Recurring
- Income and expense recurring rules
- Daily/weekly/monthly/yearly/custom interval
- Pause/resume
- Next run
- Occurrence history

### Bills
- Upcoming
- Paid
- Overdue
- Skipped
- Reminder metadata

### Goals
- Create/edit/archive
- Target
- Contributions
- Progress

### Reports
- Date range
- Income/expense summary
- Category breakdown
- Account breakdown
- CSV export
- PDF/Excel later unless implemented cleanly

### Calendar
- Transaction indicators by date
- Bill due dates
- Recurring due events

### Settings
- Name
- Currency
- Timezone
- Date display
- Theme
- Security settings

## Non-functional requirements

### Security
See `06-AUTH-SECURITY.md`.

### Performance
- Paginate large lists.
- Avoid loading all transactions client-side.
- Index frequent query patterns.
- Aggregate on server/database.
- Avoid N+1 queries.
- Use caching only where correctness is maintained.

### Accessibility
Target WCAG 2.2 AA practices:
- keyboard accessible
- semantic labels/headings
- sufficient contrast
- visible focus
- form error association
- no colour-only meaning

### Responsive
Support:
- 360px+ mobile
- tablet
- desktop
- large desktop

### Reliability
Financial writes require deterministic validation and clear failure behaviour.

## Out of scope for initial MVP

- Live bank account aggregation
- Investment portfolio management
- Tax filing
- Credit scoring
- Lending
- Financial recommendations
- Automatic payment execution
- Multi-company accounting
