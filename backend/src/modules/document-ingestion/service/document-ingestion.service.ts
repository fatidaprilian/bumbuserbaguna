import { createIdentifier } from "../../../shared/identifier";
import type { DocumentIngestionRepository } from "../repository/document-ingestion.repository-contract";

export interface UploadDocumentCommand {
  tenantId: string;
  userId: string;
  assignmentType: "report" | "paper" | "presentation";
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
}

export interface DocumentIngestionResult {
  documentId: string;
  documentVersionId: string;
  processingJobId: string;
}

export class DocumentIngestionService {
  constructor(private readonly documentIngestionRepository: DocumentIngestionRepository) {}

  public async enqueueDocumentIngestion(
    command: UploadDocumentCommand,
  ): Promise<DocumentIngestionResult> {
    const persistedDocumentVersion = await this.documentIngestionRepository.createDocumentVersion(
      command.tenantId,
      command.userId,
      command.assignmentType,
      command.fileName,
      command.mimeType,
      command.fileSizeBytes,
    );

    return {
      documentId: persistedDocumentVersion.documentId,
      documentVersionId: persistedDocumentVersion.documentVersionId,
      processingJobId: createIdentifier("job"),
    };
  }
}
