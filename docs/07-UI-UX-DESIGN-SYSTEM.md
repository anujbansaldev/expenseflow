# UI/UX and Design System

## Direction

Create a clean financial productivity interface. It should feel calm, trustworthy and data-focused.

Avoid:
- overuse of cards
- excessive gradients
- tiny low-contrast text
- decorative charts without labels
- dashboard clutter
- generic AI/SaaS visual noise

## Application shell

Desktop:
- collapsible left sidebar
- top header
- content area
- contextual primary action

Mobile:
- compact header
- bottom navigation for primary destinations
- central Add action
- drawers/sheets for filters and forms where appropriate

## Navigation

Desktop:
- Overview
- Transactions
- Accounts
- Categories
- Budgets
- Recurring
- Bills
- Goals
- Analytics
- Reports
- Calendar
- Settings

Mobile primary:
- Home
- Transactions
- Add
- Analytics
- Profile

Secondary sections live in menu.

## Dashboard

Top:
- greeting/date range control
- Add transaction button

Summary:
- total account balance
- income
- expenses
- net cash flow

Visualisations:
- income vs expense trend
- spending by category
- budget progress

Operational:
- recent transactions
- upcoming bills

## Transaction UX

Desktop:
- responsive data table
- sticky filter row when useful
- pagination
- action menu

Mobile:
- transaction list rows/cards
- clear amount and category
- swipe actions only if accessible alternatives remain

Quick Add:
- Expense
- Income
- Transfer

Transaction form:
1. type segmented control
2. amount as primary input
3. account
4. category/destination
5. date/time
6. merchant/description
7. optional notes/tags

## Money display

Default INR:
- negative expense: `−₹850.00`
- positive income: `+₹65,000.00`
- neutral transfer labelled Transfer

Colour is supplementary; use sign/icon/text too.

## Budget

Show:
- allocated amount
- spent
- remaining
- percentage
- period

States:
- normal
- warning threshold
- exceeded

Include text labels so status is not colour-only.

## Empty states

Every module needs meaningful empty state:
- explain value
- offer one primary action
- no fake analytics

Example:
`No transactions yet. Add your first income or expense to start tracking cash flow.`

## Loading

Use stable skeleton geometry to avoid layout shift.

Do not use full-page spinner for every interaction.

## Error states

User-facing errors:
- concise
- actionable
- non-technical

Server logs may contain safe technical context.

## Form behaviour

- visible labels
- required indicators
- inline errors
- preserve entered values after recoverable failures
- Enter/keyboard-friendly
- disable submit while in-flight
- prevent duplicate submissions
- confirm destructive actions

## Accessibility

- semantic HTML
- one logical h1 per page
- focus-visible styles
- keyboard accessible menus/dialogs
- dialog focus trap and restore
- ARIA only where semantic HTML is insufficient
- chart summaries/table equivalents where required
- minimum practical touch target sizes

## Responsive breakpoints

Design content-first:
- mobile: 360–767
- tablet: 768–1023
- desktop: 1024+

Do not rely on device-specific assumptions.

## Themes

Support light and dark modes after core UI is stable.

Use design tokens / CSS variables, not scattered literal values.

Tokens:
- background
- foreground
- muted
- border
- primary
- destructive
- warning
- positive
- chart series tokens

## Chart rules

- meaningful titles
- selected date range visible
- axis formatting
- tooltips
- empty-data state
- no misleading truncated comparison
- accessible textual summary

## Motion

Use subtle motion only for:
- sheet/dialog transitions
- list state changes
- chart transitions where useful

Respect `prefers-reduced-motion`.
