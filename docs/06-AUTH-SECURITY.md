# Authentication and Security Specification

## Security model

The server is the security boundary.

Client state, hidden controls, URL parameters and request bodies are untrusted.

## Authentication

Use a maintained authentication solution integrated with Next.js.

If credentials authentication is supported:
- normalize email
- use adaptive password hashing
- reject weak/oversized input
- generic login failure messages
- throttle repeated failures
- do not reveal whether an account exists during password reset

Optional OAuth providers may be added later.

## Session

Use secure cookies:
- HttpOnly
- Secure in production
- SameSite based on flow
- suitable expiry/rotation

Sensitive settings pages may require recent authentication.

## Authorization

Core invariant:

> A user can read or mutate only resources owned by that same authenticated user, unless a future explicit sharing model grants permission.

Bad:
```ts
Transaction.findById(id)
```

Required pattern:
```ts
Transaction.findOne({ _id: id, userId: auth.user.id })
```

Also validate ownership of referenced:
- accounts
- destination account
- category
- budget category
- bill account/category
- goal

Never trust `userId` from request body.

## Validation

Zod at all server input boundaries.

Validate:
- string lengths
- enum values
- ObjectId format
- amount decimal format before conversion
- positive amounts
- allowed dates
- date ranges
- pagination caps
- tag counts and lengths
- merchant/note lengths
- allowed currency
- timezone identifier where possible

## Injection

Do not pass arbitrary client objects into MongoDB filters.

Build filters from whitelisted parsed fields.

Do not allow raw Mongo operators from request query/body.

Avoid dynamic field names unless whitelisted.

## XSS

React escaping should remain enabled.

Do not render user content with `dangerouslySetInnerHTML`.

If rich text is ever introduced, sanitize with a dedicated allowlist sanitizer.

## CSRF

Cookie-authenticated state-changing requests require an explicit CSRF strategy appropriate to the chosen authentication/mutation method.

Do not assume SameSite alone solves every cross-site request scenario.

## Rate limiting

At minimum:
- login
- register
- forgot password
- reset password
- verification resend
- exports
- attachment upload
- expensive analytics endpoints if abuse is possible

Use user + IP-based keys as appropriate, respecting proxy configuration.

## Password reset

1. Generate cryptographically random token.
2. Store only token hash.
3. Store expiry.
4. Email raw token link.
5. On use, hash submitted token and compare.
6. Enforce single use.
7. Revoke/rotate relevant sessions after password change where feasible.

## Security headers

Configure appropriate:
- Content-Security-Policy
- Referrer-Policy
- X-Content-Type-Options
- frame restrictions via CSP
- Permissions-Policy as appropriate
- HSTS on HTTPS production

Do not add a CSP that breaks application scripts and then disable it globally.

## Logging

Never log:
- password
- password hash
- raw verification/reset token
- session token
- AUTH_SECRET
- MONGODB_URI
- SMTP password
- entire cookies/authorization headers

## Secrets

Use environment variables or managed secret storage.

`.env*` containing secrets must be ignored.

Commit only `.env.example`.

## Enumeration

Authentication and password recovery messages should not disclose unnecessary account existence.

For user-owned resource IDs, 404 is generally safer than exposing another user's resource existence.

## File uploads — future

When receipt uploads are enabled:
- server-side auth
- explicit MIME allowlist
- extension validation
- file signature validation where practical
- size limit
- generated storage key
- never execute user content
- private or signed access where receipts are sensitive
- malware scanning depending on storage/workflow
- remove EXIF if privacy policy requires it

## CSV export

Protect against CSV/spreadsheet formula injection for text fields.

## Dependencies

- use lockfile
- audit dependencies
- avoid abandoned security packages
- patch security updates
- do not blindly auto-upgrade major versions in production

## Backup/security operations

For production:
- MongoDB Atlas backups appropriate to plan
- least-privileged DB user
- network access controls
- TLS
- separate dev/staging/prod credentials
- documented restore procedure
