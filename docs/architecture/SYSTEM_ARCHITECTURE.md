# System Architecture Blueprint

## 1. Architecture Style
Use a modular monolith for v1 with strict layering per module.

Layer order:
1. Transport: HTTP controllers and DTO boundaries.
2. Service: use-case orchestration and business policy.
3. Repository: persistence adapters and query models.
4. Domain: entities, value objects, and domain services.

## 2. Proposed Modules
1. identity-access
2. document-ingestion
3. text-normalization
4. similarity-analysis
5. report-generation
6. institution-admin
7. billing-quota
8. audit-observability

## 3. High-Level Flow
1. User uploads document.
2. Ingestion module validates and stores file metadata.
3. Async worker extracts text and normalizes chunks.
4. Similarity module runs lexical and semantic matching.
5. Result module persists evidence and score.
6. Report module renders downloadable output.

## 4. Integration Boundaries
1. No controller may call database directly.
2. Repositories are hidden behind interfaces.
3. Cross-module usage only through public service contracts.
4. Shared kernel contains common errors, logging, and config.

## 5. Recommended Stack (Enterprise-Ready)
1. Backend API: TypeScript with NestJS.
2. Worker pipeline: TypeScript workers with queue system.
3. Frontend: Next.js with React Query for server state.
4. Database: PostgreSQL.
5. Object storage: S3-compatible bucket.
6. Caching: Redis with explicit invalidation rules.
7. Search index: PostgreSQL full-text first, vector index optional phase 2.

## 6. Deployment Topology
1. API service instance group.
2. Worker service instance group.
3. PostgreSQL primary with backups.
4. Redis cache and queue broker.
5. Object storage bucket.
6. Monitoring stack: metrics, logs, traces.

## 7. Reliability Patterns
1. Queue-based async analysis to prevent API blocking.
2. Idempotency keys for upload and analysis creation.
3. Circuit breaker around AI provider adapters.
4. Retry only for transient failures with exponential backoff.
5. Dead-letter queue for failed analysis jobs.

## 8. Observability Requirements
1. Structured logs with trace_id and user_id.
2. Metrics: queue latency, analysis duration, error rate, cost per job.
3. Distributed tracing for request-to-worker lifecycle.
4. Alerting for provider failure and queue backlog.

## 9. API Design Principles
1. OpenAPI 3.1 must be source of truth.
2. Consistent error envelope with machine-readable code.
3. Pagination required for list endpoints.
4. Rate limit headers exposed to clients.

## 10. Migration Trigger to Microservices
Split only if at least two conditions are true:
1. Persistent deploy bottlenecks between teams.
2. One module requires significant independent scaling.
3. Fault isolation requirements cannot be satisfied in monolith.
4. Compliance boundary requires strict runtime separation.
