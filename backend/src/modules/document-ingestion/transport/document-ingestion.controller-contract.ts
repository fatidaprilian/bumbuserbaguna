export interface UploadDocumentRequestBody {
  assignmentType: "report" | "paper" | "presentation";
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
}

export interface UploadDocumentResponseBody {
  documentId: string;
  documentVersionId: string;
  processingJobId: string;
}
