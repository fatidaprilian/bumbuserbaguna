export interface PersistedDocumentVersion {
  documentId: string;
  documentVersionId: string;
  storagePath: string;
}

export interface DocumentIngestionRepository {
  createDocumentVersion(
    tenantId: string,
    userId: string,
    fileName: string,
    mimeType: string,
    fileSizeBytes: number,
  ): Promise<PersistedDocumentVersion>;
}
