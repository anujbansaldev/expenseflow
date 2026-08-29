# ExpenseFlow Production Deployment Guide & Runbook

This document provides end-to-end instructions for deploying, configuring, and operating **ExpenseFlow** in staging and production environments.

---

## 1. Architecture Overview

- **Frontend & API**: Next.js 15 App Router (Node.js 20+ runtime)
- **Database**: MongoDB 6.0+ (Mongoose ODM with replica set support)
- **Session Layer**: Encrypted Jose JWT session cookies (HTTP-Only, Secure, SameSite: Lax)
- **Ledger Invariant**: Integer minor unit persistence (`amountMinor`), zero floating-point math, UTC timestamp normalization

---

## 2. Environment Configuration

Create a `.env.production` file on your hosting provider with the following variables:

```bash
# App Configuration
NODE_ENV=production
APP_URL=https://expenseflow.yourdomain.com

# MongoDB Database Connection (Atlas or self-hosted replica set)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/expenseflow_prod?retryWrites=true&w=majority

# Authentication Session Secret (Generate with: openssl rand -base64 32)
AUTH_SECRET=your_32_character_minimum_random_secret_string

# Scheduled Recurrence Cron Authentication (Optional for external cron triggers)
CRON_SECRET=your_cron_job_secret_key_32_characters

# Transactional Email (Optional for password resets)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
EMAIL_FROM=ExpenseFlow <noreply@expenseflow.yourdomain.com>
```

---

## 3. Deployment Options

### Option A: Vercel (Recommended)

1. Connect your GitHub repository to Vercel.
2. In **Project Settings** > **Environment Variables**, add the production environment variables listed above.
3. Configure `vercel.json` for scheduled cron jobs:
```json
{
  "crons": [
    {
      "path": "/api/recurring/process",
      "schedule": "0 1 * * *"
    }
  ]
}
```
4. Deploy the `main` branch.

---

### Option B: Docker Container

Build and run using the production multi-stage Dockerfile:

```bash
# 1. Build image
docker build -t expenseflow:latest .

# 2. Run container
docker run -d \
  -p 3000:3000 \
  --name expenseflow-app \
  --env-file .env.production \
  expenseflow:latest
```

---

### Option C: Node.js Standalone Host (PM2 / Systemd)

```bash
# 1. Install dependencies
pnpm install --frozen-lockfile

# 2. Build production bundle
pnpm build

# 3. Start with PM2
pm2 start npm --name "expenseflow" -- start
```

---

## 4. Database Index Verification & Health Check

ExpenseFlow automatically creates and verifies indexes on startup:

- **Users**: Unique index on `{ email: 1 }`
- **Transactions**: Compound indexes on `{ userId: 1, occurredAt: -1 }`, `{ userId: 1, accountId: 1 }`, and sparse unique index on `{ userId: 1, recurringOccurrenceKey: 1 }`
- **Accounts**: Compound index on `{ userId: 1, isArchived: 1 }`
- **Budgets**: Compound index on `{ userId: 1, categoryId: 1, isActive: 1 }`
- **Recurring Rules**: Compound index on `{ userId: 1, isActive: 1, nextRunAt: 1 }`
- **Goals**: Compound index on `{ userId: 1, isArchived: 1 }`
- **Audit Logs**: Compound index on `{ userId: 1, createdAt: -1 }`

Verify database health anytime:
```bash
curl -i https://expenseflow.yourdomain.com/api/health
```

Expected response:
```json
{
  "data": {
    "status": "ok",
    "app": "ExpenseFlow",
    "version": "1.0.0",
    "environment": "production",
    "database": "connected",
    "timestamp": "2026-08-29T16:10:00.000Z"
  }
}
```

---

## 5. Automated Recurrence Schedulers

ExpenseFlow features an idempotent recurrence engine. To process scheduled recurring rules automatically:

### Via External Cron (cURL):
```bash
curl -X POST https://expenseflow.yourdomain.com/api/recurring/process \
  -H "Authorization: Bearer <CRON_SECRET>"
```

### Via GitHub Actions Workflow:
A recurring schedule can run daily via `.github/workflows/scheduled-rules.yml`.

---

## 6. Disaster Recovery & Backup Runbook

### Database Backup (Daily mongodump):
```bash
mongodump --uri="$MONGODB_URI" --archive="expenseflow_backup_$(date +%Y%m%d).gz" --gzip
```

### Database Restore:
```bash
mongorestore --uri="$MONGODB_URI" --archive="expenseflow_backup_YYYYMMDD.gz" --gzip --drop
```

---

## 7. Production Security Checklist

- [x] HTTPS enforced with HSTS (`Strict-Transport-Security`).
- [x] Anti-Clickjacking headers configured (`X-Frame-Options: DENY`).
- [x] Content-Security-Policy (CSP) active without wildcard scripts.
- [x] Zero floating-point math on ledger amounts (`amountMinor` integers).
- [x] Server-enforced `userId` authorization on every private database query.
- [x] CSV Formula Injection protection active on all exports.
- [x] Sensitive metadata scrubbed from security audit logs.
- [x] Adaptive bcrypt password hashing (`SALT_ROUNDS = 12`).
