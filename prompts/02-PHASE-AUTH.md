# Phase 2 Prompt — Authentication and Onboarding

Implement secure authentication and onboarding.

Read the auth/security and database docs before coding.

## Deliver

- User model
- UserSettings model
- selected maintained Next.js auth integration
- credentials registration/login if selected
- logout
- forgot password
- reset password
- verification capability
- protected authenticated layout
- profile/session helper for server
- onboarding:
  - name if required
  - base currency (INR default)
  - timezone
  - first account
  - default categories

## Requirements

- normalize email
- password hash, never plaintext
- safe generic auth failures
- reset tokens random, hashed at rest, expiring, single-use
- rate limit auth-sensitive actions
- cookies secure in production
- no client-provided user ID trust
- redirect authenticated/unauthed users appropriately without loops

## Tests

- register success/validation
- duplicate email behaviour
- login
- wrong password
- protected route
- reset token expiry/single use
- User A cannot access a route as User B through IDs where applicable

Run lint/typecheck/tests/build.

Report exactly what was verified.
