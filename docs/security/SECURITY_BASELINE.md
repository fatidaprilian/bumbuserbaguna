# Security Baseline and Threat Controls

## 1. Security Objectives
1. Preserve confidentiality of uploaded academic documents.
2. Guarantee integrity of reports and similarity evidence.
3. Maintain service availability under abuse and spikes.
4. Ensure accountability with auditable user actions.

## 2. Core Threat Model
1. Unauthorized access to student documents.
2. Prompt and payload abuse to bypass validation.
3. API key leakage from third-party providers.
4. Malicious file uploads and parser exploitation.
5. Denial of service via burst uploads.

## 3. Required Controls
### Identity and Access
1. Use short-lived access tokens and rotating refresh tokens.
2. Enforce role-based access control server-side.
3. Require strong password hashing with argon2id.
4. Support institution-level tenant isolation.

### Input and File Security
1. Validate all request bodies, query params, and headers.
2. Validate file MIME type and extension server-side.
3. Cap upload size by plan tier and endpoint.
4. Store files with randomized names outside public path.
5. Run antivirus scan for uploaded files when available.

### API and Transport
1. Enforce HTTPS only and HSTS.
2. Use strict security headers and CSP policy.
3. Apply rate limits per IP, user, and tenant.
4. Use idempotency keys for critical mutations.

### Data Protection
1. Encrypt database volumes and object storage at rest.
2. Encrypt secrets using managed secret store.
3. Never log full document content in plaintext.
4. Apply data retention windows and secure deletion jobs.

## 4. Multi-Tenant Isolation Rules
1. Every query and object key must include tenant scope.
2. Never infer tenant from client payload only.
3. Enforce tenant checks at service boundary and repository filter.
4. Test cross-tenant access denial in integration tests.

## 5. Incident and Abuse Readiness
1. Create incident severity matrix and response owners.
2. Trigger alerts on auth anomalies and upload spikes.
3. Keep immutable audit logs for admin actions.
4. Add temporary lockout policy for repeated auth failures.

## 6. Security Checklist Before Production
1. Secrets rotation tested.
2. Dependency vulnerability scan clean or accepted with waiver.
3. Pen-test for upload and authorization flow completed.
4. Backup and restore test passed.
5. DR runbook reviewed by team.
