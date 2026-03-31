import type { DatabaseQueryExecutor } from "../../../shared/database/postgresql-client.ts";
import type { PresentationGenerationRepository } from "./presentation-generation.repository-contract.ts";

interface PresentationJobRow {
  presentation_job_id: string;
}

export class PostgresqlPresentationGenerationRepository implements PresentationGenerationRepository {
  constructor(private readonly databaseClient: DatabaseQueryExecutor) {}

  public async createPresentationJob(
    tenantId: string,
    _userId: string,
    documentId: string,
    targetSlideCount: number,
    audienceLevel: string,
  ): Promise<string> {
    const queryResult = await this.databaseClient.query<PresentationJobRow>(
      `INSERT INTO presentation_jobs (institution_id, document_id, target_slide_count, audience_level, job_status)
       VALUES ($1, $2, $3, $4, 'queued')
       RETURNING presentation_job_id`,
      [tenantId, documentId, targetSlideCount, audienceLevel],
    );

    const presentationJobRow = queryResult.rows[0];
    if (!presentationJobRow) {
      throw new Error(
        "[PresentationGenerationRepository] presentation_jobs INSERT returned no rows — unexpected state",
      );
    }

    return presentationJobRow.presentation_job_id;
  }
}
