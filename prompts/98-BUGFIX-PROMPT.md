# Antigravity Bug-Fix Prompt

Investigate and fix the reported ExpenseFlow defect.

## Process

1. Read `AGENTS.md`.
2. Reproduce the problem first where possible.
3. Identify root cause, not just symptom.
4. Check whether the defect can affect:
   - financial correctness
   - cross-user authorization
   - authentication
   - data loss
   - recurring duplicates
   - reporting totals
5. Add a regression test before or with the fix when practical.
6. Make the smallest safe fix.
7. Preserve unrelated behaviour.
8. Run targeted tests, lint and typecheck; build when relevant.
9. Report:
   - root cause
   - files changed
   - regression test
   - commands actually run
   - remaining risk

Never:
- remove validation to make the bug disappear
- disable TypeScript/lint
- swallow errors
- hardcode user/resource IDs
- mutate production data
- claim reproduction/testing without executing it
