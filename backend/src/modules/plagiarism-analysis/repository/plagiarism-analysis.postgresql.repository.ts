import type { DatabaseQueryExecutor } from "../../../shared/database/postgresql-client.ts";
import type {
  PlagiarismAnalysisRepository,
  SimilarityMatchEvidence,
} from "./plagiarism-analysis.repository-contract.ts";

interface SimilarityMatchRow {
  source_document_id: string;
  similarity_ratio: string; // PostgreSQL NUMERIC returns as string
  matched_segment_count: string;
}

interface PlagiarismReportRow {
  plagiarism_report_id: string;
}

export class PostgresqlPlagiarismAnalysisRepository implements PlagiarismAnalysisRepository {
  constructor(private readonly databaseClient: DatabaseQueryExecutor) {}

  public async fetchSimilarityEvidence(
    tenantId: string,
    documentId: string,
  ): Promise<SimilarityMatchEvidence[]> {
    // Phase 1: Return empty evidence until semantic pipeline is wired (Phase 4)
    // Tenant scoping is enforced via the JOIN to documents (institution_id check)
    const queryResult = await this.databaseClient.query<SimilarityMatchRow>(
      `SELECT pm.source_document_id,
              pm.similarity_ratio,
              COUNT(*) AS matched_segment_count
       FROM plagiarism_matches pm
       JOIN plagiarism_reports pr ON pr.plagiarism_report_id = pm.plagiarism_report_id
       JOIN documents doc ON doc.document_id = pr.document_id
       WHERE pr.document_id = $1
         AND doc.institution_id = $2
       GROUP BY pm.source_document_id, pm.similarity_ratio
       ORDER BY pm.similarity_ratio DESC
       LIMIT 50`,
      [documentId, tenantId],
    );

    return queryResult.rows.map((similarityMatchRow) => ({
      sourceDocumentId: similarityMatchRow.source_document_id,
      similarityRatio: parseFloat(similarityMatchRow.similarity_ratio),
      matchedSegmentCount: parseInt(similarityMatchRow.matched_segment_count, 10),
    }));
  }

  public async savePlagiarismReport(
    tenantId: string,
    documentId: string,
    similarityScore: number,
    requiresManualReview: boolean,
  ): Promise<string> {
    const queryResult = await this.databaseClient.query<PlagiarismReportRow>(
      `INSERT INTO plagiarism_reports (institution_id, document_id, similarity_score, requires_manual_review)
       VALUES ($1, $2, $3, $4)
       RETURNING plagiarism_report_id`,
      [tenantId, documentId, similarityScore, requiresManualReview],
    );

    const reportRow = queryResult.rows[0];
    if (!reportRow) {
      throw new Error(
        "[PlagiarismAnalysisRepository] plagiarism_reports INSERT returned no rows — unexpected state",
      );
    }

    return reportRow.plagiarism_report_id;
  }
}
