# Logging, Audit and Observability

## Objectives

Detect:
- runtime failures
- authentication abuse
- slow financial queries
- recurrence failures
- export abuse
- unexpected authorization denials
- production regressions

## Application logging

Use structured logs.

Recommended fields:
- timestamp
- level
- environment
- requestId
- operation
- route
- outcome
- durationMs
- safe error code

Do not store secrets or raw authentication credentials.

## Audit events

Record security/domain events such as:
- login success/failure summary
- password changed
- password reset completed
- account archived/restored
- transaction created/edited/deleted
- export requested
- recurring rule changed
- profile/security settings changed

Audit logs should not become a second copy of every financial note.

## Metrics

Useful:
- request latency
- error rate
- DB query latency
- auth failures
- transaction mutations
- recurrence run duration
- recurrence occurrences created
- scheduler failures

## Alerting

Production alerts:
- sustained elevated 5xx
- scheduler failure
- database connectivity incident
- auth anomaly threshold if tooling supports it

## Privacy

Define retention before storing IP/user-agent metadata.

Where full IP is unnecessary, hash or truncate according to privacy requirements.
