# AI Strategy: Cost, Limits, and Independence

## 1. Goal
Build an AI-assisted plagiarism platform without hard dependency on one external provider.

## 2. Strategy Choice
Use a hybrid model:
1. Primary: self-hosted open-weight models for core similarity workflows.
2. Secondary: third-party API fallback for overflow and failover.
3. Control plane: internal AI Gateway abstraction.

## 3. AI Gateway Responsibilities
1. Provider routing and fallback policy.
2. Quota enforcement per user, institution, and plan.
3. Request budget tracking and cost guardrails.
4. Response normalization into one internal schema.
5. Caching and deduplication of repeated prompts/tasks.

## 4. Avoiding Vendor Lock-In
1. Define provider adapter interface.
2. Keep prompt templates and policies versioned in repo.
3. Ban direct provider SDK calls from business modules.
4. Support minimum two adapters from day one.

## 5. Self-Hosted AI Path
1. Start with embedding model and reranker suitable for Indonesian plus English text.
2. Deploy inference service with autoscaling and queue buffering.
3. Track GPU and throughput utilization metrics.
4. Implement timeout and degraded mode to lexical-only analysis.

## 6. Third-Party API Path
1. Use only behind AI Gateway.
2. Set strict timeout and retry policy.
3. Apply monthly spend caps with hard stop and alerts.
4. Remove raw student text from logs and monitoring payloads.

## 7. Quality and Safety Controls
1. Establish benchmark corpus for Indonesian academic text.
2. Track precision and recall for exact vs paraphrase detection.
3. Classify confidence tiers in report output.
4. Require human review path for borderline high-stakes results.

## 8. Reliability Controls
1. Circuit breaker per provider.
2. Dead-letter queue for failed AI tasks.
3. Backpressure when queue latency crosses threshold.
4. Fallback ranking pipeline when semantic model unavailable.

## 9. Cost Controls
1. Cache embeddings by document hash.
2. Reuse chunk-level vectors across re-checks.
3. Apply per-plan max page and token budgets.
4. Use asynchronous batch processing for expensive operations.

## 10. Implementation Phases
1. Phase 1: lexical matching and rule-based citation checks.
2. Phase 2: semantic embeddings with self-host inference.
3. Phase 3: cross-language support and adaptive model routing.
