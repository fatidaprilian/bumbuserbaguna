# Product Research: Bumbuserbaguna Plagiarism Platform

## 1. Problem Statement
Students and educators need fast, fair, and privacy-aware plagiarism checks that work for Indonesian education levels (SMP, SMA/SMK, and university). Existing tools are often expensive, opaque, or dependent on external AI APIs with unpredictable limits.

## 2. Target Users
1. SMP students: basic writing support and citation awareness.
2. SMA/SMK students: assignment similarity checks and report exports.
3. University students: thesis and paper-level checks with deeper analysis.
4. Teachers and lecturers: class-level monitoring, feedback, and audit history.
5. School or campus admins: policy controls, quotas, and compliance oversight.

## 3. Core Jobs to Be Done
1. Validate originality before submission.
2. Detect exact and paraphrased similarity.
3. Teach users how to improve citations and rewriting.
4. Produce evidence-based reports for academic review.

## 4. Product Pillars
1. Accuracy: combine lexical and semantic matching.
2. Transparency: show explainable match segments, not only a single score.
3. Privacy: protect student documents by design.
4. Reliability: maintain service quality even when AI providers are degraded.
5. Accessibility: support school-to-campus workflows with simple UX.

## 5. Feature Scope
### Basic MVP
1. Upload PDF, DOCX, TXT.
2. Similarity score with matched snippets.
3. Downloadable report (PDF).
4. Simple citation checker.
5. User dashboard with document history.

### Advanced
1. Semantic similarity for paraphrasing patterns.
2. Cross-language similarity (Bahasa Indonesia and English).
3. AI writing signal indicator (advisory, not final verdict).
4. Class management dashboard for teachers.
5. API access for institutional LMS integration.

## 6. Non-Functional Requirements
1. Security: OWASP ASVS baseline and strict input validation.
2. Performance: p95 API under 500 ms for metadata operations.
3. Scalability: asynchronous analysis pipeline for large files.
4. Availability: graceful degradation if AI providers fail.
5. Auditability: immutable audit logs for key actions.

## 7. Risks and Mitigation
1. False positives: provide confidence bands and manual review mode.
2. Privacy concerns: configurable retention and private corpus mode.
3. AI API limits: use internal gateway with multi-provider fallback.
4. Cost spikes: apply quotas, caching, and usage budgets.
5. Abuse uploads: per-user rate limit and file type controls.

## 8. Success Metrics
1. First report generated in under 2 minutes for 10-page documents.
2. At least 95 percent successful analysis jobs per day.
3. User retention after first month above 35 percent for student tier.
4. False positive dispute rate below 5 percent.
5. AI cost per report controlled under predefined budget threshold.

## 9. Scope Exclusions (Initial)
1. Final legal plagiarism verdict automation.
2. Deep stylometric forensics for legal cases.
3. Full multilingual support beyond Indonesian and English.

## 10. Release Recommendation
Start as a modular monolith with clean module boundaries. Move to microservices only after measurable scaling or team-coupling triggers are reached.
