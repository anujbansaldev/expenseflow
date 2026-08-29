# Recommended Project Tree

```text
expenseflow/
├─ src/
│  ├─ app/
│  │  ├─ (public)/
│  │  ├─ (auth)/
│  │  │  ├─ login/
│  │  │  ├─ register/
│  │  │  ├─ forgot-password/
│  │  │  └─ reset-password/
│  │  ├─ (dashboard)/
│  │  │  ├─ dashboard/
│  │  │  ├─ transactions/
│  │  │  ├─ accounts/
│  │  │  ├─ categories/
│  │  │  ├─ budgets/
│  │  │  ├─ recurring/
│  │  │  ├─ bills/
│  │  │  ├─ goals/
│  │  │  ├─ analytics/
│  │  │  ├─ reports/
│  │  │  ├─ calendar/
│  │  │  └─ settings/
│  │  ├─ api/
│  │  ├─ layout.tsx
│  │  └─ globals.css
│  ├─ components/
│  │  ├─ ui/
│  │  ├─ app-shell/
│  │  ├─ charts/
│  │  └─ shared/
│  ├─ features/
│  │  ├─ accounts/
│  │  ├─ categories/
│  │  ├─ transactions/
│  │  ├─ budgets/
│  │  ├─ recurring/
│  │  ├─ bills/
│  │  └─ goals/
│  ├─ lib/
│  │  ├─ db/
│  │  ├─ auth/
│  │  ├─ money/
│  │  ├─ dates/
│  │  ├─ errors/
│  │  ├─ logger/
│  │  └─ rate-limit/
│  ├─ models/
│  ├─ repositories/
│  ├─ services/
│  ├─ schemas/
│  ├─ types/
│  └─ config/
├─ tests/
│  ├─ unit/
│  ├─ integration/
│  └─ e2e/
├─ scripts/
├─ public/
├─ docs/
├─ .env.example
├─ AGENTS.md
├─ package.json
├─ pnpm-lock.yaml
└─ README.md
```

The agent may adapt exact folders to Next.js conventions, but must preserve separation of presentation, business logic and persistence.
