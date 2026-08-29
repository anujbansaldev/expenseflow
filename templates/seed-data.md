# Default Seed Data

Seed per user during onboarding, not as globally shared mutable records.

## Expense categories

- Food
  - Restaurant
  - Groceries
  - Delivery
- Housing
  - Rent
  - Maintenance
- Utilities
  - Electricity
  - Internet
  - Mobile
- Transport
  - Fuel
  - Public Transport
  - Cab
- Shopping
- Healthcare
- Education
- Entertainment
- Subscriptions
- Insurance
- EMI
- Personal Care
- Travel
- Gifts
- Business
- Other

## Income categories

- Salary
- Business
- Freelance
- Interest
- Rental
- Refund
- Bonus
- Other

## Test fixture

User A:
- Cash opening ₹5,000
- Bank opening ₹10,000
- Income Salary ₹50,000
- Expense Rent ₹15,000
- Expense Food ₹2,500
- Transfer Bank -> Cash ₹2,000

Expected aggregate cash flow:
- income ₹50,000
- expense ₹17,500
- transfer excluded
- net cash flow ₹32,500

Use deterministic dates in tests rather than current date.
