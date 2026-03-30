import type { DatabaseClient } from "../../../shared/database/postgresql-client";
import { ApplicationError } from "../../../shared/errors/application-error";
import type {
  DocumentIngestionRepository,
  PersistedDocumentVersion,
} from "./document-ingestion.repository-contract";

interface IdentifierRow {
  document_id: string;
  document_version_id: string;
}

export class PostgresqlDocumentIngestionRepository implements DocumentIngestionRepository {
  constructor(private readonly databaseClient: DatabaseClient) {}

  public async createDocumentVersion(
    tenantId: string,
    userId: string,
    assignmentType: "report" | "paper" | "presentation",
    fileName: string,
    mimeType: string,
    fileSizeBytes: number,
  ): Promise<PersistedDocumentVersion> {
    const insertedDocumentResult = await this.databaseClient.query<IdentifierRow>(
      `INSERT INTO documents (
         institution_id,
         owner_user_id,
         assignment_type,
         original_file_name,
         current_status
       ) VALUES ($1::uuid, $2::uuid, $3, $4, $5)
       RETURNING document_id::text`,
      [tenantId, userId, assignmentType, fileName, "uploaded"],
    );

    const insertedDocumentRow = insertedDocumentResult.rows[0];
    if (!insertedDocumentRow) {
      throw new ApplicationError("INTERNAL_ERROR", "Failed to create document record");
    }

    const documentId = insertedDocumentRow.document_id;
    const sourceChecksum = `${documentId}-${fileSizeBytes}`;
    const storagePath = `tenants/${tenantId}/documents/${documentId}/latest`;

    const insertedVersionResult = await this.databaseClient.query<IdentifierRow>(
      `INSERT INTO document_versions (
         document_id,
         storage_path,
         mime_type,
         file_size_bytes,
         source_checksum
       ) VALUES ($1::uuid, $2, $3, $4, $5)
       RETURNING document_id, document_version_id`,
      [documentId, storagePath, mimeType, fileSizeBytes, sourceChecksum],
    );

    const insertedVersion = insertedVersionResult.rows[0];
    if (!insertedVersion) {
      throw new ApplicationError("INTERNAL_ERROR", "Failed to create document version");
    }

    return {
      documentId: insertedVersion.document_id,
      documentVersionId: insertedVersion.document_version_id,
      storagePath,
    };
  }
}
