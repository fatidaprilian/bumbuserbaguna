# Database Architecture Plan

## 1. Engine Selection
Primary relational database: PostgreSQL.

Reasoning:
1. ACID guarantees for report integrity.
2. Mature indexing and full-text support.
3. Strong ecosystem for migration and backup tooling.

## 2. Core Entities
1. users
2. institutions
3. memberships
4. documents
5. document_versions
6. document_chunks
7. comparison_jobs
8. similarity_matches
9. similarity_reports
10. usage_quotas
11. audit_events

## 3. Relational Principles
1. Default to third normal form.
2. Use UUID primary keys.
3. Index all foreign keys.
4. Add composite indexes based on read paths.
5. Never use select-all in production queries.

## 4. Suggested Table Responsibilities
1. documents: ownership, source metadata, storage pointer.
2. document_versions: immutable snapshot for each upload revision.
3. document_chunks: normalized text chunks for similarity pipeline.
4. comparison_jobs: async workflow state and retry counters.
5. similarity_matches: evidence-level matched segments.
6. similarity_reports: user-facing aggregate summary.
7. usage_quotas: per-tier daily and monthly allowance.
8. audit_events: immutable trail of security-relevant actions.

## 5. Data Lifecycle
1. Upload creates document and version rows.
2. Worker writes normalized chunks.
3. Analysis writes comparison_jobs and similarity_matches.
4. Aggregator writes similarity_reports.
5. Retention job purges expired records by policy.

## 6. Retention and Privacy
1. Default retention configurable per institution.
2. Private mode excludes documents from shared corpus.
3. Soft delete for user-initiated removals, hard delete by retention worker.
4. Store deletion reason and actor for audit.

## 7. Performance Strategy
1. Cursor pagination for large list endpoints.
2. Partial indexes for active jobs and recent reports.
3. Batch inserts for chunk and match rows.
4. Read replicas optional after sustained high read load.

## 8. Migration Standards
1. Every schema change must have forward and rollback scripts.
2. Migration naming should be timestamped and descriptive.
3. Run migrations in CI against clean and existing snapshots.
4. Add post-migration validation queries.

## 9. Backup and Recovery
1. Daily full backups and frequent WAL archiving.
2. Point-in-time recovery tested quarterly.
3. Restore drills must include report integrity verification.

## 10. Example Query Guardrails
1. List endpoints require LIMIT and ORDER BY indexed columns.
2. Similarity evidence reads should filter by tenant and report id.
3. Analytics workloads should run from replica or warehouse pipeline.
