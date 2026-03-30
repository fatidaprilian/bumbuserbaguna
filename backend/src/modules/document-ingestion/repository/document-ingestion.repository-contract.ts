export interface PersistedDocumentVersion {
  documentId: string;
  documentVersionId: string;
  storagePath: string;
}

export interface DocumentIngestionRepository {
  createDocumentVersion(
    tenantId: string,
    userId: string,
    assignmentType: "report" | "paper" | "presentation",
    fileName: string,
    mimeType: string,
    fileSizeBytes: number,
  ): Promise<PersistedDocumentVersion>;
}
