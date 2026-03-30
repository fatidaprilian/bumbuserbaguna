import type { DatabaseClient } from "../../../shared/database/postgresql-client";
import { ApplicationError } from "../../../shared/errors/application-error";
import type {
  PlagiarismAnalysisRepository,
  SimilarityMatchEvidence,
} from "./plagiarism-analysis.repository-contract";

interface SimilarityEvidenceRow {
  source_document_id: string;
  similarity_ratio: string;
  matched_segment_count: number;
}

interface ReportIdentifierRow {
  plagiarism_report_id: string;
}

export class PostgresqlPlagiarismAnalysisRepository implements PlagiarismAnalysisRepository {
  constructor(private readonly databaseClient: DatabaseClient) {}

  public async fetchSimilarityEvidence(
    tenantId: string,
    documentId: string,
  ): Promise<SimilarityMatchEvidence[]> {
    const evidenceQueryResult = await this.databaseClient.query<SimilarityEvidenceRow>(
      `SELECT
         COALESCE(source_document_id::text, '') AS source_document_id,
         COALESCE(similarity_ratio::text, '0') AS similarity_ratio,
         COUNT(*)::int AS matched_segment_count
       FROM plagiarism_matches
       WHERE plagiarism_report_id IN (
         SELECT plagiarism_report_id
         FROM plagiarism_reports
         WHERE institution_id = $1::uuid
           AND document_id = $2::uuid
       )
       GROUP BY source_document_id, similarity_ratio
       ORDER BY similarity_ratio DESC
       LIMIT 100`,
      [tenantId, documentId],
    );

    return evidenceQueryResult.rows.map((resultRow) => ({
      sourceDocumentId: resultRow.source_document_id,
      similarityRatio: Number(resultRow.similarity_ratio),
      matchedSegmentCount: resultRow.matched_segment_count,
    }));
  }

  public async savePlagiarismReport(
    tenantId: string,
    documentId: string,
    similarityScore: number,
    requiresManualReview: boolean,
  ): Promise<string> {
    const insertResult = await this.databaseClient.query<ReportIdentifierRow>(
      `INSERT INTO plagiarism_reports (
         plagiarism_report_id,
         institution_id,
         document_id,
         similarity_score,
         requires_manual_review
       ) VALUES (gen_random_uuid(), $1::uuid, $2::uuid, $3, $4)
       RETURNING plagiarism_report_id::text`,
      [tenantId, documentId, similarityScore, requiresManualReview],
    );

    const insertedReportRow = insertResult.rows[0];
    if (!insertedReportRow) {
      throw new ApplicationError("INTERNAL_ERROR", "Failed to create plagiarism report");
    }

    return insertedReportRow.plagiarism_report_id;
  }
}
