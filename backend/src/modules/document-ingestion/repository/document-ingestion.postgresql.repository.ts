import type { DatabaseQueryExecutor } from "../../../shared/database/postgresql-client.ts";
import type {
  DocumentIngestionRepository,
  PersistedDocumentVersion,
} from "./document-ingestion.repository-contract.ts";

interface DocumentRow {
  document_id: string;
}

interface DocumentVersionRow {
  document_version_id: string;
}

export class PostgresqlDocumentIngestionRepository implements DocumentIngestionRepository {
  constructor(private readonly databaseClient: DatabaseQueryExecutor) {}

  public async createDocumentVersion(
    tenantId: string,
    userId: string,
    assignmentType: "report" | "paper" | "presentation",
    fileName: string,
    mimeType: string,
    fileSizeBytes: number,
  ): Promise<PersistedDocumentVersion> {
    // Step 1: Create the parent document record
    const documentInsertResult = await this.databaseClient.query<DocumentRow>(
      `INSERT INTO documents (institution_id, owner_user_id, assignment_type, original_file_name, current_status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING document_id`,
      [tenantId, userId, assignmentType, fileName],
    );

    const documentRow = documentInsertResult.rows[0];
    if (!documentRow) {
      throw new Error(
        "[DocumentIngestionRepository] documents INSERT returned no rows — unexpected state",
      );
    }

    // Step 2: Create the immutable version snapshot
    // Storage path is a placeholder until the real upload service assigns a signed URL
    const storagePath = `${tenantId}/${documentRow.document_id}/${Date.now()}-${fileName}`;
    const sourceChecksum = "pending"; // Will be updated after file transfer completes

    const versionInsertResult = await this.databaseClient.query<DocumentVersionRow>(
      `INSERT INTO document_versions (document_id, storage_path, mime_type, file_size_bytes, source_checksum)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING document_version_id`,
      [documentRow.document_id, storagePath, mimeType, fileSizeBytes, sourceChecksum],
    );

    const versionRow = versionInsertResult.rows[0];
    if (!versionRow) {
      throw new Error(
        "[DocumentIngestionRepository] document_versions INSERT returned no rows — unexpected state",
      );
    }

    return {
      documentId: documentRow.document_id,
      documentVersionId: versionRow.document_version_id,
      storagePath,
    };
  }
}
