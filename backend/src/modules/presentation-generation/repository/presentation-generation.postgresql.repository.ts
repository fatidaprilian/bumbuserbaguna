import type { DatabaseClient } from "../../../shared/database/postgresql-client";
import { ApplicationError } from "../../../shared/errors/application-error";
import type { PresentationGenerationRepository } from "./presentation-generation.repository-contract";

interface PresentationJobIdentifierRow {
  presentation_job_id: string;
}

export class PostgresqlPresentationGenerationRepository
  implements PresentationGenerationRepository
{
  constructor(private readonly databaseClient: DatabaseClient) {}

  public async createPresentationJob(
    tenantId: string,
    userId: string,
    documentId: string,
    targetSlideCount: number,
    audienceLevel: string,
  ): Promise<string> {
    const creationResult = await this.databaseClient.query<PresentationJobIdentifierRow>(
      `INSERT INTO presentation_jobs (
         presentation_job_id,
         institution_id,
         document_id,
         target_slide_count,
         audience_level,
         job_status
       ) VALUES (gen_random_uuid(), $1::uuid, $2::uuid, $3, $4, $5)
       RETURNING presentation_job_id::text`,
      [tenantId, documentId, targetSlideCount, audienceLevel, "queued"],
    );

    void userId;

    const createdJobRow = creationResult.rows[0];
    if (!createdJobRow) {
      throw new ApplicationError("INTERNAL_ERROR", "Failed to create presentation job");
    }

    return createdJobRow.presentation_job_id;
  }
}
