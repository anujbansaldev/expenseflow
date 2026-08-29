# Antigravity Final Code Review Prompt

Perform a senior production-readiness review of ExpenseFlow.

Do not start with cosmetic refactoring.

## Priority order

### 1. Security
Find:
- IDOR/cross-user data leaks
- missing auth
- client-controlled ownership
- NoSQL injection
- unsafe regex/query construction
- XSS/unsafe HTML
- CSRF weakness
- secret exposure
- insecure reset flow
- missing rate limiting
- unprotected cron/job endpoint
- dangerous upload/export behaviour

### 2. Financial correctness
Check:
- persisted floats
- parsing/rounding
- transfer accounting
- edit/delete recalculation
- budget inclusion
- recurring duplicates
- timezone period boundaries
- archived-resource behaviour

### 3. Data integrity
Check:
- missing indexes
- unsafe delete/cascade
- non-idempotent jobs
- weak uniqueness
- stale caches
- race conditions

### 4. Reliability
Check:
- error handling
- timeouts
- retries
- partial writes
- logging
- build/runtime assumptions

### 5. Performance
Check:
- unbounded queries
- N+1
- client-side full-ledger aggregation
- missing pagination
- expensive regex
- unnecessary client components

### 6. Accessibility/UX
Check:
- keyboard/focus
- form labels/errors
- loading/empty/error states
- mobile overflow
- destructive confirmation

### 7. Maintainability
Check:
- duplicated business rules
- route handlers containing DB/business logic
- unsafe `any`
- dead code
- inconsistent schemas/types

## Output

Produce findings ordered by severity:
- Critical
- High
- Medium
- Low

For each finding include:
- file/path
- issue
- impact
- concrete fix
- test required

Then fix Critical and High issues that can be safely resolved without changing product requirements.

Run all available quality checks and report actual results.
