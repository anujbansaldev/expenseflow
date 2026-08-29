# Phase 9 Prompt — UI Quality, Accessibility and Performance

Do not change financial semantics in this phase unless fixing a confirmed defect.

## Responsive review

Check:
- 360px mobile
- tablet
- desktop
- large desktop

Fix overflow, inaccessible actions, unstable charts and awkward forms.

## Accessibility

Review:
- keyboard navigation
- focus
- dialogs/sheets
- labels
- errors
- heading structure
- contrast
- touch targets
- reduced motion
- chart textual meaning

## UX completeness

Each module:
- loading
- empty
- error
- success feedback
- destructive confirmation
- retry where useful

## Performance

Review:
- N+1 queries
- unbounded Mongo queries
- pagination
- aggregation indexes
- client bundle size
- unnecessary client components
- large chart payloads
- layout shift

## Verification

Run:
- lint
- typecheck
- all unit/integration tests
- E2E
- production build

Use browser verification for core journeys if available.

Document any remaining performance/security debt.
