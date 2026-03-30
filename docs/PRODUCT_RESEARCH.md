# Product Research: Bumbuserbaguna Academic Productivity Platform

## 1. Problem Statement
Students and educators need an integrated academic assistant, not only plagiarism detection. They need end-to-end help from drafting, structure validation, citation support, presentation generation, and originality checks. Current tools are fragmented, expensive, and often dependent on external AI APIs with unpredictable limits.

## 2. Target Users
1. SMP students: basic writing support and citation awareness.
2. SMA/SMK students: assignment similarity checks and report exports.
3. University students: thesis and paper-level checks with deeper analysis.
4. Teachers and lecturers: class-level monitoring, feedback, and audit history.
5. School or campus admins: policy controls, quotas, and compliance oversight.

## 3. Core Jobs to Be Done
1. Draft assignments quickly with guided academic structure.
2. Validate originality before submission.
3. Detect exact, near-duplicate, and paraphrased similarity.
4. Improve citation quality and writing clarity.
5. Convert reports into presentation-ready materials.
6. Provide teachers with review evidence and class-level insights.

## 4. Product Pillars
1. Completeness: one platform with many academic tools from drafting to submission.
2. Accuracy: combine lexical and semantic matching where needed.
3. Transparency: show explainable evidence, not only opaque scores.
4. Privacy: protect student documents by design.
5. Reliability: maintain service quality even when AI providers are degraded.
6. Accessibility: support school-to-campus workflows with simple UX.

## 5. Tool Suite Scope
### Basic Tools (SMP and early SMA)
1. Grammar and readability checker for Bahasa Indonesia and English basics.
2. Automatic report structure checker based on assignment type.
3. Citation format helper for common templates.
4. Basic plagiarism scan with highlighted matched fragments.
5. Study summary generator from uploaded notes.

### Intermediate Tools (SMA/SMK and first-year university)
1. Advanced plagiarism report with source grouping.
2. Rewrite suggestions for flagged similarity segments.
3. Outline builder for reports, papers, and practical work.
4. Auto slide deck generator from report chapters.
5. Rubric-aware self-assessment before submission.

### Advanced Tools (University, teachers, and institutions)
1. Semantic and cross-language similarity detection.
2. Citation integrity checker with missing-reference warnings.
3. Class dashboard with assignment trends and risk alerts.
4. LMS integration API for automated submission workflows.
5. AI-assisted feedback workspace for educators.

## 6. Non-Functional Requirements
1. Security: OWASP ASVS baseline and strict input validation.
2. Performance: p95 API under 500 ms for metadata operations.
3. Scalability: asynchronous pipeline for large-file analysis and generation jobs.
4. Availability: graceful degradation if AI providers fail.
5. Auditability: immutable audit logs for key actions.

## 7. Risks and Mitigation
1. Tool sprawl confusion: use clear level-based onboarding and role-based tool access.
2. False positives: provide confidence bands and manual review mode.
3. Privacy concerns: configurable retention and private corpus mode.
4. AI API limits: use internal gateway with multi-provider fallback.
5. Cost spikes: apply quotas, caching, and usage budgets.
6. Abuse uploads: per-user rate limit and file type controls.

## 8. Success Metrics
1. First plagiarism report generated in under 2 minutes for 10-page documents.
2. First presentation draft generated in under 3 minutes for standard reports.
3. At least 95 percent successful async jobs per day across all tools.
4. User retention after first month above 35 percent for student tier.
5. False positive dispute rate below 5 percent.
6. AI cost per processed assignment controlled under predefined budget threshold.

## 9. Scope Exclusions (Initial)
1. Final legal plagiarism verdict automation.
2. Deep stylometric forensics for legal cases.
3. Full multilingual support beyond Indonesian and English.
4. Fully automatic final paper writing without user review.

## 10. Release Recommendation
Start as a modular monolith with clean module boundaries and tool-family ownership. Move to microservices only after measurable scaling or team-coupling triggers are reached.
