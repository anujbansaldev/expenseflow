# 💰 ExpenseFlow — Production Financial Ledger & Analytics

ExpenseFlow is a senior-grade, full-stack personal finance application built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **MongoDB / Mongoose**, and **Recharts**.

Designed with strict financial accounting standards, ExpenseFlow uses integer minor units for all balances and transactions to completely eliminate floating-point rounding errors, enforces server-scoped tenant isolation, and provides automated recurring schedules, monthly category budget limits, savings milestones, and formula-injection-safe analytical exports.

---

## ✨ Key Features

- **Double-Entry Financial Ledger**: Real-time derived account balances, multi-account atomic transfers, income and expense categorization.
- **Strict Minor Unit Math**: All monetary amounts are persisted as integer minor units (`amountMinor`) with zero floating-point arithmetic.
- **Analytics & Real-Time Dashboard**: MongoDB `$group` aggregation pipelines powering cash flow area charts, category expense donuts, and monthly delta KPI tiles.
- **Category Budgets & Alerts**: Real-time month-to-date spending calculation with dynamic warning (`≥ 80%`) and exceeded (`> 100%`) status badges.
- **Idempotent Recurring Automation**: Daily, weekly, monthly, and yearly recurring schedules with unique occurrence keys preventing duplicate transactions on scheduler retries.
- **Bill Due-Date Tracker**: Track upcoming and overdue bills, with atomic "Mark Paid" actions that automatically link expense entries into the ledger.
- **Savings Milestones & Goals**: Capital accumulation targets with progress bars, contribution audit logs, and days-remaining countdowns.
- **Interactive Financial Calendar**: Month-by-month financial event calendar grouping income cash-ins, expense outflows, bill due dates, and routine schedules.
- **Analytical Reports & Safe CSV Export**: Custom date-range breakdowns with spreadsheet formula injection protection (neutralizing `=`, `+`, `-`, `@` triggers).
- **Hardened Security & Audit**: Jose session JWTs, adaptive bcrypt password hashing, sliding-window rate limiting, HTTP security headers (CSP, HSTS, X-Frame-Options), and scrubbed security audit trails.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, Server Components & Route Handlers) |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS & Lucide Icons |
| **Database** | MongoDB & Mongoose ODM |
| **Validation** | Zod Schema Validation |
| **Charts** | Recharts (Responsive Cash Flow & Category Donut) |
| **Dates** | date-fns |
| **Security** | Jose JWT, Bcrypt.js, Web Crypto SHA-256 |
| **Testing** | Vitest Test Runner (69+ Unit, Fixture & Security Tests) |
| **Package Manager** | pnpm |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or higher
- pnpm (`npm install -g pnpm`)
- MongoDB instance (local or MongoDB Atlas)

### Installation

1. **Clone the repository**:
   ```bash
   git clone git@github.com:anujbansaldev/expenseflow.git
   cd expenseflow
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Set `MONGODB_URI` and `AUTH_SECRET` in `.env.local`.

4. **Start the development server**:
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Quality Verification

Run the automated test suite covering financial arithmetic, atomic transfers, idempotency, calendar bounding, CSV formula injection defense, and security attack simulations:

```bash
# Run Vitest test suite
pnpm test

# Run strict TypeScript type checking
pnpm typecheck

# Build optimized production bundle
pnpm build
```

---

## 📖 Deployment & Runbooks

For detailed staging and production deployment instructions, Docker containerization, Vercel cron scheduling, and database disaster recovery runbooks, refer to [DEPLOYMENT.md](file:///c:/Users/anujb/Documents/Portfolio%20Projects/Standalone%20Apps/5.Expense%20Tracker/03%20ExpenseFlow-Antigravity-Build-Kit/DEPLOYMENT.md).

---

## 📄 License
MIT
