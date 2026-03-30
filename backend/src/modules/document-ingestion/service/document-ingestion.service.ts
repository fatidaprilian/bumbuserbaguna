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
  public enqueueDocumentIngestion(command: UploadDocumentCommand): DocumentIngestionResult {
    return {
      documentId: `doc_${command.userId}`,
      documentVersionId: "version_placeholder",
      processingJobId: "job_placeholder",
    };
  }
}
