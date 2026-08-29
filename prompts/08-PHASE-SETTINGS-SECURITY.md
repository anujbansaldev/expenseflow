# Phase 8 Prompt — Settings, Security and Audit

Perform a security-focused implementation pass.

## Settings

- profile
- timezone
- base currency display policy
- locale/date format
- theme preference if implemented
- change password
- security/session view where supported

## Security

Implement/review:
- rate limiting
- CSRF approach
- security headers
- CSP appropriate to app
- auth cookie flags
- validation coverage
- authorization coverage
- safe errors
- secret handling
- query allowlists
- export limits

## Audit

Add safe audit events for:
- auth/security changes
- transaction mutations
- account archive/restore
- exports
- recurring rule mutation

Do not duplicate sensitive notes into audit logs.

## Attack review

Explicitly test:
- IDOR
- NoSQL/operator injection
- XSS through text fields
- oversized inputs
- malformed ObjectId
- brute-force sensitive routes
- CSRF-sensitive flows based on chosen auth/mutation implementation

Run complete quality gate.
